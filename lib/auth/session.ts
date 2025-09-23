import { User } from "./users";


export interface UserSession extends User {
  expiresAt: Date;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(user: User): UserSession {
  return {
    ...user,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
  };
}

export function getStoredSession(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("userSession");
    if (!stored) return null;

    const session: UserSession = JSON.parse(stored);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem("userSession");
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem("userSession");
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  if (typeof window !== "undefined") {
    return getStoredSession();
  }

  return null;
}

export function storeSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("userSession", JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userSession");
}

export function isSessionValid(session: UserSession | null): boolean {
  if (!session) return false;
  return new Date(session.expiresAt) > new Date();
}
