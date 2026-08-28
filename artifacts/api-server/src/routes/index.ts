import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complianceRouter from "./compliance";
import anthropicRouter from "./anthropic/index";
import openaiRouter from "./openai/index";
import apiKeysRouter from "./apikeys";
import ragRouter from "./rag";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Health check stays public (load balancer / uptime probes). Every other
// route previously had no authentication enforced at all -- requireAuth.ts
// existed in this codebase, correctly implemented, but was never imported
// or applied anywhere. clerkMiddleware() (in app.ts) only populates the auth
// context; it does not itself reject unauthenticated requests, so nothing
// was actually protecting client compliance data, API keys, or the AI
// conversation routes until now.
router.use(healthRouter);
router.use(requireAuth);
router.use(complianceRouter);
router.use(anthropicRouter);
router.use(openaiRouter);
router.use(apiKeysRouter);
router.use(ragRouter);

export default router;
