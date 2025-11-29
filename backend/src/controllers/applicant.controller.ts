import { Request, Response } from "express";
import { QueueManager } from "./queue.controller.js";
import { deleteSession, fetchSessions, storeSession } from "../db/sessions.js";

export async function getApplicantInfo(req: Request, res: Response): Promise<void> {
  try {
    const applicant = req.session.applicant;

    if (!applicant) {
      res.status(404).json({
        success: false,
        error: "No applicant information found in session",
        message: "This session does not have applicant data. Please submit a form first.",
      });
      return;
    }

   const status = applicant.dateClosed
      ? "Closed"
      : applicant.dateProcessing
      ? "Processing"
      : "In Line";

    const queue = QueueManager.manageQueue()
    const counter = queue.applicants[req.sessionID] 
    const counters = Object.keys(queue.activeCounters)
    const counterIndex = counters.findIndex(i => i == counter)
    const counterName = counterIndex !== -1 ? "Counter " + (counterIndex + 1) : "No Counter"
    
    let nthInLine = 0;
    if (counter) {
      const counterQueue = queue.queueDistribution.find(q => q.counterId === counter);
      if (counterQueue) {
        const applicantPosition = counterQueue.applicants.findIndex(a => a.sessionId === req.sessionID);
        nthInLine = applicantPosition !== -1 ? applicantPosition + 1 : 0;
      }
    }

    res.json({
      success: true,
      data: {
        sessionId: req.sessionID,
        status,
        counterName: counterName,
        nthInLine: nthInLine,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve applicant information",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function submitApplicantForm(req: Request, res: Response): Promise<void> {
  console.warn(1)
  try {
    const { name, document, isPriority } = req.body;

    if (!name || !document) {
      res.status(400).json({
        success: false,
        error: "Name and document are required",
      });
      
  console.warn(2)
      return;
    }

    // Initialize or update applicant data
    req.session.applicant = {
      name,
      document,
      isPriority: isPriority || false,
      dateSubmitted: new Date().toISOString(),
      dateClosed: undefined,
      feedbackChoice: undefined,
      feedbackComments: undefined,
    };

    // Save session
    req.session.save((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: "Failed to save form submission",
          message: err.message,
        });
        
  console.warn(3)
        return;
      }

      
  console.warn(4)
      res.json({
        success: true,
        message: "Form submitted successfully",
        data: {
          sessionId: req.sessionID,
          ...req.session.applicant,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to submit form",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { feedbackChoice, feedbackComments } = req.body;

    if (!req.session.applicant) {
      res.status(404).json({
        success: false,
        error: "No applicant information found",
      });
      return;
    }

    if (!feedbackChoice) {
      res.status(400).json({
        success: false,
        error: "Feedback choice is required",
      });
      return;
    }

    req.session.applicant.feedbackChoice = feedbackChoice;
    req.session.applicant.feedbackComments = feedbackComments || "";

    req.session.save((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: "Failed to save feedback",
          message: err.message,
        });
        return;
      }

      res.json({
        success: true,
        message: "Feedback submitted successfully",
        data: {
          feedbackChoice: req.session.applicant?.feedbackChoice,
          feedbackComments: req.session.applicant?.feedbackComments,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to submit feedback",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
} 
export async function markApplicantClosed(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.body;

    const sessions = fetchSessions();
    const targetSessionId = sessionId || req.sessionID;
    const targetSession = sessions.get(targetSessionId);
    if (!targetSession || !targetSession.applicant) {
      res.status(404).json({
        success: false,
        error: "No applicant information found",
      });
      return;
    }

    targetSession.applicant.dateClosed = new Date().toISOString();
    // Save session (simulate save for DB-backed sessions)
    sessions.set(targetSessionId, targetSession);
    storeSession(sessionId, targetSession)
    const counterKey = targetSession.counter?.key;
    const counterSessionId = counterKey ? Array.from(sessions.entries()).find(([id, s]) => s.counter?.key === counterKey)?.[0] : undefined;
    if (counterSessionId && QueueManager.canDeleteCounterSession(counterSessionId)) {
      deleteSession(counterSessionId);
    }
    res.json({
      success: true,
      message: "Applicant marked as served",
      data: targetSession.applicant,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to mark applicant as served",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function markApplicantProcessing(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.body;

    const sessions = fetchSessions();
    const targetSessionId = sessionId || req.sessionID;
    const targetSession = sessions.get(targetSessionId);
    if (!targetSession || !targetSession.applicant) {
      res.status(404).json({
        success: false,
        error: "No applicant information found",
      });
      return;
    }

    targetSession.applicant.dateProcessing = new Date().toISOString();
    sessions.set(targetSessionId, targetSession);
    storeSession(sessionId, targetSession)
    res.json({
      success: true,
      message: "Applicant marked as processing",
      data: targetSession.applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to mark applicant as processing",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function markApplicantMissing(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.body;

    
    const sessions = fetchSessions();
    const targetSessionId = sessionId || req.sessionID;
    const targetSession = sessions.get(targetSessionId);
    if (!targetSession || !targetSession.applicant) {
      res.status(404).json({
        success: false,
        error: "No applicant information found",
      });
      return;
    }

    const missingCount = (targetSession.applicant.missingCount || 0) + 1;
    targetSession.applicant.missingCount = missingCount;
    if (missingCount >= 3) {
      targetSession.applicant.dateClosed = new Date().toISOString();
      sessions.set(targetSessionId, targetSession);
      res.json({
        success: true,
        message: "Applicant marked missing 3 times and removed from queue",
        data: targetSession.applicant,
      });
      return;
    }
    targetSession.applicant.isPriority = false;
    targetSession.applicant.dateSubmitted = new Date().toISOString();
    sessions.set(targetSessionId, targetSession);
    storeSession(sessionId, targetSession)
    res.json({
      success: true,
      message: `Applicant marked as missing (${missingCount}/3) and moved to back of queue`,
      data: targetSession.applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to mark applicant as missing",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}





// TBR
// export async function getApplicantBySessionId(req: Request, res: Response): Promise<void> {
//   try {
//     const { sessionId } = req.params;

//     if (!sessionId) {
//       res.status(400).json({
//         success: false,
//         error: "Session ID is required",
//       });
//       return;
//     }

//     const sessions = fetchSessions();
//     const session = sessions.get(sessionId);

//     if (!session || !session.applicant) {
//       res.status(404).json({
//         success: false,
//         error: "Applicant not found",
//         message: `No applicant found with session ID: ${sessionId}`,
//       });
//       return;
//     }

//     res.json({
//       success: true,
//       data: {
//         sessionId,
//         name: session.applicant.name,
//         document: session.applicant.document,
//         isPriority: session.applicant.isPriority || false,
//         dateSubmitted: session.applicant.dateSubmitted,
//         dateServed: session.applicant.dateServed,
//         closedServed: session.applicant.closedServed,
//         feedbackChoice: session.applicant.feedbackChoice,
//         feedbackComments: session.applicant.feedbackComments,
//         status: session.applicant.dateServed ? "served" : "waiting",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve applicant information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }

// export async function updateApplicantInfo(req: Request, res: Response): Promise<void> {
//   try {
//     const updates = req.body;

//     if (!req.session.applicant) {
//       req.session.applicant = {};
//     }

//     // Only update allowed fields
//     const allowedFields = [
//       "name",
//       "document",
//       "isPriority",
//       "dateSubmitted",
//       "dateServed",
//       "closedServed",
//       "feedbackChoice",
//       "feedbackComments",
//     ];

//     Object.keys(updates).forEach((key) => {
//       if (allowedFields.includes(key)) {
//         (req.session.applicant as any)[key] = updates[key];
//       }
//     });

//     // Save session
//     req.session.save((err) => {
//       if (err) {
//         res.status(500).json({
//           success: false,
//           error: "Failed to save session",
//           message: err.message,
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         message: "Applicant information updated successfully",
//         data: req.session.applicant,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to update applicant information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function getAllApplicants(req: Request, res: Response): Promise<void> {
//   try {
//     const sessions = fetchSessions();
//     const applicants: Array<{
//       sessionId: string;
//       name?: string;
//       document?: string;
//       isPriority: boolean;
//       dateSubmitted?: string;
//       dateServed?: string;
//       status: string;
//     }> = [];

//     sessions.forEach((session, sessionId) => {
//       if (session.applicant && session.applicant.dateSubmitted) {
//         applicants.push({
//           sessionId,
//           name: session.applicant.name,
//           document: session.applicant.document,
//           isPriority: session.applicant.isPriority || false,
//           dateSubmitted: session.applicant.dateSubmitted,
//           dateServed: session.applicant.dateServed,
//           status: session.applicant.dateServed ? "served" : "waiting",
//         });
//       }
//     });

//     applicants.sort((a, b) => {
//       const dateA = new Date(a.dateSubmitted || 0).getTime();
//       const dateB = new Date(b.dateSubmitted || 0).getTime();
//       return dateB - dateA;
//     });

//     res.json({
//       success: true,
//       data: {
//         total: applicants.length,
//         waiting: applicants.filter((a) => a.status === "waiting").length,
//         served: applicants.filter((a) => a.status === "served").length,
//         applicants,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve applicants",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }

// export async function deleteApplicantInfo(req: Request, res: Response): Promise<void> {
//   try {
//     if (!req.session.applicant) {
//       res.status(404).json({
//         success: false,
//         error: "No applicant information found",
//       });
//       return;
//     }

//     const deletedData = { ...req.session.applicant };
//     delete req.session.applicant;

//     req.session.save((err) => {
//       if (err) {
//         res.status(500).json({
//           success: false,
//           error: "Failed to delete applicant information",
//           message: err.message,
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         message: "Applicant information deleted successfully",
//         deletedData,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete applicant information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
