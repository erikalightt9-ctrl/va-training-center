"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserCog,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrainerSummary {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  specializations: string[];
  yearsOfExperience: number;
  isActive?: boolean;
  accessGranted?: boolean;
}

interface Assignment {
  assignmentId: string;
  assignedAt: string;
  isActive: boolean;
  trainer: TrainerSummary;
}

interface Data {
  assigned: Assignment[];
  available: TrainerSummary[];
}

// ---------------------------------------------------------------------------
// Feedback banner
// ---------------------------------------------------------------------------

function Banner({ type, message }: { type: "success" | "error"; message: string }) {
  const base = "flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4";
  return type === "success" ? (
    <div className={`${base} bg-green-50 border border-green-200 text-green-700`}>
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  ) : (
    <div className={`${base} bg-red-50 border border-red-200 text-red-700`}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TenantTrainersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tenantId } = use(params);

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [working, setWorking] = useState<string | null>(null); // trainerId being mutated
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/trainers`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else showBanner("error", json.error ?? "Failed to load trainers");
    } catch {
      showBanner("error", "Network error");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  async function assign(trainerId: string) {
    setWorking(trainerId);
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/trainers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId }),
      });
      const json = await res.json();
      if (!json.success) { showBanner("error", json.error ?? "Failed to assign"); return; }
      showBanner("success", "Trainer assigned successfully.");
      await load();
    } catch {
      showBanner("error", "Network error");
    } finally {
      setWorking(null);
    }
  }

  async function unassign(trainerId: string) {
    setWorking(trainerId);
    try {
      const res = await fetch(
        `/api/superadmin/tenants/${tenantId}/trainers/${trainerId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!json.success) { showBanner("error", json.error ?? "Failed to remove"); return; }
      showBanner("success", "Trainer removed from tenant.");
      await load();
    } catch {
      showBanner("error", "Network error");
    } finally {
      setWorking(null);
    }
  }

  const filteredAvailable = (data?.available ?? []).filter(
    (t) =>
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/superadmin/tenants/${tenantId}`} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-bold text-slate-900">Trainer Assignments</h1>
        </div>
      </div>

      {banner && <Banner type={banner.type} message={banner.message} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* ── Assigned trainers ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Assigned Trainers
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({data?.assigned.length ?? 0})
                </span>
              </h2>
            </div>

            {data?.assigned.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No trainers assigned yet. Assign from the list below.
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {data?.assigned.map(({ assignmentId, trainer, assignedAt }) => (
                  <div key={assignmentId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {trainer.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {trainer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{trainer.name}</p>
                        <p className="text-xs text-slate-400">{trainer.email}</p>
                      </div>
                      {trainer.specializations.length > 0 && (
                        <div className="hidden sm:flex gap-1 flex-wrap">
                          {trainer.specializations.slice(0, 2).map((s) => (
                            <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 hidden sm:block">
                        {new Date(assignedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unassign(trainer.id)}
                        disabled={working === trainer.id}
                        className="text-red-500 hover:text-red-700 hover:bg-ds-card gap-1"
                      >
                        {working === trainer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Available trainers ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Available Trainers
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({filteredAvailable.length})
                </span>
              </h2>
              <div className="relative w-52">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trainers…"
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {search ? "No trainers match your search." : "All active trainers are already assigned."}
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredAvailable.map((trainer) => (
                  <div key={trainer.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {trainer.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {trainer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{trainer.name}</p>
                        <p className="text-xs text-slate-400">
                          {trainer.email}
                          {trainer.yearsOfExperience > 0 &&
                            ` · ${trainer.yearsOfExperience}y exp`}
                        </p>
                      </div>
                      {trainer.specializations.length > 0 && (
                        <div className="hidden sm:flex gap-1 flex-wrap">
                          {trainer.specializations.slice(0, 2).map((s) => (
                            <span key={s} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => assign(trainer.id)}
                      disabled={working === trainer.id}
                      className="gap-1.5"
                    >
                      {working === trainer.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
