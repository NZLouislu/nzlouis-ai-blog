import { NextRequest, NextResponse } from "next/server";
import { createSession } from "../../../../lib/auth/session";
import { UserSession } from "../../../../lib/auth/session";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "nzlouis.com@gmail.com").toLowerCase();

interface TokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  exp?: string;
  error_description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google login is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 }
      );
    }

    const info: TokenInfo = await res.json();

    const emailVerified =
      info.email_verified === true || info.email_verified === "true";

    if (
      info.aud !== clientId ||
      !emailVerified ||
      !info.email ||
      info.email.toLowerCase() !== ADMIN_EMAIL
    ) {
      return NextResponse.json(
        { error: "This account is not authorized as admin" },
        { status: 403 }
      );
    }

    if (info.exp && Number(info.exp) * 1000 < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const user = {
      id: "nzlouis",
      username: info.email,
      name: info.name || info.email.split("@")[0],
      role: "admin" as const,
      languagePreferences: "both",
    };

    const session: UserSession = createSession(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        languagePreferences: user.languagePreferences,
      },
      session,
    });

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error) {
    console.error("Google login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
