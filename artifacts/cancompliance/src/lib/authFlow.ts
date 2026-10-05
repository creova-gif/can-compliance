/** Session task keys from `@clerk/react` 6.17 (`SessionTask['key']`). */
export const SESSION_TASK_KEYS = ["choose-organization", "reset-password", "setup-mfa"] as const;

export type SessionTaskKey = (typeof SESSION_TASK_KEYS)[number];

/** Hub that renders `TaskChooseOrganization`, `TaskResetPassword`, and `TaskSetupMFA`. */
export const SESSION_TASK_HUB = "/session-tasks";

/**
 * Clerk falls back to `/sign-in/tasks/...` when `taskUrls` is unset. That path
 * is swallowed by the `/sign-in/*?` route, so every task must point at the hub.
 */
export function sessionTaskUrls(basePath: string): Record<SessionTaskKey, string> {
  const hub = `${basePath}${SESSION_TASK_HUB}`;
  return {
    "choose-organization": hub,
    "reset-password": hub,
    "setup-mfa": hub,
  };
}

export type ProtectedDecision = "demo" | "loading" | "session-tasks" | "sign-in" | "allow";

/**
 * Pending sessions are signed out by default (`treatPendingAsSignedOut` defaults
 * to true). They still have to reach the task hub instead of `/sign-in`.
 */
export function protectedRouteDecision(input: {
  demo: boolean;
  loaded: boolean;
  signedIn: boolean;
  hasPendingTask: boolean;
}): ProtectedDecision {
  if (input.demo) return "demo";
  if (!input.loaded) return "loading";
  if (input.hasPendingTask) return "session-tasks";
  if (!input.signedIn) return "sign-in";
  return "allow";
}

export type PublicDecision = "children" | "session-tasks" | "dashboard";

/** Signed-in users go to the app. A pending task still has to be finished first. */
export function publicRouteDecision(input: {
  loaded: boolean;
  signedIn: boolean;
  hasPendingTask: boolean;
}): PublicDecision {
  if (!input.loaded) return "children";
  if (input.hasPendingTask) return "session-tasks";
  if (input.signedIn) return "dashboard";
  return "children";
}

export type HomeDecision = "landing" | "session-tasks" | "dashboard";

export function homeRouteDecision(input: {
  loaded: boolean;
  signedIn: boolean;
  hasPendingTask: boolean;
}): HomeDecision {
  if (!input.loaded) return "landing";
  if (input.hasPendingTask) return "session-tasks";
  if (input.signedIn) return "dashboard";
  return "landing";
}

export type SessionTasksDecision = "loading" | "stay" | "dashboard" | "sign-in";

/**
 * A finished task leaves an active session and should continue to the app.
 * No session at all is a signed-out visit, which must not bounce through
 * `/dashboard` (that route sends signed-out users back to `/sign-in`).
 */
export function sessionTasksDecision(input: {
  loaded: boolean;
  hasSession: boolean;
  hasTask: boolean;
}): SessionTasksDecision {
  if (!input.loaded) return "loading";
  if (input.hasTask) return "stay";
  if (input.hasSession) return "dashboard";
  return "sign-in";
}

/**
 * Statuses that still need a second factor or device trust before `finalize()`.
 * `@clerk/react` 6.17 `HandleSSOCallback` only redirects `needs_second_factor`
 * (and `needs_new_password`) to the sign-in page. `needs_client_trust` is ignored.
 */
export function signInNeedsFactorChallenge(status: string | null | undefined): boolean {
  return status === "needs_second_factor" || status === "needs_client_trust";
}
