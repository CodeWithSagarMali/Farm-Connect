// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
var MemoryStorage = class {
  users = [];
  calls = [];
  callHistory = [];
  messages = [];
  availability = [];
  userIdCounter = 1;
  callIdCounter = 1;
  callHistoryIdCounter = 1;
  messageIdCounter = 1;
  availabilityIdCounter = 1;
  constructor() {
    this.seedDatabase();
  }
  // User methods
  async getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const role = insertUser.role;
    const user = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email,
      role,
      // Use the properly typed role
      specialization: insertUser.specialization || null,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      rating: 0,
      totalCalls: 0
    };
    this.users.push(user);
    return user;
  }
  async getUsers() {
    return [...this.users];
  }
  async getUsersByRole(role) {
    if (role !== "farmer" && role !== "specialist") {
      return [];
    }
    return this.users.filter((user) => user.role === role);
  }
  async updateUser(id, userData) {
    const userIndex = this.users.findIndex((user2) => user2.id === id);
    if (userIndex === -1) return void 0;
    const user = this.users[userIndex];
    const updatedUser = {
      ...user
    };
    if (userData.username !== void 0) updatedUser.username = userData.username;
    if (userData.password !== void 0) updatedUser.password = userData.password;
    if (userData.fullName !== void 0) updatedUser.fullName = userData.fullName;
    if (userData.email !== void 0) updatedUser.email = userData.email;
    if (userData.role !== void 0) {
      updatedUser.role = userData.role;
    }
    if (userData.specialization !== void 0) updatedUser.specialization = userData.specialization;
    if (userData.bio !== void 0) updatedUser.bio = userData.bio;
    if (userData.profilePicture !== void 0) updatedUser.profilePicture = userData.profilePicture;
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
  // Call methods
  async createCall(insertCall) {
    const id = this.callIdCounter++;
    const status = insertCall.status;
    let scheduledTime;
    if (typeof insertCall.scheduledTime === "string") {
      scheduledTime = new Date(insertCall.scheduledTime);
    } else {
      scheduledTime = insertCall.scheduledTime;
    }
    const call = {
      id,
      farmerId: insertCall.farmerId,
      specialistId: insertCall.specialistId,
      scheduledTime,
      duration: insertCall.duration,
      status,
      topic: insertCall.topic || null,
      notes: insertCall.notes || null
    };
    this.calls.push(call);
    return call;
  }
  async getCall(id) {
    return this.calls.find((call) => call.id === id);
  }
  async getCalls() {
    return [...this.calls];
  }
  async getCallsByFarmerId(farmerId) {
    return this.calls.filter((call) => call.farmerId === farmerId);
  }
  async getCallsBySpecialistId(specialistId) {
    return this.calls.filter((call) => call.specialistId === specialistId);
  }
  async updateCallStatus(id, status) {
    const callIndex = this.calls.findIndex((call2) => call2.id === id);
    if (callIndex === -1) return void 0;
    const validStatuses = ["scheduled", "completed", "cancelled", "ongoing"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid call status: ${status}`);
    }
    const call = this.calls[callIndex];
    const updatedCall = {
      ...call,
      status
    };
    this.calls[callIndex] = updatedCall;
    return updatedCall;
  }
  // Call History methods
  async createCallHistory(insertCallHistory) {
    const id = this.callHistoryIdCounter++;
    const callHistoryEntry = {
      id,
      callId: insertCallHistory.callId,
      startTime: insertCallHistory.startTime ? new Date(insertCallHistory.startTime) : null,
      endTime: insertCallHistory.endTime ? new Date(insertCallHistory.endTime) : null,
      duration: insertCallHistory.duration || null,
      feedback: insertCallHistory.feedback || null,
      feedbackNotes: insertCallHistory.feedbackNotes || null
    };
    this.callHistory.push(callHistoryEntry);
    return callHistoryEntry;
  }
  async getCallHistoryByCallId(callId) {
    return this.callHistory.find((history) => history.callId === callId);
  }
  // Message methods
  async createMessage(insertMessage) {
    const id = this.messageIdCounter++;
    const message = {
      id,
      ...insertMessage,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.messages.push(message);
    return message;
  }
  async getMessagesByCallId(callId) {
    return this.messages.filter((message) => message.callId === callId);
  }
  // Availability methods
  async createAvailability(insertAvailability) {
    const id = this.availabilityIdCounter++;
    const availabilityEntry = {
      id,
      ...insertAvailability
    };
    this.availability.push(availabilityEntry);
    return availabilityEntry;
  }
  async getAvailabilityBySpecialistId(specialistId) {
    return this.availability.filter((a) => a.specialistId === specialistId);
  }
  // Seed database with initial test data
  async seedDatabase() {
    if (this.users.length === 0) {
      const farmer1 = await this.createUser({
        username: "john_farmer",
        password: "password123",
        fullName: "John Peterson",
        email: "john@example.com",
        role: "farmer",
        specialization: null,
        bio: "Corn and soybean farmer from Iowa",
        profilePicture: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?auto=format&fit=crop&w=100&q=80"
      });
      const specialist1 = await this.createUser({
        username: "maria_specialist",
        password: "password123",
        fullName: "Dr. Maria Rodriguez",
        email: "maria@example.com",
        role: "specialist",
        specialization: "Crop Disease",
        bio: "Plant pathologist with 10 years of experience in crop disease management",
        profilePicture: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
      });
      specialist1.rating = 45;
      specialist1.totalCalls = 48;
      const specialist2 = await this.createUser({
        username: "james_specialist",
        password: "password123",
        fullName: "Dr. James Wilson",
        email: "james@example.com",
        role: "specialist",
        specialization: "Soil Expert",
        bio: "Soil scientist specializing in soil health and fertility management",
        profilePicture: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80"
      });
      specialist2.rating = 50;
      specialist2.totalCalls = 32;
      const specialist3 = await this.createUser({
        username: "sarah_specialist",
        password: "password123",
        fullName: "Dr. Sarah Chen",
        email: "sarah@example.com",
        role: "specialist",
        specialization: "Irrigation Systems",
        bio: "Agricultural engineer focusing on efficient irrigation systems and water conservation techniques",
        profilePicture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
      });
      specialist3.rating = 48;
      specialist3.totalCalls = 39;
      const specialist4 = await this.createUser({
        username: "michael_specialist",
        password: "password123",
        fullName: "Dr. Michael Taylor",
        email: "michael@example.com",
        role: "specialist",
        specialization: "Livestock Management",
        bio: "Veterinarian with expertise in livestock health, nutrition, and sustainable farming practices",
        profilePicture: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&q=80"
      });
      specialist4.rating = 47;
      specialist4.totalCalls = 41;
      const specialist5 = await this.createUser({
        username: "priya_specialist",
        password: "password123",
        fullName: "Dr. Priya Patel",
        email: "priya@example.com",
        role: "specialist",
        specialization: "Organic Farming",
        bio: "Agricultural scientist specializing in organic farming methods and sustainable agriculture",
        profilePicture: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80"
      });
      specialist5.rating = 49;
      specialist5.totalCalls = 36;
      for (let day = 0; day < 7; day++) {
        await this.createAvailability({
          specialistId: specialist3.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "16:00"
        });
        await this.createAvailability({
          specialistId: specialist4.id,
          dayOfWeek: day,
          startTime: "07:00",
          endTime: "15:00"
        });
        await this.createAvailability({
          specialistId: specialist5.id,
          dayOfWeek: day,
          startTime: "11:00",
          endTime: "19:00"
        });
      }
      const now = /* @__PURE__ */ new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowCall = {
        farmerId: farmer1.id,
        specialistId: specialist1.id,
        scheduledTime: tomorrow,
        duration: 30,
        status: "scheduled",
        topic: "Corn leaf disease identification"
      };
      await this.createCall(tomorrowCall);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCall = {
        farmerId: farmer1.id,
        specialistId: specialist2.id,
        scheduledTime: yesterday,
        duration: 45,
        status: "completed",
        topic: "Soil nutrient analysis discussion"
      };
      await this.createCall(yesterdayCall);
    }
  }
};
var storage = new MemoryStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type(),
  specialization: text("specialization"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  rating: integer("rating").default(0),
  totalCalls: integer("total_calls").default(0)
});
var calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => users.id),
  specialistId: integer("specialist_id").notNull().references(() => users.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  status: text("status").notNull().$type(),
  topic: text("topic"),
  notes: text("notes")
});
var callHistory = pgTable("call_history", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull().references(() => calls.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  // in seconds
  feedback: integer("feedback"),
  // rating 1-5
  feedbackNotes: text("feedback_notes")
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull().references(() => calls.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull()
});
var availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  specialistId: integer("specialist_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(),
  // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(),
  // HH:MM format
  endTime: text("end_time").notNull()
  // HH:MM format
});
var usersRelations = relations(users, ({ many }) => ({
  farmerCalls: many(calls, { relationName: "farmer_calls" }),
  specialistCalls: many(calls, { relationName: "specialist_calls" }),
  messages: many(messages),
  availability: many(availability)
}));
var callsRelations = relations(calls, ({ one, many }) => ({
  farmer: one(users, {
    fields: [calls.farmerId],
    references: [users.id],
    relationName: "farmer_calls"
  }),
  specialist: one(users, {
    fields: [calls.specialistId],
    references: [users.id],
    relationName: "specialist_calls"
  }),
  callHistory: one(callHistory),
  messages: many(messages)
}));
var callHistoryRelations = relations(callHistory, ({ one }) => ({
  call: one(calls, {
    fields: [callHistory.callId],
    references: [calls.id]
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  call: one(calls, {
    fields: [messages.callId],
    references: [calls.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
var availabilityRelations = relations(availability, ({ one }) => ({
  specialist: one(users, {
    fields: [availability.specialistId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  rating: true,
  totalCalls: true
});
var insertCallSchema = createInsertSchema(calls).omit({
  id: true
}).extend({
  scheduledTime: z.string().transform((val) => new Date(val))
});
var insertCallHistorySchema = createInsertSchema(callHistory).omit({
  id: true
}).extend({
  startTime: z.string().optional().transform((val) => val ? new Date(val) : void 0),
  endTime: z.string().optional().transform((val) => val ? new Date(val) : void 0)
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
}).extend({
  timestamp: z.string().optional().transform(() => /* @__PURE__ */ new Date())
  // Current timestamp
});
var insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const clients = /* @__PURE__ */ new Map();
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "auth") {
          const userId = parseInt(data.userId);
          ws.userId = userId;
          clients.set(userId, ws);
          console.log(`User ${userId} connected`);
          return;
        }
        if (data.type === "offer" || data.type === "answer" || data.type === "ice-candidate") {
          const { targetId, callId, data: signalData } = data;
          const targetWs = clients.get(targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: data.type,
              fromId: ws.userId,
              callId,
              data: signalData
            }));
          }
        }
        if (data.type === "call-status-update") {
          const { callId, status } = data;
          await storage.updateCallStatus(callId, status);
          const call = await storage.getCall(callId);
          if (call) {
            const farmerWs = clients.get(call.farmerId);
            const specialistWs = clients.get(call.specialistId);
            const statusUpdate = JSON.stringify({
              type: "call-status-update",
              callId,
              status
            });
            if (farmerWs && farmerWs.readyState === WebSocket.OPEN) {
              farmerWs.send(statusUpdate);
            }
            if (specialistWs && specialistWs.readyState === WebSocket.OPEN) {
              specialistWs.send(statusUpdate);
            }
          }
        }
        if (data.type === "chat-message") {
          const { callId, content } = data;
          if (ws.userId) {
            const message2 = await storage.createMessage({
              callId,
              senderId: ws.userId,
              content,
              timestamp: /* @__PURE__ */ new Date()
            });
            const call = await storage.getCall(callId);
            if (call) {
              const recipientId = ws.userId === call.farmerId ? call.specialistId : call.farmerId;
              const recipientWs = clients.get(recipientId);
              if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                recipientWs.send(JSON.stringify({
                  type: "chat-message",
                  callId,
                  senderId: ws.userId,
                  senderName: (await storage.getUser(ws.userId))?.fullName,
                  content,
                  timestamp: message2.timestamp
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      if (ws.userId) {
        console.log(`User ${ws.userId} disconnected`);
        clients.delete(ws.userId);
      }
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        specialization: user.specialization,
        bio: user.bio,
        profilePicture: user.profilePicture,
        rating: user.rating ? user.rating / 10 : 0,
        totalCalls: user.totalCalls || 0
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.status(200).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        specialization: user.specialization,
        bio: user.bio,
        profilePicture: user.profilePicture,
        rating: user.rating ? user.rating / 10 : 0,
        totalCalls: user.totalCalls || 0
      });
    } catch (error) {
      res.status(500).json({ message: "Login error" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      return res.status(401).json({ message: "Not logged in" });
    } catch (error) {
      res.status(500).json({ message: "Error getting user" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error during logout" });
    }
  });
  app2.get("/api/users/specialists", async (req, res) => {
    try {
      const specialists = await storage.getUsersByRole("specialist");
      res.status(200).json(specialists.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        specialization: s.specialization,
        bio: s.bio,
        profilePicture: s.profilePicture,
        rating: s.rating ? s.rating / 10 : 0,
        totalCalls: s.totalCalls
      })));
    } catch (error) {
      res.status(500).json({ message: "Error fetching specialists" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        specialization: user.specialization,
        bio: user.bio,
        profilePicture: user.profilePicture,
        rating: user.rating ? user.rating / 10 : 0,
        totalCalls: user.totalCalls
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.post("/api/calls", async (req, res) => {
    try {
      const callData = insertCallSchema.parse(req.body);
      const call = await storage.createCall(callData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid call data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating call" });
    }
  });
  app2.get("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const call = await storage.getCall(id);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.status(200).json(call);
    } catch (error) {
      res.status(500).json({ message: "Error fetching call" });
    }
  });
  app2.get("/api/calls/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let calls2 = [];
      if (user.role === "farmer") {
        calls2 = await storage.getCallsByFarmerId(userId);
      } else {
        calls2 = await storage.getCallsBySpecialistId(userId);
      }
      const enhancedCalls = await Promise.all(calls2.map(async (call) => {
        const farmer = await storage.getUser(call.farmerId);
        const specialist = await storage.getUser(call.specialistId);
        return {
          ...call,
          farmer: farmer ? {
            id: farmer.id,
            fullName: farmer.fullName,
            profilePicture: farmer.profilePicture
          } : null,
          specialist: specialist ? {
            id: specialist.id,
            fullName: specialist.fullName,
            specialization: specialist.specialization,
            profilePicture: specialist.profilePicture
          } : null
        };
      }));
      res.status(200).json(enhancedCalls);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user calls" });
    }
  });
  app2.patch("/api/calls/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updatedCall = await storage.updateCallStatus(id, status);
      if (!updatedCall) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.status(200).json(updatedCall);
    } catch (error) {
      res.status(500).json({ message: "Error updating call status" });
    }
  });
  app2.post("/api/call-history", async (req, res) => {
    try {
      const historyData = insertCallHistorySchema.parse(req.body);
      const callHistory2 = await storage.createCallHistory(historyData);
      res.status(201).json(callHistory2);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid call history data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating call history" });
    }
  });
  app2.get("/api/call-history/:callId", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      const history = await storage.getCallHistoryByCallId(callId);
      if (!history) {
        return res.status(404).json({ message: "Call history not found" });
      }
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Error fetching call history" });
    }
  });
  app2.get("/api/messages/:callId", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      const messages2 = await storage.getMessagesByCallId(callId);
      const enhancedMessages = await Promise.all(messages2.map(async (message) => {
        const sender = await storage.getUser(message.senderId);
        return {
          ...message,
          sender: sender ? {
            id: sender.id,
            fullName: sender.fullName,
            profilePicture: sender.profilePicture
          } : null
        };
      }));
      res.status(200).json(enhancedMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  app2.post("/api/availability", async (req, res) => {
    try {
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const availability2 = await storage.createAvailability(availabilityData);
      res.status(201).json(availability2);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid availability data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating availability" });
    }
  });
  app2.get("/api/availability/:specialistId", async (req, res) => {
    try {
      const specialistId = parseInt(req.params.specialistId);
      const availability2 = await storage.getAvailabilityBySpecialistId(specialistId);
      res.status(200).json(availability2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching availability" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig(async () => ({
  base: "./",
  // ✅ Ensures all built asset paths are relative (fixes blank screen)
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    // ✅ Will output final build here
    emptyOutDir: true
  }
}));

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    log("Using in-memory storage for this session");
    log("In-memory database initialized with test data");
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = 3e3;
    server.listen(port, "127.0.0.1", () => {
      log(`Server is serving on port ${port}`);
    });
  } catch (error) {
    log(`ERROR initializing application: ${error}`);
    console.error(error);
    process.exit(1);
  }
})();
