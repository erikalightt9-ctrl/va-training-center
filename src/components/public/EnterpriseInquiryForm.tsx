"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const enterpriseSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  teamSize: z.string().min(1, "Please select a team size"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type EnterpriseFormData = z.infer<typeof enterpriseSchema>;

type FormStatus = "idle" | "submitting" | "success" | "error";

const TEAM_SIZE_OPTIONS = [
  { value: "5-10", label: "5 - 10 trainees" },
  { value: "11-25", label: "11 - 25 trainees" },
  { value: "25-50", label: "25 - 50 trainees" },
  { value: "50+", label: "50+ trainees" },
] as const;

export function EnterpriseInquiryForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EnterpriseFormData>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      teamSize: "",
      message: "",
    },
  });

  const onSubmit = async (data: EnterpriseFormData) => {
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.contactPerson,
          email: data.email,
          subject: `[Enterprise Inquiry] ${data.companyName} — ${data.teamSize} trainees`,
          message: [
            `Company: ${data.companyName}`,
            `Contact Person: ${data.contactPerson}`,
            `Email: ${data.email}`,
            data.phone ? `Phone: ${data.phone}` : null,
            `Team Size: ${data.teamSize}`,
            "",
            data.message,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });

      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          Inquiry Sent!
        </h3>
        <p className="text-gray-600 text-sm">
          Thank you for your interest in our enterprise training programs. Our
          team will get back to you within 1-2 business days.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setStatus("idle")}
        >
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="Your company name"
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs">{errors.companyName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            placeholder="Your full name"
            {...register("contactPerson")}
          />
          {errors.contactPerson && (
            <p className="text-red-500 text-xs">
              {errors.contactPerson.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+63 XXX XXX XXXX"
            {...register("phone")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="teamSize">Team Size</Label>
        <Select
          onValueChange={(value) => setValue("teamSize", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            {TEAM_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teamSize && (
          <p className="text-red-500 text-xs">{errors.teamSize.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your training needs..."
          rows={5}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-red-500 text-xs">{errors.message.message}</p>
        )}
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-blue-700 hover:bg-blue-800"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Submit Inquiry"
        )}
      </Button>
    </form>
  );
}
