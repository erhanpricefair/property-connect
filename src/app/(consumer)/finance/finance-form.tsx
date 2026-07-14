"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  financeLeadSchema,
  INCOME_EXACT,
  INCOME_BAND_LABELS,
  LOAN_PURPOSE_LABELS,
  type FinanceLeadInput,
} from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

const inputClass =
  "w-full rounded-sm border border-[#16201B]/20 bg-white px-3 py-2.5 text-sm text-[#16201B] outline-none transition focus:border-[#1F4A3C]";
const labelClass = "font-[family-name:var(--font-plex-mono)] text-[11px] uppercase tracking-[0.08em] text-[#16201B]/70";
const errorClass = "text-sm text-[#A0402E]";

export function FinanceForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FinanceLeadInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(financeLeadSchema) as any,
  });

  const purchasePrice = watch("purchasePrice");
  const depositAmount = watch("depositAmount");
  const incomeBand = watch("incomeBand");
  const depositExceedsPrice =
    typeof purchasePrice === "number" && typeof depositAmount === "number" && depositAmount > purchasePrice;

  const onSubmit = async (values: FinanceLeadInput) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads/finance", {
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
          Get finance
        </h1>
        <p className="mt-3 text-[#16201B]/70">
          Tell us about your purchase and we&apos;ll connect you with a local mortgage broker.
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
          <label className={labelClass} htmlFor="purchasePrice">
            Purchase price
          </label>
          <input
            id="purchasePrice"
            type="number"
            inputMode="numeric"
            className={inputClass}
            {...register("purchasePrice")}
          />
          {errors.purchasePrice && <p className={errorClass}>{errors.purchasePrice.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="depositAmount">
            Deposit amount
          </label>
          <input
            id="depositAmount"
            type="number"
            inputMode="numeric"
            className={inputClass}
            {...register("depositAmount")}
          />
          {errors.depositAmount && <p className={errorClass}>{errors.depositAmount.message}</p>}
          {depositExceedsPrice && (
            <p className="text-sm text-[#B08A4E]">
              Your deposit exceeds the purchase price — please double check this is correct.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="incomeBand">
            Gross annual income
          </label>
          <select id="incomeBand" className={inputClass} {...register("incomeBand")}>
            <option value="">Select an income range</option>
            {Object.entries(INCOME_BAND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.incomeBand && <p className={errorClass}>{errors.incomeBand.message}</p>}
        </div>

        {incomeBand === INCOME_EXACT && (
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="incomeExact">
              Exact gross annual income
            </label>
            <input
              id="incomeExact"
              type="number"
              inputMode="numeric"
              className={inputClass}
              {...register("incomeExact")}
            />
            {errors.incomeExact && <p className={errorClass}>{errors.incomeExact.message}</p>}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="loanPurpose">
            What&apos;s this loan for?
          </label>
          <select id="loanPurpose" className={inputClass} {...register("loanPurpose")}>
            <option value="">Select a purpose</option>
            {Object.entries(LOAN_PURPOSE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.loanPurpose && <p className={errorClass}>{errors.loanPurpose.message}</p>}
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
            <input type="checkbox" className="mt-1" {...register("generalConsent")} />
            <span>
              I agree to be contacted by a matched mortgage broker. See how your{" "}
              <Link href="/privacy" className="underline hover:text-[#1F4A3C]">
                data is used
              </Link>
              .
            </span>
          </label>
          {errors.generalConsent && <p className={errorClass}>{errors.generalConsent.message}</p>}
        </div>

        <div className="flex flex-col gap-1 rounded border border-[#16201B]/15 bg-[#EBE6D9] p-4">
          <label className="flex items-start gap-2 text-sm text-[#16201B]/80">
            <input type="checkbox" className="mt-1" {...register("financialConsent")} />
            <span>
              I consent to my financial information being collected and disclosed to a licensed
              mortgage broker for the purpose of assessing my finance options, in accordance with{" "}
              <Link href="/privacy" className="underline hover:text-[#1F4A3C]">
                ReferWise&apos;s privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.financialConsent && <p className={errorClass}>{errors.financialConsent.message}</p>}
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
