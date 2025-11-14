import express from "express";
import { ApplicantMessageSend } from "./ApplicantMessageSend.js";

const router = express.Router();

// Test route (GET)
router.get("/ping", (req, res) => {
  res.json({ message: "Applicant chatbot routes working!" });
});

// Actual chatbot message handler (POST)
router.post("/respond", ApplicantMessageSend);

export default router;
