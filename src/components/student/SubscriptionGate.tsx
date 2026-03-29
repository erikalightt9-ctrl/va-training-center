"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubscriptionGateProps {
  readonly children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/student/subscription");
      const json = await res.json();
      if (json.success) {
        setIsSubscribed(json.data.isSubscribed);
        setHasPending(json.data.pendingSubscription !== null);
      }
    } catch {
      // On error, assume not subscribed — will show gate
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isSubscribed) {
    return <>{children}</>;
  }

  /* ---------------------------------------------------------------- */
  /*  Lock overlay — student is not subscribed                         */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative">
      {/* Blurred background preview */}
      <div className="opacity-20 pointer-events-none blur-sm select-none" aria-hidden>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md text-center mx-4">
          <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            AI Premium Feature
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            {hasPending
              ? "Your subscription is pending approval. You'll get access once the admin confirms your payment."
              : "Unlock all AI-powered training tools with an AI Premium subscription. Practice with AI simulators, mock interviews, email writing, and more."}
          </p>

          {hasPending ? (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-600 text-sm font-medium rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Awaiting Admin Approval
            </div>
          ) : (
            <Button asChild className="gap-2">
              <Link href="/student/ai-premium">
                <Sparkles className="h-4 w-4" />
                Upgrade to AI Premium
              </Link>
            </Button>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Starting at ₱299/month
          </p>
        </div>
      </div>
    </div>
  );
}
