import type { Metadata } from "next";
import { UserCog, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Trainers | VA Admin" };

export default function TrainersPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage trainers and instructor assignments
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add Trainer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 rounded-full p-4">
            <UserCog className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Trainer Management
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          This feature is coming soon. You&apos;ll be able to add trainers,
          assign them to courses, track their schedules, and manage instructor
          profiles.
        </p>
      </div>
    </>
  );
}
