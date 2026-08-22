"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/store/auth";
import { getStoredSession, storeSession } from "../../lib/auth/session";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number>
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi;
      };
    };
  }
}

export default function AdminLogin({ clientId }: { clientId: string }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getStoredSession();
    const adminAuth = localStorage.getItem("adminAuthenticated");

    if (session && adminAuth === "true") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsedAuth = JSON.parse(authStorage);
          if (parsedAuth.state?.user) {
            router.push("/admin/home");
          }
        } catch {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("userSession");
        }
      }
    }
  }, [router]);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google login failed, please try again");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/admin/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.session);
          storeSession(data.session);
          localStorage.setItem("adminAuthenticated", "true");
          router.push("/admin/home");
        } else {
          setError(data.error || "Login failed, please try again");
        }
      } catch {
        setError("Network error, please check connection and try again");
      } finally {
        setIsLoading(false);
      }
    },
    [router, setUser]
  );

  useEffect(() => {
    if (!clientId) return;

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signin_with",
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [clientId, handleCredential]);

  return (
    <div className="flex flex-col items-center gap-4">
      {clientId ? (
        <>
          <div ref={googleButtonRef} />
          {isLoading && (
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          Google login is not configured. Set GOOGLE_CLIENT_ID to enable it.
        </p>
      )}

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
