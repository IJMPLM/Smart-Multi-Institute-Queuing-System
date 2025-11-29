import { Request, Response } from "express";
import { fetchSessions, storeSession } from "../db/sessions.js";
import { addAvailableKey, getAvailableKeys, getUsedKeys, isKeyAvailable, useKey } from "../utils/counterKeys.js";
import { QueueManager } from "./queue.controller.js";
import session from "express-session";
import { countReset } from "console";

export async function generateKeysHandler(req: Request, res: Response): Promise<void> {
  try {
    const key = addAvailableKey();

    res.json({
      success: true,
      message: "Generated counter key",
      data: {
        key,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate key",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function closeCounter(req: Request, res: Response): Promise<void> {
  try {
    let { sessionId } = req.body;
    if (sessionId == "self") sessionId = req.sessionID

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
      console.warn("Session ID is required")
      return;
    }

    const sessions = fetchSessions();
    const counterSession = sessions.get(sessionId);

    if (!counterSession || !counterSession.counter) {
      res.status(404).json({
        success: false,
        error: "Counter not found",
        message: "No counter found with the provided session ID",
      });
      console.warn("Counter not found")
      return;
    }

    if (!counterSession.counter.dateOpened) {
      res.status(400).json({
        success: false,
        error: "Counter was never opened",
        message: "Cannot close a counter that was never opened",
      });
      console.warn("Counter was never opened")
      return;
    }


    const queueMangemenet = QueueManager.manageQueue()
    const counterQueue =
          queueMangemenet.queueDistribution.find(
            (q) =>
              q.counterId === sessionId
          ) || null;
    const applicants = counterQueue?.applicants.filter(a => a.dateClosed == undefined)
    const hasActiveApplicants = (applicants?.length ?? 0) > 0;
    counterSession.counter.dateClosed = new Date().toISOString();
  
    storeSession(sessionId, counterSession);

    res.json({
      success: true,
      message: hasActiveApplicants 
        ? "Counter is closing - waiting for active applicants to be served"
        : "Counter closed successfully",
      data: {
        sessionId: sessionId,
        deviceId: counterSession.deviceId,
        key: counterSession.counter?.key,
        dateOpened: counterSession.counter?.dateOpened,
        dateClosed: counterSession.counter?.dateClosed,
        activeApplicants: hasActiveApplicants,
      },
      canClose: !hasActiveApplicants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to close counter",
      message: error instanceof Error ? error.message : "Failed to close the counter",
    });
  }
}
export async function activateCounter(req: Request, res: Response): Promise<void> {
  try {
    const { key } = req.body;

    if (!key) {
      res.status(400).json({
        success: false,
        error: "Counter key is required",
        message: "Please provide a valid counter key to activate",
      });
      return;
    }

    if (!req.session.counter) {
      req.session.counter = {};
    }

    // If this session already has this exact key activated and it's still open, let them in
    if (req.session.counter.key === key && 
        req.session.counter.dateOpened && 
        !req.session.counter.dateClosed) {
      res.json({
        success: true,
        message: "Counter already activated with this key",
        data: {
          sessionId: req.sessionID,
          deviceId: req.session.deviceId,
          key: req.session.counter.key,
          dateOpened: req.session.counter.dateOpened,
          status: "open",
        },
      });
      return;
    }

    // Check if trying to activate a different key while already having an active counter
    if (req.session.counter.key && 
        req.session.counter.key !== key && 
        req.session.counter.dateOpened && 
        !req.session.counter.dateClosed) {
      res.status(400).json({
        success: false,
        error: "Counter is already activated with a different key",
        message: "This session already has an active counter. Please logout first.",
      });
      return;
    }

    // Check if the key is available
    if (!isKeyAvailable(key)) {
      res.status(400).json({
        success: false,
        error: "Invalid or already used key",
        message: "The provided key is not available for activation",
      });
      return;
    }

    // If counter was previously closed, allow re-activation by resetting
    if (req.session.counter.dateClosed) {
      req.session.counter = {};
    }

    const keyUsed = useKey(key);
    if (!keyUsed) {
      res.status(400).json({
        success: false,
        error: "Failed to use key",
        message: "The key could not be marked as used",
      });
      return;
    }

    
    req.session.counter.key = key;
    const dateOpenedValue = new Date().toISOString();
    req.session.counter.dateOpened = dateOpenedValue;
    req.session.counter.dateClosed = undefined;

    req.session.save((err) => {
      if (err) {
        console.error('Failed to save session after activation:', err);
        res.status(500).json({
          success: false,
          error: "Failed to save session",
          message: err.message,
        });
        return;
      }

      res.json({
        success: true,
        message: "Counter activated successfully",
        data: {
          sessionId: req.sessionID,
          deviceId: req.session.deviceId,
          key: req.session.counter?.key,
          dateOpened: req.session.counter?.dateOpened,
          status: "open",
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to activate counter",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function getAvailableKeysHandler(req: Request, res: Response): Promise<void> {
  try {
    const availableKeys = getAvailableKeys();
    const usedKeys = getUsedKeys();

    res.json({
      success: true,
      data: {
        available: availableKeys,
        used: usedKeys,
        totalAvailable: availableKeys.length,
        totalUsed: usedKeys.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve keys",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}









// TBR
// export async function getAllCounters(req: Request, res: Response): Promise<void> {
//   try {
//     const sessions = fetchSessions();
//     const counters: Array<{
//       sessionId: string;
//       deviceId?: string;
//       key?: string;
//       dateOpened?: string;
//       dateClosed?: string;
//       status: string;
//       isOpen: boolean;
//     }> = [];

//     sessions.forEach((session, sessionId) => {
//       if (session.counter) {
//         const isOpen = !!session.counter.dateOpened && !session.counter.dateClosed;
//         counters.push({
//           sessionId,
//           deviceId: session.deviceId,
//           key: session.counter.key,
//           dateOpened: session.counter.dateOpened,
//           dateClosed: session.counter.dateClosed,
//           status: isOpen ? "open" : "closed",
//           isOpen,
//         });
//       }
//     });

//     counters.sort((a, b) => {
//       const dateA = new Date(a.dateOpened || 0).getTime();
//       const dateB = new Date(b.dateOpened || 0).getTime();
//       return dateB - dateA;
//     });

//     res.json({
//       success: true,
//       data: {
//         total: counters.length,
//         open: counters.filter((c) => c.isOpen).length,
//         closed: counters.filter((c) => !c.isOpen).length,
//         counters,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve counters",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function getCounterBySessionId(req: Request, res: Response): Promise<void> {
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

//     if (!session || !session.counter) {
//       res.status(404).json({
//         success: false,
//         error: "Counter not found",
//         message: `No counter found with session ID: ${sessionId}`,
//       });
//       return;
//     }

//     const isOpen = session.counter.dateOpened && !session.counter.dateClosed;

//     res.json({
//       success: true,
//       data: {
//         sessionId,
//         deviceId: session.deviceId,
//         key: session.counter.key,
//         dateOpened: session.counter.dateOpened,
//         dateClosed: session.counter.dateClosed,
//         status: isOpen ? "open" : "closed",
//         isOpen,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve counter information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function updateCounterInfo(req: Request, res: Response): Promise<void> {
//   try {
//     const updates = req.body;

//     if (!req.session.counter) {
//       req.session.counter = {};
//     }

//         const allowedFields = ["dateOpened", "dateClosed"];

//     Object.keys(updates).forEach((key) => {
//       if (allowedFields.includes(key)) {
//         (req.session.counter as any)[key] = updates[key];
//       }
//     });

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
//         message: "Counter information updated successfully",
//         data: req.session.counter,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to update counter information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function getActiveCounters(req: Request, res: Response): Promise<void> {
//   try {
//     const sessions = fetchSessions();
//     const activeCounters: Array<{
//       sessionId: string;
//       deviceId?: string;
//       key?: string;
//       dateOpened?: string;
//       status: string;
//     }> = [];

//     sessions.forEach((session, sessionId) => {
//       if (session.counter && session.counter.dateOpened && !session.counter.dateClosed) {
//         activeCounters.push({
//           sessionId,
//           deviceId: session.deviceId,
//           key: session.counter.key,
//           dateOpened: session.counter.dateOpened,
//           status: "open",
//         });
//       }
//     });

//     activeCounters.sort((a, b) => {
//       const dateA = new Date(a.dateOpened || 0).getTime();
//       const dateB = new Date(b.dateOpened || 0).getTime();
//       return dateA - dateB;
//     });

//     res.json({
//       success: true,
//       data: {
//         total: activeCounters.length,
//         counters: activeCounters,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve active counters",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function deleteCounterInfo(req: Request, res: Response): Promise<void> {
//   try {
//     if (!req.session.counter) {
//       res.status(404).json({
//         success: false,
//         error: "No counter information found",
//       });
//       return;
//     }

//     const deletedData = { ...req.session.counter };
//     delete req.session.counter;

//     req.session.save((err) => {
//       if (err) {
//         res.status(500).json({
//           success: false,
//           error: "Failed to delete counter information",
//           message: err.message,
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         message: "Counter information deleted successfully",
//         deletedData,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete counter information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function serveApplicant(req: Request, res: Response): Promise<void> {
//   try {
//     const { sessionId } = req.body;

//     if (!sessionId) {
//       res.status(400).json({
//         success: false,
//         error: "Session ID is required",
//       });
//       return;
//     }

//     const sessions = fetchSessions();
//     const applicantSession = sessions.get(sessionId);

//     if (!applicantSession || !applicantSession.applicant) {
//       res.status(404).json({
//         success: false,
//         error: "Applicant not found",
//       });
//       return;
//     }

//     // Update the session data
//     applicantSession.applicant.dateServed = new Date().toISOString();
//     applicantSession.applicant.closedServed = "completed";

//     // Save to database
//     storeSession(sessionId, applicantSession);

//     res.json({
//       success: true,
//       message: "Applicant marked as served",
//       data: {
//         sessionId,
//         name: applicantSession.applicant.name,
//         dateServed: applicantSession.applicant.dateServed,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to serve applicant",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function markApplicantMissing(req: Request, res: Response): Promise<void> {
//   try {
//     const { sessionId } = req.body;

//     if (!sessionId) {
//       res.status(400).json({
//         success: false,
//         error: "Session ID is required",
//       });
//       return;
//     }

//     const sessions = fetchSessions();
//     const applicantSession = sessions.get(sessionId);

//     if (!applicantSession || !applicantSession.applicant) {
//       res.status(404).json({
//         success: false,
//         error: "Applicant not found",
//       });
//       return;
//     }

//     // Update the session data
//     applicantSession.applicant.closedServed = "missing";
//     applicantSession.applicant.dateServed = new Date().toISOString();

//     // Save to database
//     storeSession(sessionId, applicantSession);

//     res.json({
//       success: true,
//       message: "Applicant marked as missing",
//       data: {
//         sessionId,
//         name: applicantSession.applicant.name,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to mark applicant as missing",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function closeApplicantRequest(req: Request, res: Response): Promise<void> {
//   try {
//     const { sessionId } = req.body;

//     if (!sessionId) {
//       res.status(400).json({
//         success: false,
//         error: "Session ID is required",
//       });
//       return;
//     }

//     const sessions = fetchSessions();
//     const applicantSession = sessions.get(sessionId);

//     if (!applicantSession || !applicantSession.applicant) {
//       res.status(404).json({
//         success: false,
//         error: "Applicant not found",
//       });
//       return;
//     }

//     // Update the session data
//     applicantSession.applicant.closedServed = "closed";
//     applicantSession.applicant.dateServed = new Date().toISOString();

//     // Save to database
//     storeSession(sessionId, applicantSession);

//     res.json({
//       success: true,
//       message: "Applicant request closed",
//       data: {
//         sessionId,
//         name: applicantSession.applicant.name,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to close applicant request",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function logoutCounter(req: Request, res: Response): Promise<void> {
//   try {
//     if (!req.session.counter) {
//       res.status(404).json({
//         success: false,
//         error: "No counter session found",
//       });
//       return;
//     }

//     // Close the counter if it's still open
//     if (req.session.counter.dateOpened && !req.session.counter.dateClosed) {
//       req.session.counter.dateClosed = new Date().toISOString();
//     }

//     // Clear the counter data to allow re-login
//     delete req.session.counter;

//     req.session.save((err) => {
//       if (err) {
//         res.status(500).json({
//           success: false,
//           error: "Failed to logout",
//           message: err.message,
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         message: "Logged out successfully. Counter session ended.",
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to logout",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }
// export async function getCounterInfo(req: Request, res: Response): Promise<void> {
//   try {
//     const counter = req.session.counter;

//     if (!counter) {
//       res.status(404).json({
//         success: false,
//         error: "No counter information found in session",
//         message: "This session does not have counter data. Please open a counter first.",
//       });
//       return;
//     }

//     const isOpen = counter.dateOpened && !counter.dateClosed;

//     res.json({
//       success: true,
//       data: {
//         sessionId: req.sessionID,
//         deviceId: req.session.deviceId,
//         key: counter.key,
//         dateOpened: counter.dateOpened,
//         dateClosed: counter.dateClosed,
//         status: isOpen ? "open" : "closed",
//         isOpen,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Failed to retrieve counter information",
//       message: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// }