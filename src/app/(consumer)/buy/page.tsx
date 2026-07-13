"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  buyLeadSchema,
  FINANCE_STATUS_LABELS,
  BUYING_TIMEFRAME_LABELS,
  PROPERTY_TYPE_LABELS,
  type BuyLeadInput,
} from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";

type Suburb = { id: string; name: string; postcode: string };

const inputClass =
  "w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";
const labelClass = "text-sm font-medium text-neutral-700 dark:text-neutral-300";
const errorClass = "text-sm text-red-600 dark:text-red-400";

export default function BuyPage() {
  const router = useRouter();
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BuyLeadInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(buyLeadSchema) as any,
    defaultValues: { suburbIds: [] },
  });

  const financeStatus = watch("financeStatus");
  const wantsFinanceIntro = watch("wantsFinanceIntro");
  const showFinanceCrossSell = financeStatus === "APPLYING" || financeStatus === "NEED_TO_START";

  useEffect(() => {
    fetch("/api/suburbs")
      .then((res) => res.json())
      .then((body) => setSuburbs(body.data ?? []))
      .catch(() => setSuburbs([]));
  }, []);

  const onSubmit = async (values: BuyLeadInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await res.json();

      if (!res.ok) {
        setSubmitError(body?.error?.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/confirmation/${body.data.leadId}`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Find your next property</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Tell us what you&apos;re after and we&apos;ll connect you with a local agent.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Preferred suburbs</label>
          <div className="max-h-56 overflow-y-auto rounded border border-neutral-300 p-3 dark:border-neutral-700">
            {suburbs.map((suburb) => (
              <label key={suburb.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" value={suburb.id} {...register("suburbIds")} />
                {suburb.name} {suburb.postcode}
              </label>
            ))}
          </div>
          {errors.suburbIds && <p className={errorClass}>{errors.suburbIds.message as string}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="budgetMin">
              Budget min <span className="text-neutral-400">(optional)</span>
            </label>
            <input id="budgetMin" type="number" inputMode="numeric" className={inputClass} {...register("budgetMin")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="budgetMax">
              Budget max <span className="text-neutral-400">(optional)</span>
            </label>
            <input id="budgetMax" type="number" inputMode="numeric" className={inputClass} {...register("budgetMax")} />
            {errors.budgetMax && <p className={errorClass}>{errors.budgetMax.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="financeStatus">
            Finance status
          </label>
          <select id="financeStatus" className={inputClass} {...register("financeStatus")}>
            <option value="">Select finance status</option>
            {Object.entries(FINANCE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.financeStatus && <p className={errorClass}>{errors.financeStatus.message}</p>}
        </div>

        {showFinanceCrossSell && (
          <div className="rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" className="mt-1" {...register("wantsFinanceIntro")} />
              <span>Also connect me with a mortgage broker to help with finance.</span>
            </label>
            {wantsFinanceIntro && (
              <label className="mt-2 flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" className="mt-1" {...register("financeConsent")} />
                <span>
                  I agree to my budget and contact details being shared with a licensed mortgage broker
                  for the purpose of discussing finance options.
                </span>
              </label>
            )}
            {errors.financeConsent && <p className={errorClass}>{errors.financeConsent.message}</p>}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="propertyType">
            Property type <span className="text-neutral-400">(optional)</span>
          </label>
          <select id="propertyType" className={inputClass} {...register("propertyType")}>
            <option value="">No preference</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="buyingTimeframe">
            Buying timeframe
          </label>
          <select id="buyingTimeframe" className={inputClass} {...register("buyingTimeframe")}>
            <option value="">Select a timeframe</option>
            {Object.entries(BUYING_TIMEFRAME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.buyingTimeframe && <p className={errorClass}>{errors.buyingTimeframe.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="name">
            Your name
          </label>
          <input id="name" className={inputClass} {...register("name")} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className={inputClass} {...register("email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input id="phone" type="tel" className={inputClass} placeholder="04xx xxx xxx" {...register("phone")} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" className="mt-1" {...register("consent")} />
            <span>I agree to be contacted by a matched real estate agent about buying a property.</span>
          </label>
          {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}
        </div>

        {submitError && <p className={errorClass}>{submitError}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
      </form>
    </main>
  );
}
