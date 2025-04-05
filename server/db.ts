import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Create a PostgreSQL client with the connection string from environment variables
const connectionString = process.env.DATABASE_URL!;

// Configure PostgreSQL client with connection pooling and more robust error handling
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20, // How many seconds a client is allowed to stay idle before being closed
  connect_timeout: 10, // How many seconds to wait for a connection before throwing a timeout error
  max_lifetime: 60 * 30, // Max lifetime of a connection in the pool (30 min)
  onnotice: () => {}, // Suppress notice messages
  debug: false, // Set to true if you want connection debugging information
  ssl: { rejectUnauthorized: false } // For connecting to some PostgreSQL services that require SSL
});

// Create a drizzle database instance with the client and schema
export const db = drizzle(client, { schema });