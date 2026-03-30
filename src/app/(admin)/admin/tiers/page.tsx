import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TiersManager } from "@/components/admin/TiersManager";
import { getAllTiers } from "@/lib/repositories/tier.repository";

export const metadata: Metadata = { title: "Training Tiers | VA Admin" };

export default async function TiersPage() {
  const rawTiers = await getAllTiers();
  const tiers = rawTiers.map((t) => ({
    ...t,
    price: Number(t.price),
  }));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Training Tiers</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage pricing tiers shown on the enrollment form. Changes apply immediately.
        </p>
      </div>
      <TiersManager initialTiers={tiers} />
    </AdminLayout>
  );
}
