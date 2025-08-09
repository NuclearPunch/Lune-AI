import { openaiService, type AIAgentResponse } from "./openai";
import type { User, Profile } from "@shared/schema";

export class AIAgents {
  // Agent 1: onboarding_summary
  async generateOnboardingSummary(profile: { bio?: string; tags?: string[] }): Promise<AIAgentResponse<{
    summary: string;
    keywords: string[];
  }>> {
    const prompt = `Profile bio: "${profile.bio || ''}" and tags: ${JSON.stringify(profile.tags || [])}`;
    const systemMessage = "You are a friendly assistant. Summarize the user's profile (bio and tags) into one 1-sentence marketing-style summary (max 20 words) and generate 3 matching keywords.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ summary: string, keywords: string[] }"
    );
  }

  // Agent 2: profile_to_embedding
  async generateProfileEmbedding(profile: { bio?: string; tags?: string[]; intro?: string }): Promise<string> {
    const prompt = `Bio: "${profile.bio || ''}", Tags: ${JSON.stringify(profile.tags || [])}, Intro: "${profile.intro || ''}"`;
    const systemMessage = "Convert profile fields (bio + tags + one-line intro) into a single clean string suitable for embeddings. Remove emojis and filler words. Output plain text.";
    
    const response = await openaiService.callAgent(prompt, systemMessage);
    return response.success ? response.data?.text || "" : "";
  }

  // Agent 3: match_reasons
  async generateMatchReasons(profileA: Profile, profileB: Profile): Promise<AIAgentResponse<{
    reason: string;
    score: number;
  }[]>> {
    const prompt = `Profile A: interests=${JSON.stringify(profileA.interests)}, values=${JSON.stringify(profileA.values)}. Profile B: interests=${JSON.stringify(profileB.interests)}, values=${JSON.stringify(profileB.values)}.`;
    const systemMessage = "Given profile A and profile B, produce 2 short reasons (each 1 sentence) why they would be a good match. Include one shared interest and one complementary trait.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "[{ reason: string, score: number }]"
    );
  }

  // Agent 4: first_message_templates
  async generateFirstMessageTemplates(viewerProfile: Profile, targetProfile: Profile): Promise<AIAgentResponse<{
    tone: string;
    message: string;
    why: string;
  }[]>> {
    const prompt = `Viewer: interests=${JSON.stringify(viewerProfile.interests)}. Target: interests=${JSON.stringify(targetProfile.interests)}, bio="${targetProfile.aiSummary || ''}"`;
    const systemMessage = "Given viewer profile and target profile, produce 5 first-message templates with distinct tones: casual, humorous, curious, straightforward, activity-invite. Provide short explanation for each.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "[{ tone: string, message: string, why: string }]"
    );
  }

  // Agent 5: next_message_suggestions
  async generateNextMessageSuggestions(
    conversationHistory: string[], 
    userIntent?: string
  ): Promise<AIAgentResponse<{
    message: string;
    rationale: string;
  }[]>> {
    const prompt = `Last 3 messages: ${JSON.stringify(conversationHistory.slice(-3))}. User intent: ${userIntent || 'continue conversation naturally'}`;
    const systemMessage = "Given conversation history (last 3 messages) and user intent (tone preference), propose 3 next message options with brief rationale.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "[{ message: string, rationale: string }]"
    );
  }

  // Agent 6: conversation_tone
  async classifyConversationTone(message: string): Promise<AIAgentResponse<{
    tone: string;
    confidence: number;
  }>> {
    const systemMessage = "Classify the conversation sample into tones: friendly, flirtatious, neutral, hostile, playful.";
    
    return openaiService.callAgentWithStructuredOutput(
      message,
      systemMessage,
      "{ tone: string, confidence: number }"
    );
  }

  // Agent 7: safety_filter
  async filterSafety(text: string): Promise<AIAgentResponse<{
    label: string;
    confidence: number;
    alternative?: string;
  }>> {
    const systemMessage = "Classify the input text as safe, unsafe, sexual, abusive, or spam. If label is unsafe or sexual, include suggested safe alternative text.";
    
    return openaiService.callAgentWithStructuredOutput(
      text,
      systemMessage,
      "{ label: string, confidence: number, alternative?: string }"
    );
  }

  // Agent 8: profile_completion_suggestion
  async generateProfileSuggestions(profile: Profile): Promise<AIAgentResponse<string[]>> {
    const prompt = `Bio: "${profile.aiSummary || ''}", Interests: ${JSON.stringify(profile.interests)}, Values: ${JSON.stringify(profile.values)}`;
    const systemMessage = "Given user's profile (bio + tags), suggest 3 improvements to make it more engaging for matches (one-liner each).";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ suggestions: string[] }"
    );
  }

  // Agent 9: activity_invite_generator
  async generateActivityInvite(sharedInterest: string, city: string): Promise<AIAgentResponse<{
    message: string;
    time_suggestion: string;
  }[]>> {
    const prompt = `Shared interest: ${sharedInterest}, City: ${city}`;
    const systemMessage = "Given shared interest (e.g., tennis) and city, create 3 short activity-invite messages suitable as first invites (max 30 words). Include a time suggestion.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "[{ message: string, time_suggestion: string }]"
    );
  }

  // Agent 10: mutual_topics
  async extractMutualTopics(profile1: Profile, profile2: Profile): Promise<AIAgentResponse<string[]>> {
    const prompt = `Profile 1: interests=${JSON.stringify(profile1.interests)}, values=${JSON.stringify(profile1.values)}. Profile 2: interests=${JSON.stringify(profile2.interests)}, values=${JSON.stringify(profile2.values)}`;
    const systemMessage = "Given two profiles, extract up to 5 mutual or complementary topics/keywords that can be used as conversation openers.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ topics: string[] }"
    );
  }

  // Agent 11: photo_caption
  async generatePhotoCaption(activity: string): Promise<AIAgentResponse<string>> {
    const systemMessage = "Generate a friendly, authentic 1-line caption for a user's profile photo showing them doing X (e.g., surfing). Max 12 words.";
    
    return openaiService.callAgentWithStructuredOutput(
      `Activity: ${activity}`,
      systemMessage,
      "{ caption: string }"
    );
  }

  // Agent 12: match_score_explainer
  async explainMatchScore(score: number, features: string[]): Promise<AIAgentResponse<{
    explain: string;
  }>> {
    const prompt = `Score: ${score}, Features: ${JSON.stringify(features)}`;
    const systemMessage = "Given matching score (0-100) and features, produce a one-sentence explanation of why the score is high/low.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ explain: string }"
    );
  }

  // Agent 13: scheduling_helper
  async generateDateIdeas(city: string, preferences?: string[]): Promise<AIAgentResponse<{
    idea: string;
    est_budget: string;
  }[]>> {
    const prompt = `City: ${city}, Preferences: ${JSON.stringify(preferences || [])}`;
    const systemMessage = "Given both users' location city and weekend preferences, propose 3 short in-person date ideas with approximate budget.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "[{ idea: string, est_budget: string }]"
    );
  }

  // Agent 14: spam_detector
  async detectSpam(message: string): Promise<AIAgentResponse<{
    isSpam: boolean;
    confidence: number;
    reason?: string;
  }>> {
    const systemMessage = "Classify whether this message is likely spam (yes/no) and return confidence. If yes, provide example why.";
    
    return openaiService.callAgentWithStructuredOutput(
      message,
      systemMessage,
      "{ isSpam: boolean, confidence: number, reason?: string }"
    );
  }

  // Agent 15: tone_transfer
  async transferTone(message: string, targetTone: string): Promise<AIAgentResponse<{
    original: string;
    rewritten: string;
  }>> {
    const prompt = `Message: "${message}", Target tone: ${targetTone}`;
    const systemMessage = "Rewrite the given message into a different tone (e.g., from straightforward to playful). Keep original meaning.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ original: string, rewritten: string }"
    );
  }

  // Agent 16: consent_phrase
  async generateConsentPhrase(): Promise<AIAgentResponse<{
    message: string;
  }>> {
    const systemMessage = "Generate a short safe-and-consent message template a user can send before meeting (max 20 words).";
    
    return openaiService.callAgentWithStructuredOutput(
      "Generate a consent message for meeting",
      systemMessage,
      "{ message: string }"
    );
  }

  // Agent 17: bad_behavior_template
  async generateWarningTemplate(offendingMessage: string): Promise<AIAgentResponse<{
    warning: string;
  }>> {
    const prompt = `Offending message: "${offendingMessage}"`;
    const systemMessage = "Given an offending message, generate a calm warning message template to send to the sender asking them to stop. Keep it firm and non-escalatory.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ warning: string }"
    );
  }

  // Agent 18: bio_from_answers
  async generateBioFromAnswers(answers: string[]): Promise<AIAgentResponse<{
    bio: string;
    icebreaker: string;
  }>> {
    const prompt = `Onboarding answers: ${JSON.stringify(answers)}`;
    const systemMessage = "Given answers to 5 onboarding questions, generate a 2-line bio and 1-sentence icebreaker.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ bio: string, icebreaker: string }"
    );
  }

  // Agent 19: language_localizer
  async localizeText(text: string, targetLang: string): Promise<AIAgentResponse<{
    lang: string;
    text: string;
  }>> {
    const prompt = `Text: "${text}", Target language: ${targetLang}`;
    const systemMessage = "Translate and localize the given UI text into target language (ko/en) keeping tone friendly and short.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ lang: string, text: string }"
    );
  }

  // Agent 20: ai_reply_quality
  async assessReplyQuality(suggestedMessage: string): Promise<AIAgentResponse<{
    score: number;
    feedback: string;
  }>> {
    const prompt = `Suggested message: "${suggestedMessage}"`;
    const systemMessage = "Given a suggested message, score it 1-10 on quality (engaging, safe, concise) and provide short feedback.";
    
    return openaiService.callAgentWithStructuredOutput(
      prompt,
      systemMessage,
      "{ score: number, feedback: string }"
    );
  }
}

export const aiAgents = new AIAgents();
