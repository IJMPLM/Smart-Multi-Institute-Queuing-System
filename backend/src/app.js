import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { initializeSchema, seedInitialData } from "./config/schema.js";
import { sessionMiddleware, recordSession } from "./middleware/session.js";

dotenv.config();

const app = express();
const allowedOrigins = [
  `${process.env.NEXT_PUBLIC_API_URL}:3000`,
  `${process.env.NEXT_PUBLIC_API_URL}:3001`,
  `${process.env.NEXT_PUBLIC_API_URL}:3002`,
  `http://192.168.1.6:4000`,
  `http://localhost:4000`,
  `http://localhost:3000`,
  `http://localhost:3001`,
  `http://localhost:3002`
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(sessionMiddleware);
app.use(recordSession);

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helmet CSP configuration
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", 'data:'],
//         connectSrc: ["'self'", "http:", "https:"]
// ,
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         objectSrc: ["'none'"],
//         baseUri: ["'self'"],
//         frameAncestors: ["'none'"],
//       },
//     },
//   })
// );

// Serve static assets
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api", routes);

// Default root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/api-tester.html"));
});

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Shutdown endpoint
app.post("/api/shutdown", (req, res) => {
    res.json({ message: "Server shutdown initiated" });
    console.log("🛑 Shutdown requested via API");
    // Graceful shutdown after response is sent
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

// fallback 404 for unknown routes (optional)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
