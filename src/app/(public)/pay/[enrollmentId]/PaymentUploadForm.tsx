"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle } from "lucide-react";

interface PaymentUploadFormProps {
  enrollmentId: string;
}

export function PaymentUploadForm({ enrollmentId }: PaymentUploadFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"GCASH" | "BANK_TRANSFER">("GCASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setError("Please enter the payment reference number.");
      return;
    }
    if (!paidAt) {
      setError("Please select the date you made the payment.");
      return;
    }
    if (!file) {
      setError("Please upload your payment proof screenshot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("enrollmentId", enrollmentId);
      formData.append("method", method);
      formData.append("proof", file);
      formData.append("referenceNumber", referenceNumber.trim());
      formData.append("paidAt", paidAt);

      const res = await fetch("/api/payments/submit-proof", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to submit payment proof.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-green-700 text-lg">Payment Proof Submitted!</h3>
        <p className="text-gray-500 text-sm mt-1">
          We&apos;ll review it within 24 hours and email you once confirmed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("GCASH")}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
              method === "GCASH"
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            GCash
          </button>
          <button
            type="button"
            onClick={() => setMethod("BANK_TRANSFER")}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
              method === "BANK_TRANSFER"
                ? "border-purple-500 bg-purple-50 text-purple-800"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Bank Transfer
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="e.g. GCash ref number"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Payment <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Proof Screenshot <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="proof-upload"
          />
          <label htmlFor="proof-upload" className="cursor-pointer">
            {file ? (
              <div>
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">Click to change</p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload screenshot</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or PDF (max 5MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !file || !referenceNumber.trim() || !paidAt}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </Button>
    </form>
  );
}
