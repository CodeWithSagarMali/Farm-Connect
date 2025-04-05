import { 
  users, type User, type InsertUser,
  calls, type Call, type InsertCall,
  callHistory, type CallHistory, type InsertCallHistory,
  messages, type Message, type InsertMessage,
  availability, type Availability, type InsertAvailability
} from "@shared/schema";

// We'll use in-memory storage since the database is having connection issues
// This is a temporary solution while we wait for the database service to be available

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Call methods
  createCall(call: InsertCall): Promise<Call>;
  getCall(id: number): Promise<Call | undefined>;
  getCalls(): Promise<Call[]>;
  getCallsByFarmerId(farmerId: number): Promise<Call[]>;
  getCallsBySpecialistId(specialistId: number): Promise<Call[]>;
  updateCallStatus(id: number, status: string): Promise<Call | undefined>;
  
  // Call History methods
  createCallHistory(callHistory: InsertCallHistory): Promise<CallHistory>;
  getCallHistoryByCallId(callId: number): Promise<CallHistory | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByCallId(callId: number): Promise<Message[]>;
  
  // Availability methods
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  getAvailabilityBySpecialistId(specialistId: number): Promise<Availability[]>;
}

// Define an in-memory storage class for temporary use
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private calls: Call[] = [];
  private callHistory: CallHistory[] = [];
  private messages: Message[] = [];
  private availability: Availability[] = [];
  private userIdCounter = 1;
  private callIdCounter = 1;
  private callHistoryIdCounter = 1;
  private messageIdCounter = 1;
  private availabilityIdCounter = 1;

  constructor() {
    // Seed with some initial data
    this.seedDatabase();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure role is properly typed
    const role = insertUser.role as "farmer" | "specialist";
    
    // Create user with proper field assignments
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email,
      role, // Use the properly typed role
      specialization: insertUser.specialization || null,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      rating: 0,
      totalCalls: 0
    };
    
    this.users.push(user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    if (role !== "farmer" && role !== "specialist") {
      return [];
    }
    return this.users.filter(user => user.role === role);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const user = this.users[userIndex];
    
    // Create a new object with updated fields
    const updatedUser: User = {
      ...user
    };
    
    // Update fields with type safety
    if (userData.username !== undefined) updatedUser.username = userData.username;
    if (userData.password !== undefined) updatedUser.password = userData.password;
    if (userData.fullName !== undefined) updatedUser.fullName = userData.fullName;
    if (userData.email !== undefined) updatedUser.email = userData.email;
    if (userData.role !== undefined) {
      updatedUser.role = userData.role as "farmer" | "specialist";
    }
    if (userData.specialization !== undefined) updatedUser.specialization = userData.specialization;
    if (userData.bio !== undefined) updatedUser.bio = userData.bio;
    if (userData.profilePicture !== undefined) updatedUser.profilePicture = userData.profilePicture;
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // Call methods
  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.callIdCounter++;
    
    // Ensure status is properly typed
    const status = insertCall.status as "scheduled" | "completed" | "cancelled" | "ongoing";
    
    // Parse string dates if needed
    let scheduledTime: Date;
    if (typeof insertCall.scheduledTime === 'string') {
      scheduledTime = new Date(insertCall.scheduledTime);
    } else {
      scheduledTime = insertCall.scheduledTime;
    }
    
    const call: Call = {
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

  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.find(call => call.id === id);
  }

  async getCalls(): Promise<Call[]> {
    return [...this.calls];
  }

  async getCallsByFarmerId(farmerId: number): Promise<Call[]> {
    return this.calls.filter(call => call.farmerId === farmerId);
  }

  async getCallsBySpecialistId(specialistId: number): Promise<Call[]> {
    return this.calls.filter(call => call.specialistId === specialistId);
  }

  async updateCallStatus(id: number, status: string): Promise<Call | undefined> {
    const callIndex = this.calls.findIndex(call => call.id === id);
    if (callIndex === -1) return undefined;

    const validStatuses = ["scheduled", "completed", "cancelled", "ongoing"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid call status: ${status}`);
    }

    const call = this.calls[callIndex];
    const updatedCall: Call = {
      ...call,
      status: status as "scheduled" | "completed" | "cancelled" | "ongoing"
    };
    this.calls[callIndex] = updatedCall;
    return updatedCall;
  }

  // Call History methods
  async createCallHistory(insertCallHistory: InsertCallHistory): Promise<CallHistory> {
    const id = this.callHistoryIdCounter++;
    
    // Process date fields and ensure null values for optional fields
    const callHistoryEntry: CallHistory = {
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

  async getCallHistoryByCallId(callId: number): Promise<CallHistory | undefined> {
    return this.callHistory.find(history => history.callId === callId);
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      id,
      ...insertMessage,
      timestamp: new Date()
    };
    this.messages.push(message);
    return message;
  }

  async getMessagesByCallId(callId: number): Promise<Message[]> {
    return this.messages.filter(message => message.callId === callId);
  }

  // Availability methods
  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityIdCounter++;
    const availabilityEntry: Availability = {
      id,
      ...insertAvailability
    };
    this.availability.push(availabilityEntry);
    return availabilityEntry;
  }

  async getAvailabilityBySpecialistId(specialistId: number): Promise<Availability[]> {
    return this.availability.filter(a => a.specialistId === specialistId);
  }

  // Seed database with initial test data
  private async seedDatabase() {
    // Add a farmer user
    if (this.users.length === 0) {
      // Add example users for testing
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

      // Add example specialists 
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
      
      // Update ratings and calls manually for demonstration purposes
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
      
      // Create availability for specialists 
      for (let day = 0; day < 7; day++) {
        // For Dr. Sarah Chen (Irrigation Systems Specialist)
        await this.createAvailability({
          specialistId: specialist3.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "16:00"
        });
        
        // For Dr. Michael Taylor (Livestock Management)
        await this.createAvailability({
          specialistId: specialist4.id,
          dayOfWeek: day,
          startTime: "07:00",
          endTime: "15:00"
        });
        
        // For Dr. Priya Patel (Organic Farming)
        await this.createAvailability({
          specialistId: specialist5.id,
          dayOfWeek: day,
          startTime: "11:00",
          endTime: "19:00"
        });
      }
      
      // Create some example calls
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Create scheduled call for tomorrow
      const tomorrowCall: InsertCall = {
        farmerId: farmer1.id,
        specialistId: specialist1.id,
        scheduledTime: tomorrow as unknown as Date,
        duration: 30,
        status: "scheduled",
        topic: "Corn leaf disease identification"
      };
      await this.createCall(tomorrowCall);
      
      // Create completed call from yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayCall: InsertCall = {
        farmerId: farmer1.id,
        specialistId: specialist2.id,
        scheduledTime: yesterday as unknown as Date,
        duration: 45,
        status: "completed",
        topic: "Soil nutrient analysis discussion"
      };
      await this.createCall(yesterdayCall);
    }
  }
}

// Initialize memory storage
export const storage = new MemoryStorage();