import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emotionTypeEnum = pgEnum('emotion_type', ['happy', 'excited', 'calm', 'romantic', 'adventurous', 'thoughtful']);
export const messageTypeEnum = pgEnum('message_type', ['user', 'ai_suggestion', 'system']);
export const reportTypeEnum = pgEnum('report_type', ['spam', 'inappropriate', 'harassment', 'fake_profile']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  location: text("location").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  emotionProfile: jsonb("emotion_profile").$type<{
    primaryEmotions: string[];
    happinessTriggers: string[];
    communicationStyle: string;
    relationshipGoals: string;
  }>(),
  profileCompletion: integer("profile_completion").default(0),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  photos: jsonb("photos").$type<string[]>().default([]),
  interests: jsonb("interests").$type<string[]>().default([]),
  values: jsonb("values").$type<string[]>().default([]),
  lookingFor: text("looking_for"),
  emotionTags: jsonb("emotion_tags").$type<string[]>().default([]),
  aiSummary: text("ai_summary"),
  embeddings: jsonb("embeddings").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  matchedUserId: varchar("matched_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  compatibilityScore: integer("compatibility_score").notNull(),
  matchReasons: jsonb("match_reasons").$type<{reason: string, score: number}[]>(),
  isLiked: boolean("is_liked").default(false),
  isMatched: boolean("is_matched").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").default('user'),
  aiCoachingSuggestion: text("ai_coaching_suggestion"),
  tone: text("tone"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emotionalFeedback = pgTable("emotional_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  matchId: varchar("match_id").references(() => matches.id, { onDelete: "cascade" }),
  dateExperience: jsonb("date_experience").$type<{
    happiness: number;
    connection: number;
    communication: number;
    chemistry: number;
  }>(),
  feedback: text("feedback"),
  growthRecommendations: jsonb("growth_recommendations").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: varchar("reported_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: reportTypeEnum("report_type").notNull(),
  description: text("description"),
  messageId: varchar("message_id").references(() => messages.id, { onDelete: "cascade" }),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentType: text("agent_type").notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  matches: many(matches, { relationName: "userMatches" }),
  matchedBy: many(matches, { relationName: "matchedByUsers" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  conversations1: many(conversations, { relationName: "user1Conversations" }),
  conversations2: many(conversations, { relationName: "user2Conversations" }),
  emotionalFeedback: many(emotionalFeedback),
  reportsGiven: many(reports, { relationName: "reportsGiven" }),
  reportsReceived: many(reports, { relationName: "reportsReceived" }),
  aiInteractions: many(aiInteractions),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user: one(users, { fields: [matches.userId], references: [users.id], relationName: "userMatches" }),
  matchedUser: one(users, { fields: [matches.matchedUserId], references: [users.id], relationName: "matchedByUsers" }),
  emotionalFeedback: many(emotionalFeedback),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(users, { fields: [conversations.user1Id], references: [users.id], relationName: "user1Conversations" }),
  user2: one(users, { fields: [conversations.user2Id], references: [users.id], relationName: "user2Conversations" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sentMessages" }),
}));

export const emotionalFeedbackRelations = relations(emotionalFeedback, ({ one }) => ({
  user: one(users, { fields: [emotionalFeedback.userId], references: [users.id] }),
  match: one(matches, { fields: [emotionalFeedback.matchId], references: [matches.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id], relationName: "reportsGiven" }),
  reportedUser: one(users, { fields: [reports.reportedUserId], references: [users.id], relationName: "reportsReceived" }),
  message: one(messages, { fields: [reports.messageId], references: [messages.id] }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, { fields: [aiInteractions.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  age: true,
  location: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionalFeedbackSchema = createInsertSchema(emotionalFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const onboardingAnswersSchema = z.object({
  happinessTriggers: z.array(z.string()).min(1, "Please select at least one happiness trigger"),
  communicationStyle: z.string().min(1, "Please select a communication style"),
  relationshipGoals: z.string().min(1, "Please select your relationship goals"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  values: z.array(z.string()).min(1, "Please select at least one value"),
  lookingFor: z.string().min(1, "Please specify what you're looking for"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type EmotionalFeedback = typeof emotionalFeedback.$inferSelect;
export type InsertEmotionalFeedback = z.infer<typeof insertEmotionalFeedbackSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
export type AIInteraction = typeof aiInteractions.$inferSelect;
