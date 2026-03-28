"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Mail, Phone, Star, BookOpen, Search } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Trainer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly bio: string | null;
  readonly specialization: string | null;
  readonly isActive: boolean;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateTrainersPage() {
  const [trainers, setTrainers] = useState<ReadonlyArray<Trainer>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/corporate/trainers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTrainers(json.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization ?? "").toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Certified trainers assigned to your organization
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search trainers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search ? "No trainers match your search" : "No trainers assigned yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Contact your account manager to request trainer assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {trainer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{trainer.name}</p>
                  {trainer.specialization && (
                    <p className="text-xs text-indigo-600 truncate">{trainer.specialization}</p>
                  )}
                </div>
                {trainer.isActive && (
                  <span className="ml-auto shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Bio */}
              {trainer.bio && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{trainer.bio}</p>
              )}

              {/* Contact */}
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <a
                  href={`mailto:${trainer.email}`}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{trainer.email}</span>
                </a>
                {trainer.phone && (
                  <a
                    href={`tel:${trainer.phone}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {trainer.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" />
          <span>Trainers are assigned by your platform administrator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{filtered.length} trainer{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
