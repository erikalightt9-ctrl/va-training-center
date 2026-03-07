"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Shield,
  Mail,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingsData {
  readonly name: string;
  readonly email: string;
  readonly portfolioPublic: boolean;
  readonly createdAt: string;
  readonly courseTitle: string;
}

interface PasswordForm {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

type PageStatus = "loading" | "ready" | "error";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const INITIAL_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [pageError, setPageError] = useState<string | null>(null);

  /* ---- Password state ---- */
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(INITIAL_PASSWORD_FORM);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /* ---- Privacy state ---- */
  const [isPublic, setIsPublic] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  /* ---- Fetch settings on mount ---- */
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/student/settings");
        const json = await res.json();

        if (!res.ok || !json.success) {
          setPageStatus("error");
          setPageError(json.error ?? "Failed to load settings");
          return;
        }

        const data = json.data as SettingsData;
        setSettings(data);
        setIsPublic(data.portfolioPublic);
        setPageStatus("ready");
      } catch {
        setPageStatus("error");
        setPageError("Network error. Please try again.");
      }
    }

    fetchSettings();
  }, []);

  /* ---- Password handlers ---- */
  const handlePasswordField = useCallback(
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
      setPasswordMessage(null);
      setPasswordError(null);
    },
    []
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMessage(null);
      setPasswordError(null);

      if (passwordForm.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }

      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setPasswordError(
          "New password must be different from current password."
        );
        return;
      }

      setPasswordSaving(true);

      try {
        const res = await fetch("/api/student/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setPasswordError(json.error ?? "Failed to change password.");
          return;
        }

        setPasswordMessage("Password changed successfully.");
        setPasswordForm(INITIAL_PASSWORD_FORM);
        setShowCurrent(false);
        setShowNew(false);
        setTimeout(() => setPasswordMessage(null), 3000);
      } catch {
        setPasswordError("Network error. Please try again.");
      } finally {
        setPasswordSaving(false);
      }
    },
    [passwordForm]
  );

  const isPasswordValid =
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length >= 8 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  /* ---- Privacy handler ---- */
  const handleVisibilityToggle = useCallback(
    async (checked: boolean) => {
      setPrivacySaving(true);
      setPrivacyMessage(null);
      setPrivacyError(null);

      try {
        const res = await fetch("/api/student/portfolio", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: checked }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setPrivacyError(json.error ?? "Failed to update visibility.");
          return;
        }

        setIsPublic(json.data.isPublic);
        setPrivacyMessage("Portfolio visibility updated.");
        setTimeout(() => setPrivacyMessage(null), 3000);
      } catch {
        setPrivacyError("Network error. Please try again.");
      } finally {
        setPrivacySaving(false);
      }
    },
    []
  );

  /* ---- Loading state ---- */
  if (pageStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-500">Loading settings...</span>
      </div>
    );
  }

  /* ---- Error state (no settings loaded) ---- */
  if (pageStatus === "error" || !settings) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
        {pageError ?? "Failed to load settings."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/*  Section 1: Change Password                                      */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Change Password
          </h3>
        </div>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {passwordError}
          </div>
        )}
        {passwordMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordField("currentPassword")}
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordField("newPassword")}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.newPassword.length > 0 &&
              passwordForm.newPassword.length < 8 && (
                <p className="text-xs text-red-500 mt-1">
                  Must be at least 8 characters
                </p>
              )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordField("confirmPassword")}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            {passwordForm.confirmPassword.length > 0 &&
              passwordForm.confirmPassword !== passwordForm.newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isPasswordValid || passwordSaving}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ================================================================ */}
      {/*  Section 2: Privacy                                              */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Privacy
          </h3>
        </div>

        {privacyError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {privacyError}
          </div>
        )}
        {privacyMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {privacyMessage}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Portfolio Visibility
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              When enabled, your portfolio is visible to employers and other
              users
            </p>
          </div>
          <div className="flex items-center gap-2">
            {privacySaving && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
            <Switch
              checked={isPublic}
              onCheckedChange={handleVisibilityToggle}
              disabled={privacySaving}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {isPublic
            ? "Your portfolio is currently public."
            : "Your portfolio is currently private."}
        </p>
      </div>

      {/* ================================================================ */}
      {/*  Section 3: Account Info                                         */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
          Account Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Email Address
              </dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {settings.email}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Account Created
              </dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {formatDate(settings.createdAt)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Current Course
              </dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {settings.courseTitle}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
