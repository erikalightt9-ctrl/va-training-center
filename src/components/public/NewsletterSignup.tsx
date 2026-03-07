"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";

interface FormState {
  readonly status: "idle" | "submitting" | "success";
  readonly email: string;
}

const INITIAL_STATE: FormState = {
  status: "idle",
  email: "",
};

export function NewsletterSignup() {
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState.email.trim()) return;

    setFormState({ ...formState, status: "submitting" });

    // Simulate a brief delay, then show success (no real API call)
    setTimeout(() => {
      setFormState({ ...INITIAL_STATE, status: "success" });
    }, 800);
  };

  if (formState.status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 text-lg mb-1">
          You are subscribed!
        </h3>
        <p className="text-gray-600 text-sm">
          Thank you for subscribing. You will receive our latest updates and
          community news.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setFormState(INITIAL_STATE)}
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="email"
          placeholder="Enter your email address"
          required
          value={formState.email}
          onChange={(e) =>
            setFormState({ ...formState, email: e.target.value })
          }
          className="pl-10"
        />
      </div>
      <Button
        type="submit"
        disabled={formState.status === "submitting"}
        className="bg-blue-700 hover:bg-blue-800"
      >
        {formState.status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}
