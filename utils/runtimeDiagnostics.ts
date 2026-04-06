const RUNTIME_ISSUES_KEY = "css3d-playground:runtime-issues";
const RUNTIME_EVENT_NAME = "css3d-playground:runtime-issue";

interface RuntimeIssue {
  scope: string;
  message: string;
  error: string;
  timestamp: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export function reportRuntimeIssue(scope: string, error: unknown, message: string) {
  if (typeof window === "undefined") return;

  const issue: RuntimeIssue = {
    scope,
    message,
    error: getErrorMessage(error),
    timestamp: new Date().toISOString(),
  };

  try {
    const current = window.sessionStorage.getItem(RUNTIME_ISSUES_KEY);
    const issues = current ? (JSON.parse(current) as RuntimeIssue[]) : [];
    issues.unshift(issue);
    window.sessionStorage.setItem(RUNTIME_ISSUES_KEY, JSON.stringify(issues.slice(0, 20)));
  } catch {
    // Ignore diagnostics storage failures.
  }

  window.dispatchEvent(new CustomEvent<RuntimeIssue>(RUNTIME_EVENT_NAME, { detail: issue }));
}
