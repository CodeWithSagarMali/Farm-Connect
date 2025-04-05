import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
// Database import is handled dynamically based on connection availability

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Main async function to set up the server
(async () => {
  try {
    // We're using in-memory storage instead of PostgreSQL
    log("Using in-memory storage for this session");
    log("In-memory database initialized with test data");

    // Register routes to the Express app
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Setup Vite for development, or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // IMPORTANT: Always serve the app on a free port (3000 in this case)
    const port = 3000;
    server.listen(port, '127.0.0.1', () => {
      log(`Server is serving on port ${port}`);
    });
  } catch (error) {
    log(`ERROR initializing application: ${error}`);
    console.error(error);
    process.exit(1);
  }
})();
