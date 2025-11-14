// src/applicant/ApplicantMessageSend.js

export const ApplicantMessageSend = async (req, res) => {
  try {
    const { Message, MessageType } = req.body;

    if (!Message || !MessageType) {
      return res.status(400).json({
        Message: "",
        Choices: {},
        Errors: "Missing Message or MessageType in request body.",
      });
    }

    // --- CLOSED (predefined responses) ---
    if (MessageType === "closed") {
      switch (Message.toLowerCase()) {
        case "start":
          return res.json({
            Message: "What would you like to inquire about?",
            Choices: {
              Choice1: "Passport Application Form",
              Choice2: "Passport Record Certification Request Form",
              Choice3: "Clearance",
              Choice4: "Other",
            },
            Errors: "",
          });

        case "feedback":
          return res.json({
            Message: "How was your experience?",
            Choices: {
              Choice1: "Very Poor",
              Choice2: "Fair",
              Choice3: "Good",
              Choice4: "Excellent",
            },
            Errors: "",
          });

        default:
          return res.json({
            Message: "I’m sorry, I don’t have a response for that yet.",
            Choices: {},
            Errors: "",
          });
      }
    }

    // --- OPEN (AI-style / custom input) ---
    if (MessageType === "open") {
      // For now, we simulate AI output
      return res.json({
        Message: `You said: "${Message}". Let me help you with that.`,
        Choices: {},
        Errors: "",
      });
    }

    // --- Invalid Type ---
    return res.status(400).json({
      Message: "",
      Choices: {},
      Errors: "Invalid MessageType. Use 'closed' or 'open'.",
    });

  } catch (error) {
    console.error("ApplicantMessageSend error:", error);
    res.status(500).json({
      Message: "",
      Choices: {},
      Errors: "Internal Server Error",
    });
  }
};
