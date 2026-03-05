"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface AccessToggleProps {
  readonly enrolleeId: string;
  readonly initialValue: boolean;
}

export function AccessToggle({ enrolleeId, initialValue }: AccessToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(initialValue);

  const handleToggle = async (checked: boolean) => {
    setOptimistic(checked);

    try {
      const res = await fetch(`/api/admin/enrollees/${enrolleeId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessGranted: checked }),
      });

      if (!res.ok) {
        setOptimistic(initialValue);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setOptimistic(initialValue);
    }
  };

  return (
    <Switch
      checked={optimistic}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label="Toggle access"
    />
  );
}
