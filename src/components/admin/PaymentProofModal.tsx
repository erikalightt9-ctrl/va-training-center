"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";

interface PaymentProofModalProps {
  proofFilePath: string;
  proofFileName?: string | null;
}

export function PaymentProofModal({ proofFilePath, proofFileName }: PaymentProofModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isPdf = proofFilePath.endsWith(".pdf");

  if (isPdf) {
    return (
      <a
        href={proofFilePath}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-700 hover:underline text-xs"
      >
        View PDF
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image
          src={proofFilePath}
          alt={proofFileName ?? "Payment proof"}
          width={48}
          height={48}
          className="rounded border border-gray-200 object-cover"
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {proofFileName ?? "Payment Proof"}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={proofFilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-56px)] p-4 flex items-center justify-center">
              <Image
                src={proofFilePath}
                alt={proofFileName ?? "Payment proof"}
                width={800}
                height={600}
                className="rounded object-contain max-w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
