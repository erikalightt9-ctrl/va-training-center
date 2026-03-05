import { useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { format, parse } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { EnrollmentFormData } from "@/lib/validations/enrollment.schema";

interface StepPersonalProps {
  form: UseFormReturn<EnrollmentFormData>;
}

export function StepPersonal({ form }: StepPersonalProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const dateOfBirth = watch("dateOfBirth") ?? "";

  // Parse the stored YYYY-MM-DD string into a Date for the picker
  const selectedDate = useMemo(() => {
    if (!dateOfBirth) return undefined;
    const parsed = parse(dateOfBirth, "yyyy-MM-dd", new Date());
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [dateOfBirth]);

  // Date range: 80 years ago → today
  const { fromDate, toDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliest = new Date(
      today.getFullYear() - 80,
      today.getMonth(),
      today.getDate()
    );
    return { fromDate: earliest, toDate: today };
  }, []);

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setValue("dateOfBirth", format(date, "yyyy-MM-dd"), {
          shouldValidate: true,
        });
      } else {
        setValue("dateOfBirth", "", { shouldValidate: false });
      }
    },
    [setValue]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Personal Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about yourself.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Juan Dela Cruz"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Date of Birth *</Label>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Select your date of birth"
            fromDate={fromDate}
            toDate={toDate}
          />
          {/* Hidden input for react-hook-form registration */}
          <input type="hidden" {...register("dateOfBirth")} />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="contactNumber">Contact Number *</Label>
          <Input
            id="contactNumber"
            placeholder="+63 912 345 6789"
            {...register("contactNumber")}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-xs">
              {errors.contactNumber.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="address">Complete Address *</Label>
          <Textarea
            id="address"
            placeholder="House/Unit No., Street, Barangay, City, Province, ZIP"
            rows={3}
            {...register("address")}
          />
          {errors.address && (
            <p className="text-red-500 text-xs">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
