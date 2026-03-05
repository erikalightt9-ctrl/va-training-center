import { getLeaderboard } from "@/lib/repositories/gamification.repository";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const leaderboard = await getLeaderboard(courseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">See how you rank among your peers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No rankings yet</td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr key={entry.studentId} className={entry.rank <= 3 ? "bg-yellow-50" : ""}>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">
                    {entry.rank === 1 ? "\uD83E\uDD47" : entry.rank === 2 ? "\uD83E\uDD48" : entry.rank === 3 ? "\uD83E\uDD49" : `#${entry.rank}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{entry.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600 text-right">{entry.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
