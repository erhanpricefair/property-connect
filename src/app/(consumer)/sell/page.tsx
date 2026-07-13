"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sellLeadSchema,
  SUBURB_NOT_LISTED,
  SELLING_TIMEFRAME_LABELS,
  PROPERTY_TYPE_LABELS,
  type SellLeadInput,
} from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

type Suburb = { id: string; name: string; postcode: string };

const inputClass =
  "w-full rounded-sm border border-[#16201B]/20 bg-white px-3 py-2.5 text-sm text-[#16201B] outline-none transition focus:border-[#1F4A3C]";
const labelClass = "font-[family-name:var(--font-plex-mono)] text-[11px] uppercase tracking-[0.08em] text-[#16201B]/70";
const errorClass = "text-sm text-[#A0402E]";

export default function SellPage() {
  const router = useRouter();
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SellLeadInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sellLeadSchema) as any,
    defaultValues: { suburbId: "" },
  });

  const selectedSuburbId = watch("suburbId");

  useEffect(() => {
    fetch("/api/suburbs")
      .then((res) => res.json())
      .then((body) => setSuburbs(body.data ?? []))
      .catch(() => setSuburbs([]));
  }, []);

  const onSubmit = async (values: SellLeadInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads/sell", {
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
    <div className="min-h-screen bg-[#F3EFE6] font-[family-name:var(--font-work-sans)]">
      <ConsumerHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl tracking-tight text-[#16201B]">
          Sell your property
        </h1>
        <p className="mt-3 text-[#16201B]/70">
          Tell us a bit about your property and we&apos;ll connect you with a local agent.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
          {...register("website" as never)}
        />

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="streetAddress">
            Property address
          </label>
          <input id="streetAddress" className={inputClass} {...register("streetAddress")} />
          {errors.streetAddress && <p className={errorClass}>{errors.streetAddress.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="suburbId">
            Suburb
          </label>
          <select id="suburbId" className={inputClass} {...register("suburbId")}>
            <option value="">Select your suburb</option>
            {suburbs.map((suburb) => (
              <option key={suburb.id} value={suburb.id}>
                {suburb.name} {suburb.postcode}
              </option>
            ))}
            <option value={SUBURB_NOT_LISTED}>My suburb isn&apos;t listed</option>
          </select>
          {errors.suburbId && <p className={errorClass}>{errors.suburbId.message}</p>}
        </div>

        {selectedSuburbId === SUBURB_NOT_LISTED && (
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="unlistedSuburb">
              What&apos;s your suburb?
            </label>
            <input id="unlistedSuburb" className={inputClass} {...register("unlistedSuburb")} />
            {errors.unlistedSuburb && <p className={errorClass}>{errors.unlistedSuburb.message}</p>}
            <p className="text-xs text-[#16201B]/50">
              We&apos;re Melbourne-only for now — we&apos;ll let you know when we cover your area.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="propertyType">
            Property type
          </label>
          <select id="propertyType" className={inputClass} {...register("propertyType")}>
            <option value="">Select property type</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.propertyType && <p className={errorClass}>{errors.propertyType.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="estimatedValue">
            Estimated value <span className="text-[#16201B]/40">(optional)</span>
          </label>
          <input
            id="estimatedValue"
            type="number"
            inputMode="numeric"
            className={inputClass}
            {...register("estimatedValue")}
          />
          {errors.estimatedValue && <p className={errorClass}>{errors.estimatedValue.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="sellingTimeframe">
            Selling timeframe
          </label>
          <select id="sellingTimeframe" className={inputClass} {...register("sellingTimeframe")}>
            <option value="">Select a timeframe</option>
            {Object.entries(SELLING_TIMEFRAME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.sellingTimeframe && <p className={errorClass}>{errors.sellingTimeframe.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="currentSituation">
            Your situation <span className="text-[#16201B]/40">(optional)</span>
          </label>
          <textarea
            id="currentSituation"
            rows={3}
            className={inputClass}
            placeholder="e.g. already bought elsewhere, need to sell before buying, just exploring"
            {...register("currentSituation")}
          />
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
          <label className="flex items-start gap-2 text-sm text-[#16201B]/80">
            <input type="checkbox" className="mt-1" {...register("consent")} />
            <span>
              I agree to be contacted by a matched real estate agent about my property. See how your
              data is used.
            </span>
          </label>
          {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}
        </div>

        {submitError && <p className={errorClass}>{submitError}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-sm bg-[#1F4A3C] font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.08em] text-[#F3EFE6] hover:bg-[#1F4A3C]/90"
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
        </form>
      </main>
    </div>
  );
}
