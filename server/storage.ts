import { 
  users, profiles, matches, conversations, messages, emotionalFeedback, reports, aiInteractions,
  type User, type InsertUser, type Profile, type InsertProfile, type Match, type InsertMatch,
  type Conversation, type Message, type InsertMessage, type EmotionalFeedback, type InsertEmotionalFeedback,
  type Report, type InsertReport, type AIInteraction, type OnboardingAnswers
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Profile methods
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  
  // Matching methods
  createMatch(match: InsertMatch): Promise<Match>;
  getMatches(userId: string): Promise<Match[]>;
  getCompatibleUsers(userId: string, limit?: number): Promise<User[]>;
  updateMatchStatus(matchId: string, updates: Partial<Match>): Promise<Match>;
  
  // Conversation methods
  getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined>;
  createConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  
  // Message methods
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  
  // Emotional feedback methods
  createEmotionalFeedback(feedback: InsertEmotionalFeedback): Promise<EmotionalFeedback>;
  getUserEmotionalFeedback(userId: string): Promise<EmotionalFeedback[]>;
  
  // Safety and reporting methods
  createReport(report: InsertReport): Promise<Report>;
  getReports(userId?: string): Promise<Report[]>;
  
  // AI interaction tracking
  saveAIInteraction(interaction: {
    userId: string;
    agentType: string;
    inputData: any;
    outputData: any;
    confidence?: number;
  }): Promise<AIInteraction>;
  
  // Onboarding
  completeOnboarding(userId: string, answers: OnboardingAnswers): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values([profile])
      .returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values([match])
      .returning();
    return newMatch;
  }

  async getMatches(userId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.userId, userId))
      .orderBy(desc(matches.createdAt));
  }

  async getCompatibleUsers(userId: string, limit = 10): Promise<User[]> {
    // Exclude users already matched or current user
    return await db
      .select()
      .from(users)
      .where(
        and(
          sql`${users.id} != ${userId}`,
          sql`${users.id} NOT IN (
            SELECT ${matches.matchedUserId} FROM ${matches} WHERE ${matches.userId} = ${userId}
          )`
        )
      )
      .limit(limit);
  }

  async updateMatchStatus(matchId: string, updates: Partial<Match>): Promise<Match> {
    const [match] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, matchId))
      .returning();
    return match;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.user1Id, user1Id), eq(conversations.user2Id, user2Id)),
          and(eq(conversations.user1Id, user2Id), eq(conversations.user2Id, user1Id))
        )
      );
    return conversation || undefined;
  }

  async createConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({ user1Id, user2Id })
      .returning();
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation's last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`
        )
      );
  }

  async createEmotionalFeedback(feedback: InsertEmotionalFeedback): Promise<EmotionalFeedback> {
    const [newFeedback] = await db
      .insert(emotionalFeedback)
      .values([feedback])
      .returning();
    return newFeedback;
  }

  async getUserEmotionalFeedback(userId: string): Promise<EmotionalFeedback[]> {
    return await db
      .select()
      .from(emotionalFeedback)
      .where(eq(emotionalFeedback.userId, userId))
      .orderBy(desc(emotionalFeedback.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReports(userId?: string): Promise<Report[]> {
    if (userId) {
      return await db
        .select()
        .from(reports)
        .where(eq(reports.reportedUserId, userId))
        .orderBy(desc(reports.createdAt));
    }
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async saveAIInteraction(interaction: {
    userId: string;
    agentType: string;
    inputData: any;
    outputData: any;
    confidence?: number;
  }): Promise<AIInteraction> {
    const [newInteraction] = await db
      .insert(aiInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async completeOnboarding(userId: string, answers: OnboardingAnswers): Promise<void> {
    // Update user emotion profile
    await this.updateUser(userId, {
      emotionProfile: {
        primaryEmotions: answers.happinessTriggers,
        happinessTriggers: answers.happinessTriggers,
        communicationStyle: answers.communicationStyle,
        relationshipGoals: answers.relationshipGoals,
      },
      isOnboardingComplete: true,
    });

    // Create or update profile with onboarding data
    const existingProfile = await this.getProfile(userId);
    if (existingProfile) {
      await this.updateProfile(userId, {
        interests: answers.interests,
        values: answers.values,
        lookingFor: answers.lookingFor,
      });
    } else {
      await db.insert(profiles).values({
        userId,
        interests: answers.interests,
        values: answers.values,
        lookingFor: answers.lookingFor,
      });
    }

    // Create or update profile
    const existingProfile = await this.getProfile(userId);
    if (existingProfile) {
      await this.updateProfile(userId, {
        interests: answers.interests,
        values: answers.values,
        lookingFor: answers.lookingFor,
      });
    } else {
      await this.createProfile({
        userId,
        interests: answers.interests,
        values: answers.values,
        lookingFor: answers.lookingFor,
      });
    }
  }
}

export const storage = new DatabaseStorage();
