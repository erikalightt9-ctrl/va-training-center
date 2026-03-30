"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Local type — TrainingTier is not yet in the generated Prisma client
type TierRow = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
  isActive: boolean;
  order: number;
};

interface TiersManagerProps {
  initialTiers: TierRow[];
}

interface TierFormData {
  name: string;
  price: string;
  description: string;
  features: string;
  isActive: boolean;
  order: string;
}

const emptyForm: TierFormData = {
  name: "",
  price: "",
  description: "",
  features: "",
  isActive: true,
  order: "0",
};

function parseFeatures(raw: string): string[] {
  return raw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

function formatPrice(price: number | { toString(): string }): string {
  return `₱${Number(price).toLocaleString("en-PH")}`;
}

export function TiersManager({ initialTiers }: TiersManagerProps) {
  const [tiers, setTiers] = useState<TierRow[]>(initialTiers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TierFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: String(tiers.length) });
    setError("");
    setShowForm(true);
  };

  const openEdit = (tier: TierRow) => {
    setEditingId(tier.id);
    setForm({
      name: tier.name,
      price: String(Number(tier.price)),
      description: tier.description ?? "",
      features: tier.features.join("\n"),
      isActive: tier.isActive,
      order: String(tier.order),
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async () => {
    const price = parseFloat(form.price);
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (isNaN(price) || price < 0) { setError("Enter a valid price."); return; }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      price,
      description: form.description.trim() || undefined,
      features: parseFeatures(form.features),
      isActive: form.isActive,
      order: parseInt(form.order) || 0,
    };

    try {
      const url = editingId
        ? `/api/admin/tiers/${editingId}`
        : "/api/admin/tiers";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to save tier.");
        return;
      }

      if (editingId) {
        setTiers((prev) => prev.map((t) => (t.id === editingId ? json.data : t)));
      } else {
        setTiers((prev) => [...prev, json.data].sort((a, b) => a.order - b.order));
      }
      closeForm();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tier? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tiers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete tier.");
        return;
      }
      setTiers((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (tier: TierRow) => {
    try {
      const res = await fetch(`/api/admin/tiers/${tier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tier.isActive }),
      });
      const json = await res.json();
      if (res.ok) {
        setTiers((prev) => prev.map((t) => (t.id === tier.id ? json.data : t)));
      }
    } catch {
      // silent
    }
  };

  return (
    <div>
      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white rounded-xl border p-5 flex flex-col gap-3 transition-opacity ${
              tier.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-base">{tier.name}</p>
                <p className="text-2xl font-bold text-blue-700 mt-0.5">
                  {formatPrice(tier.price)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(tier)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tier.id)}
                  disabled={deletingId === tier.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {tier.description && (
              <p className="text-sm text-gray-500">{tier.description}</p>
            )}

            {tier.features.length > 0 && (
              <ul className="space-y-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">Order: {tier.order}</span>
              <button
                type="button"
                onClick={() => toggleActive(tier)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  tier.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {tier.isActive ? "Active" : "Hidden"}
              </button>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          type="button"
          onClick={openAdd}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[160px]"
        >
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Add Tier</span>
        </button>
      </div>

      {tiers.length === 0 && !showForm && (
        <p className="text-center text-gray-400 text-sm py-4">
          No tiers yet. Click &quot;Add Tier&quot; to create your first pricing tier.
        </p>
      )}

      {/* Form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Tier" : "New Tier"}
              </h2>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tier-name">Tier Name *</Label>
                <Input
                  id="tier-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Basic, Professional, Advanced"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tier-price">Price (₱) *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <Input
                    id="tier-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tier-description">Description</Label>
                <Input
                  id="tier-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Core concepts and beginner exercises"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tier-features">
                  Features{" "}
                  <span className="text-gray-400 font-normal">(one per line)</span>
                </Label>
                <Textarea
                  id="tier-features"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder={"Introduction modules\nCore concept lessons\nBeginner exercises\nSimple quizzes\nBasic certificate"}
                  rows={6}
                  className="mt-1 font-mono text-sm"
                />
                {form.features && (
                  <p className="text-xs text-gray-400 mt-1">
                    {parseFeatures(form.features).length} feature(s)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier-order">Display Order</Label>
                  <Input
                    id="tier-order"
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Tier"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
