import assert from "node:assert/strict";
import test from "node:test";
import {
  SESSION_TASK_HUB,
  SESSION_TASK_KEYS,
  homeRouteDecision,
  protectedRouteDecision,
  publicRouteDecision,
  sessionTaskUrls,
  sessionTasksDecision,
  signInNeedsFactorChallenge,
} from "./authFlow.ts";

test("taskUrls send every pending session task to the session-tasks hub", () => {
  const urls = sessionTaskUrls("");
  assert.deepEqual(Object.keys(urls).sort(), [...SESSION_TASK_KEYS].sort());
  for (const key of SESSION_TASK_KEYS) {
    assert.equal(urls[key], SESSION_TASK_HUB);
  }
});

test("taskUrls keep the app base path so Clerk does not fall back to /sign-in/tasks", () => {
  const urls = sessionTaskUrls("/app");
  for (const key of SESSION_TASK_KEYS) {
    assert.equal(urls[key], `/app${SESSION_TASK_HUB}`);
  }
});

test("a pending session is sent to the task hub instead of the sign-in form", () => {
  assert.equal(
    protectedRouteDecision({ demo: false, loaded: true, signedIn: false, hasPendingTask: true }),
    "session-tasks",
  );
});

test("a signed-out visit without a pending task still goes to sign-in", () => {
  assert.equal(
    protectedRouteDecision({ demo: false, loaded: true, signedIn: false, hasPendingTask: false }),
    "sign-in",
  );
});

test("an active session with no task is allowed through", () => {
  assert.equal(
    protectedRouteDecision({ demo: false, loaded: true, signedIn: true, hasPendingTask: false }),
    "allow",
  );
});

test("demo mode bypasses Clerk, and auth stays loading until Clerk is ready", () => {
  assert.equal(
    protectedRouteDecision({ demo: true, loaded: false, signedIn: false, hasPendingTask: false }),
    "demo",
  );
  assert.equal(
    protectedRouteDecision({ demo: false, loaded: false, signedIn: false, hasPendingTask: false }),
    "loading",
  );
});

test("public and home routes prefer the task hub over the app while a task is pending", () => {
  const pending = { loaded: true, signedIn: false, hasPendingTask: true };
  assert.equal(publicRouteDecision(pending), "session-tasks");
  assert.equal(homeRouteDecision(pending), "session-tasks");
  assert.equal(publicRouteDecision({ loaded: true, signedIn: true, hasPendingTask: false }), "dashboard");
  assert.equal(homeRouteDecision({ loaded: false, signedIn: false, hasPendingTask: false }), "landing");
  assert.equal(publicRouteDecision({ loaded: false, signedIn: false, hasPendingTask: false }), "children");
});

test("the task hub stays put for a pending task and does not loop through the dashboard", () => {
  assert.equal(sessionTasksDecision({ loaded: true, hasSession: true, hasTask: true }), "stay");
  assert.equal(sessionTasksDecision({ loaded: true, hasSession: true, hasTask: false }), "dashboard");
  assert.equal(sessionTasksDecision({ loaded: true, hasSession: false, hasTask: false }), "sign-in");
  assert.equal(sessionTasksDecision({ loaded: false, hasSession: false, hasTask: false }), "loading");
});

test("SSO second factor and device trust both stay on a challenge instead of a spinner", () => {
  assert.equal(signInNeedsFactorChallenge("needs_second_factor"), true);
  assert.equal(signInNeedsFactorChallenge("needs_client_trust"), true);
  assert.equal(signInNeedsFactorChallenge("complete"), false);
  assert.equal(signInNeedsFactorChallenge("needs_first_factor"), false);
  assert.equal(signInNeedsFactorChallenge("needs_new_password"), false);
  assert.equal(signInNeedsFactorChallenge(null), false);
});
