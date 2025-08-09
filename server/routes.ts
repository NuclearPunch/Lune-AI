import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiAgents } from "./ai/agents";
import { openaiService } from "./ai/openai";
import { insertUserSchema, insertMessageSchema, insertReportSchema, onboardingAnswersSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Login error" });
    }
  });

  // User profile endpoints
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(user.id);
      res.json({ user, profile });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      res.json({ profile });
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  // Onboarding endpoint
  app.post("/api/onboarding/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const answers = onboardingAnswersSchema.parse(req.body);
      
      await storage.completeOnboarding(userId, answers);
      
      // Generate AI summary and embedding
      const profile = await storage.getProfile(userId);
      if (profile) {
        const summaryResult = await aiAgents.generateOnboardingSummary({
          bio: profile.lookingFor || undefined,
          tags: profile.interests || undefined
        });
        
        if (summaryResult.success) {
          await storage.updateProfile(userId, {
            aiSummary: summaryResult.data?.summary
          });
        }

        // Generate embedding for matching
        const embeddingText = await aiAgents.generateProfileEmbedding({
          bio: profile.lookingFor || undefined,
          tags: profile.interests || undefined,
          intro: summaryResult.data?.summary
        });
        
        const embedding = await openaiService.generateEmbedding(embeddingText);
        if (embedding) {
          await storage.updateProfile(userId, { embeddings: embedding });
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid onboarding data" });
    }
  });

  // Matching endpoints
  app.get("/api/matches/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const compatibleUsers = await storage.getCompatibleUsers(userId, 10);
      
      const enhancedMatches = [];
      
      for (const user of compatibleUsers) {
        const userProfile = await storage.getProfile(user.id);
        const currentUserProfile = await storage.getProfile(userId);
        
        if (userProfile && currentUserProfile) {
          // Generate compatibility score and reasons
          const reasonsResult = await aiAgents.generateMatchReasons(currentUserProfile, userProfile);
          const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100%
          
          const match = await storage.createMatch({
            userId,
            matchedUserId: user.id,
            compatibilityScore,
            matchReasons: reasonsResult.success ? reasonsResult.data : []
          });

          enhancedMatches.push({
            match,
            user,
            profile: userProfile
          });
        }
      }
      
      res.json({ matches: enhancedMatches });
    } catch (error) {
      res.status(500).json({ message: "Error fetching matches" });
    }
  });

  app.post("/api/matches/:matchId/like", async (req, res) => {
    try {
      const matchId = req.params.matchId;
      const match = await storage.updateMatchStatus(matchId, { isLiked: true });
      
      // Check if it's a mutual match
      const reverseMatches = await storage.getMatches(match.matchedUserId);
      const mutualMatch = reverseMatches.find(m => 
        m.matchedUserId === match.userId && m.isLiked
      );
      
      if (mutualMatch) {
        await storage.updateMatchStatus(matchId, { isMatched: true });
        await storage.updateMatchStatus(mutualMatch.id, { isMatched: true });
        
        // Create conversation
        await storage.createConversation(match.userId, match.matchedUserId);
      }
      
      res.json({ match, isMatched: !!mutualMatch });
    } catch (error) {
      res.status(500).json({ message: "Error updating match" });
    }
  });

  // Conversation endpoints
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json({ conversations });
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Safety filter
      const safetyResult = await aiAgents.filterSafety(messageData.content);
      if (safetyResult.success && safetyResult.data?.label !== 'safe') {
        return res.status(400).json({ 
          message: "Message not allowed", 
          suggestion: safetyResult.data?.alternative 
        });
      }

      // Analyze tone
      const toneResult = await aiAgents.classifyConversationTone(messageData.content);
      
      const message = await storage.createMessage({
        ...messageData,
        tone: toneResult.success ? toneResult.data?.tone : undefined
      });

      // Generate AI coaching suggestion
      const conversationHistory = await storage.getMessages(messageData.conversationId);
      const recentMessages = conversationHistory.slice(-3).map(m => m.content);
      
      const suggestionsResult = await aiAgents.generateNextMessageSuggestions(recentMessages);
      
      res.json({ 
        message, 
        aiSuggestions: suggestionsResult.success ? suggestionsResult.data : [] 
      });
    } catch (error) {
      res.status(400).json({ message: "Error sending message" });
    }
  });

  // AI coaching endpoints
  app.post("/api/ai/first-messages", async (req, res) => {
    try {
      const { viewerUserId, targetUserId } = req.body;
      
      const viewerProfile = await storage.getProfile(viewerUserId);
      const targetProfile = await storage.getProfile(targetUserId);
      
      if (!viewerProfile || !targetProfile) {
        return res.status(404).json({ message: "Profiles not found" });
      }
      
      const templates = await aiAgents.generateFirstMessageTemplates(viewerProfile, targetProfile);
      res.json({ templates: templates.success ? templates.data : [] });
    } catch (error) {
      res.status(500).json({ message: "Error generating message templates" });
    }
  });

  app.post("/api/ai/conversation-coach", async (req, res) => {
    try {
      const { conversationId, userIntent } = req.body;
      
      const messages = await storage.getMessages(conversationId);
      const recentMessages = messages.slice(-3).map(m => m.content);
      
      const suggestions = await aiAgents.generateNextMessageSuggestions(recentMessages, userIntent);
      res.json({ suggestions: suggestions.success ? suggestions.data : [] });
    } catch (error) {
      res.status(500).json({ message: "Error generating suggestions" });
    }
  });

  app.post("/api/ai/profile-suggestions", async (req, res) => {
    try {
      const { userId } = req.body;
      
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const suggestions = await aiAgents.generateProfileSuggestions(profile);
      res.json({ suggestions: suggestions.success ? suggestions.data : [] });
    } catch (error) {
      res.status(500).json({ message: "Error generating profile suggestions" });
    }
  });

  // Emotional feedback endpoints
  app.post("/api/feedback/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { matchId, dateExperience, feedback } = req.body;
      
      const emotionalFeedback = await storage.createEmotionalFeedback({
        userId,
        matchId,
        dateExperience,
        feedback
      });
      
      res.json({ feedback: emotionalFeedback });
    } catch (error) {
      res.status(500).json({ message: "Error saving feedback" });
    }
  });

  app.get("/api/feedback/:userId", async (req, res) => {
    try {
      const feedback = await storage.getUserEmotionalFeedback(req.params.userId);
      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: "Error fetching feedback" });
    }
  });

  // Safety and reporting endpoints
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      res.json({ report });
    } catch (error) {
      res.status(400).json({ message: "Error creating report" });
    }
  });

  // Activity suggestions
  app.post("/api/ai/activity-invite", async (req, res) => {
    try {
      const { sharedInterest, city } = req.body;
      const invites = await aiAgents.generateActivityInvite(sharedInterest, city);
      res.json({ invites: invites.success ? invites.data : [] });
    } catch (error) {
      res.status(500).json({ message: "Error generating activity invites" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_conversation') {
          (ws as any).conversationId = message.conversationId;
          (ws as any).userId = message.userId;
        }
        
        if (message.type === 'send_message') {
          // Broadcast message to conversation participants
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && 
                (client as any).conversationId === message.conversationId &&
                (client as any).userId !== message.senderId) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: message.data
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
