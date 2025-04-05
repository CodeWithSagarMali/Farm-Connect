import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCallSchema,
  insertMessageSchema, 
  insertCallHistorySchema,
  insertAvailabilitySchema,
  type Call
} from "@shared/schema";
import { z } from "zod";

interface SignalingData {
  type: string;
  targetId: number;
  callId: number;
  data: any;
}

interface WebSocketWithId extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Map to store connected clients by userId
  const clients = new Map<number, WebSocketWithId>();

  // Setup WebSocket server for signaling
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketWithId) => {
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication and store userId with websocket connection
        if (data.type === 'auth') {
          const userId = parseInt(data.userId);
          ws.userId = userId;
          clients.set(userId, ws);
          console.log(`User ${userId} connected`);
          return;
        }

        // Handle signaling messages
        if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
          const { targetId, callId, data: signalData } = data as SignalingData;
          const targetWs = clients.get(targetId);
          
          // If target user is connected, forward the signal
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: data.type,
              fromId: ws.userId,
              callId,
              data: signalData
            }));
          }
        }
        
        // Handle call status updates
        if (data.type === 'call-status-update') {
          const { callId, status } = data;
          await storage.updateCallStatus(callId, status);
          
          // Get the call to notify both participants
          const call = await storage.getCall(callId);
          if (call) {
            const farmerWs = clients.get(call.farmerId);
            const specialistWs = clients.get(call.specialistId);
            
            const statusUpdate = JSON.stringify({
              type: 'call-status-update',
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
        
        // Handle chat messages during call
        if (data.type === 'chat-message') {
          const { callId, content } = data;
          
          // Store the message in database
          if (ws.userId) {
            const message = await storage.createMessage({
              callId,
              senderId: ws.userId,
              content,
              timestamp: new Date()
            });
            
            // Get the call to determine who to send the message to
            const call = await storage.getCall(callId);
            if (call) {
              const recipientId = ws.userId === call.farmerId 
                ? call.specialistId 
                : call.farmerId;
              
              const recipientWs = clients.get(recipientId);
              if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                recipientWs.send(JSON.stringify({
                  type: 'chat-message',
                  callId,
                  senderId: ws.userId,
                  senderName: (await storage.getUser(ws.userId))?.fullName,
                  content,
                  timestamp: message.timestamp
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        console.log(`User ${ws.userId} disconnected`);
        clients.delete(ws.userId);
      }
    });
  });

  // User routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating user' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
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
      res.status(500).json({ message: 'Login error' });
    }
  });
  
  // Get current authenticated user
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    // For now we'll use a mock implementation - in a real app this would check 
    // session, JWT token, etc.
    try {
      // We're returning a 401 to indicate no user is logged in
      // Our AuthProvider will handle this by setting user to null
      return res.status(401).json({ message: 'Not logged in' });
      
      // Once we have proper authentication with sessions or tokens,
      // this would get the current user ID from session/token and return user data
      // const userId = req.session.userId; // example with sessions
      // const user = await storage.getUser(userId);
      // res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error getting user' });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      // In a real implementation with sessions/tokens, we would invalidate the session
      // or token here. For now, we just return a success status since our frontend
      // handles removing the user from localStorage.
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error during logout' });
    }
  });

  app.get('/api/users/specialists', async (req: Request, res: Response) => {
    try {
      const specialists = await storage.getUsersByRole('specialist');
      res.status(200).json(specialists.map(s => ({
        id: s.id,
        fullName: s.fullName,
        specialization: s.specialization,
        bio: s.bio,
        profilePicture: s.profilePicture,
        rating: s.rating ? s.rating / 10 : 0,
        totalCalls: s.totalCalls
      })));
    } catch (error) {
      res.status(500).json({ message: 'Error fetching specialists' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
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
      res.status(500).json({ message: 'Error fetching user' });
    }
  });

  // Call routes
  app.post('/api/calls', async (req: Request, res: Response) => {
    try {
      const callData = insertCallSchema.parse(req.body);
      const call = await storage.createCall(callData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid call data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating call' });
    }
  });

  app.get('/api/calls/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const call = await storage.getCall(id);
      
      if (!call) {
        return res.status(404).json({ message: 'Call not found' });
      }
      
      res.status(200).json(call);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching call' });
    }
  });

  app.get('/api/calls/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      let calls: Call[] = [];
      if (user.role === 'farmer') {
        calls = await storage.getCallsByFarmerId(userId);
      } else {
        calls = await storage.getCallsBySpecialistId(userId);
      }
      
      // Enhance calls with user information
      const enhancedCalls = await Promise.all(calls.map(async (call) => {
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
      res.status(500).json({ message: 'Error fetching user calls' });
    }
  });

  app.patch('/api/calls/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedCall = await storage.updateCallStatus(id, status);
      
      if (!updatedCall) {
        return res.status(404).json({ message: 'Call not found' });
      }
      
      res.status(200).json(updatedCall);
    } catch (error) {
      res.status(500).json({ message: 'Error updating call status' });
    }
  });

  // Call History routes
  app.post('/api/call-history', async (req: Request, res: Response) => {
    try {
      const historyData = insertCallHistorySchema.parse(req.body);
      const callHistory = await storage.createCallHistory(historyData);
      res.status(201).json(callHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid call history data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating call history' });
    }
  });

  app.get('/api/call-history/:callId', async (req: Request, res: Response) => {
    try {
      const callId = parseInt(req.params.callId);
      const history = await storage.getCallHistoryByCallId(callId);
      
      if (!history) {
        return res.status(404).json({ message: 'Call history not found' });
      }
      
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching call history' });
    }
  });

  // Message routes
  app.get('/api/messages/:callId', async (req: Request, res: Response) => {
    try {
      const callId = parseInt(req.params.callId);
      const messages = await storage.getMessagesByCallId(callId);
      
      // Enhance messages with sender information
      const enhancedMessages = await Promise.all(messages.map(async (message) => {
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
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  // Availability routes
  app.post('/api/availability', async (req: Request, res: Response) => {
    try {
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const availability = await storage.createAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid availability data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating availability' });
    }
  });

  app.get('/api/availability/:specialistId', async (req: Request, res: Response) => {
    try {
      const specialistId = parseInt(req.params.specialistId);
      const availability = await storage.getAvailabilityBySpecialistId(specialistId);
      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching availability' });
    }
  });

  return httpServer;
}
