"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, BookOpen, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProfileData {
  readonly name: string;
  readonly email: string;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly createdAt: string;
  readonly enrollmentFullName: string;
  readonly educationalBackground: string;
  readonly technicalSkills: readonly string[];
  readonly toolsFamiliarity: readonly string[];
  readonly courseTitle: string;
}

interface FormState {
  readonly name: string;
  readonly bio: string;
}

type Status = "idle" | "loading" | "saving" | "success" | "error";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatToolName(tool: string): string {
  return tool
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

const BIO_MAX_LENGTH = 500;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", bio: "" });
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);

  /* ---- Fetch profile on mount ---- */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/student/profile");
        const json = await res.json();

        if (!res.ok || !json.success) {
          setStatus("error");
          setMessage(json.error ?? "Failed to load profile");
          return;
        }

        const data = json.data as ProfileData;
        setProfile(data);
        setForm({ name: data.name, bio: data.bio ?? "" });
        setStatus("idle");
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    }

    fetchProfile();
  }, []);

  /* ---- Form handlers ---- */
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, name: e.target.value }));
      setMessage(null);
    },
    []
  );

  const handleBioChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= BIO_MAX_LENGTH) {
        setForm((prev) => ({ ...prev, bio: value }));
        setMessage(null);
      }
    },
    []
  );

  /* ---- Save handler ---- */
  const handleSave = useCallback(async () => {
    if (form.name.trim().length < 2) {
      setStatus("error");
      setMessage("Name must be at least 2 characters.");
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          bio: form.bio.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatus("error");
        setMessage(json.error ?? "Failed to save changes.");
        return;
      }

      setProfile((prev) =>
        prev
          ? { ...prev, name: json.data.name, bio: json.data.bio }
          : prev
      );
      setStatus("success");
      setMessage("Profile updated successfully.");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }, [form]);

  /* ---- Derived state ---- */
  const hasChanges =
    profile !== null &&
    (form.name.trim() !== profile.name ||
      (form.bio.trim() || null) !== (profile.bio || null));

  const isSaveDisabled =
    status === "saving" || !hasChanges || form.name.trim().length < 2;

  /* ---- Loading state ---- */
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
        <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
      </div>
    );
  }

  /* ---- Error state (no profile loaded) ---- */
  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
        {message ?? "Failed to load profile."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Profile Header ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-700">
                {getInitials(profile.name)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-500">{profile.courseTitle}</p>
          </div>
        </div>
      </div>

      {/* ---- Status Messages ---- */}
      {message && status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {message}
        </div>
      )}
      {message && status === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {/* ---- Editable Section ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Edit Profile
        </h3>

        {/* Name */}
        <div>
          <label
            htmlFor="profile-name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            maxLength={100}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Your display name"
          />
          {form.name.trim().length > 0 && form.name.trim().length < 2 && (
            <p className="text-xs text-red-500 mt-1">
              Name must be at least 2 characters
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="profile-bio"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={form.bio}
            onChange={handleBioChange}
            maxLength={BIO_MAX_LENGTH}
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            placeholder="Tell us a bit about yourself..."
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.bio.length}/{BIO_MAX_LENGTH}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          >
            {status === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {status === "saving" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ---- Read-Only Info ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Email" value={profile.email} />
          <InfoField label="Course Enrolled" value={profile.courseTitle} />
          <InfoField
            label="Enrollment Date"
            value={formatDate(profile.createdAt)}
          />
          <InfoField
            label="Educational Background"
            value={profile.educationalBackground}
          />
        </div>
      </div>

      {/* ---- Skills & Tools ---- */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Skills & Tools
        </h3>

        {/* Technical Skills */}
        {profile.technicalSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Technical Skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.technicalSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools Familiarity */}
        {profile.toolsFamiliarity.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Tools Familiarity
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.toolsFamiliarity.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {formatToolName(tool)}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.technicalSkills.length === 0 &&
          profile.toolsFamiliarity.length === 0 && (
            <p className="text-sm text-gray-400">
              No skills or tools listed yet.
            </p>
          )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Read-only info field                                */
/* ------------------------------------------------------------------ */

function InfoField({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
