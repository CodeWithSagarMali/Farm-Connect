import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<"farmer" | "specialist">(),
  specialization: text("specialization"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  rating: integer("rating").default(0),
  totalCalls: integer("total_calls").default(0),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => users.id),
  specialistId: integer("specialist_id").notNull().references(() => users.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().$type<"scheduled" | "completed" | "cancelled" | "ongoing">(),
  topic: text("topic"),
  notes: text("notes"),
});

export const callHistory = pgTable("call_history", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull().references(() => calls.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  feedback: integer("feedback"), // rating 1-5
  feedbackNotes: text("feedback_notes"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull().references(() => calls.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  specialistId: integer("specialist_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  farmerCalls: many(calls, { relationName: 'farmer_calls' }),
  specialistCalls: many(calls, { relationName: 'specialist_calls' }),
  messages: many(messages),
  availability: many(availability),
}));

export const callsRelations = relations(calls, ({ one, many }) => ({
  farmer: one(users, {
    fields: [calls.farmerId],
    references: [users.id],
    relationName: 'farmer_calls'
  }),
  specialist: one(users, {
    fields: [calls.specialistId],
    references: [users.id],
    relationName: 'specialist_calls'
  }),
  callHistory: one(callHistory),
  messages: many(messages),
}));

export const callHistoryRelations = relations(callHistory, ({ one }) => ({
  call: one(calls, {
    fields: [callHistory.callId],
    references: [calls.id]
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  call: one(calls, {
    fields: [messages.callId],
    references: [calls.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  specialist: one(users, {
    fields: [availability.specialistId],
    references: [users.id]
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  rating: true,
  totalCalls: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
}).extend({
  scheduledTime: z.string().transform((val) => new Date(val)),
});

export const insertCallHistorySchema = createInsertSchema(callHistory).omit({
  id: true,
}).extend({
  startTime: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endTime: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
}).extend({
  timestamp: z.string().optional().transform(() => new Date()) // Current timestamp
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;

export type InsertCallHistory = z.infer<typeof insertCallHistorySchema>;
export type CallHistory = typeof callHistory.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;
