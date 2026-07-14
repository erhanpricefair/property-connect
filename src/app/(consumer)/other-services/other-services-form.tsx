"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  otherServicesLeadSchema,
  SUBURB_NOT_LISTED,
  INSPECTION_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_MANAGEMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

type Suburb = { id: string; name: string; postcode: string };

const inputClass =
  "w-full rounded-sm border border-[#16201B]/20 bg-white px-3 py-2.5 text-sm text-[#16201B] outline-none transition focus:border-[#1F4A3C]";
const labelClass = "font-[family-name:var(--font-plex-mono)] text-[11px] uppercase tracking-[0.08em] text-[#16201B]/70";
const errorClass = "text-sm text-[#A0402E]";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  INSPECTION: "Building inspection",
  CONVEYANCING: "Conveyancing",
  PROPERTY_MANAGEMENT: "Property management",
};

export function OtherServicesForm() {
  const router = useRouter();
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(otherServicesLeadSchema),
    defaultValues: { suburbId: "" },
  });

  const serviceType = watch("serviceType");
  const selectedSuburbId = watch("suburbId");

  useEffect(() => {
    fetch("/api/suburbs")
      .then((res) => res.json())
      .then((body) => setSuburbs(body.data ?? []))
      .catch(() => setSuburbs([]));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads/other-services", {
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
          Other services
        </h1>
        <p className="mt-3 text-[#16201B]/70">
          Building inspections, conveyancing, and property management — connect with a local
          professional.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
          {...register("website")}
        />

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="serviceType">
            What do you need?
          </label>
          <select id="serviceType" className={inputClass} {...register("serviceType")}>
            <option value="">Select a service</option>
            {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.serviceType && <p className={errorClass}>{String(errors.serviceType.message)}</p>}
        </div>

        {serviceType && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="streetAddress">
                Property address
              </label>
              <input id="streetAddress" className={inputClass} {...register("streetAddress")} />
              {errors.streetAddress && <p className={errorClass}>{String(errors.streetAddress.message)}</p>}
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
              {errors.suburbId && <p className={errorClass}>{String(errors.suburbId.message)}</p>}
            </div>

            {selectedSuburbId === SUBURB_NOT_LISTED && (
              <div className="flex flex-col gap-1">
                <label className={labelClass} htmlFor="unlistedSuburb">
                  What&apos;s your suburb?
                </label>
                <input id="unlistedSuburb" className={inputClass} {...register("unlistedSuburb")} />
                {errors.unlistedSuburb && <p className={errorClass}>{String(errors.unlistedSuburb.message)}</p>}
              </div>
            )}
          </>
        )}

        {serviceType === "INSPECTION" && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="inspectionType">
                Inspection type
              </label>
              <select id="inspectionType" className={inputClass} {...register("inspectionType")}>
                <option value="">Select inspection type</option>
                {Object.entries(INSPECTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.inspectionType && <p className={errorClass}>{String(errors.inspectionType.message)}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="requiredByDate">
                Required by
              </label>
              <input id="requiredByDate" type="date" className={inputClass} {...register("requiredByDate")} />
              {errors.requiredByDate && <p className={errorClass}>{String(errors.requiredByDate.message)}</p>}
            </div>
          </>
        )}

        {serviceType === "CONVEYANCING" && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="transactionType">
                Are you buying or selling?
              </label>
              <select id="transactionType" className={inputClass} {...register("transactionType")}>
                <option value="">Select transaction type</option>
                {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.transactionType && <p className={errorClass}>{String(errors.transactionType.message)}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="settlementDate">
                Expected settlement date
              </label>
              <input id="settlementDate" type="date" className={inputClass} {...register("settlementDate")} />
              {errors.settlementDate && <p className={errorClass}>{String(errors.settlementDate.message)}</p>}
            </div>
          </>
        )}

        {serviceType === "PROPERTY_MANAGEMENT" && (
          <>
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
              {errors.propertyType && <p className={errorClass}>{String(errors.propertyType.message)}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="currentStatus">
                Current status
              </label>
              <select id="currentStatus" className={inputClass} {...register("currentStatus")}>
                <option value="">Select current status</option>
                {Object.entries(PROPERTY_MANAGEMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.currentStatus && <p className={errorClass}>{String(errors.currentStatus.message)}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="desiredStartDate">
                Desired management start date
              </label>
              <input id="desiredStartDate" type="date" className={inputClass} {...register("desiredStartDate")} />
              {errors.desiredStartDate && <p className={errorClass}>{String(errors.desiredStartDate.message)}</p>}
            </div>
          </>
        )}

        {serviceType && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="name">
                Your name
              </label>
              <input id="name" className={inputClass} {...register("name")} />
              {errors.name && <p className={errorClass}>{String(errors.name.message)}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input id="email" type="email" className={inputClass} {...register("email")} />
              {errors.email && <p className={errorClass}>{String(errors.email.message)}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="phone">
                Phone
              </label>
              <input id="phone" type="tel" className={inputClass} placeholder="04xx xxx xxx" {...register("phone")} />
              {errors.phone && <p className={errorClass}>{String(errors.phone.message)}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2 text-sm text-[#16201B]/80">
                <input type="checkbox" className="mt-1" {...register("consent")} />
                <span>
                  I agree to be contacted by a matched professional about this request. See how your{" "}
                  <Link href="/privacy" className="underline hover:text-[#1F4A3C]">
                    data is used
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && <p className={errorClass}>{String(errors.consent.message)}</p>}
            </div>

            {submitError && <p className={errorClass}>{submitError}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-sm bg-[#1F4A3C] font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.08em] text-[#F3EFE6] hover:bg-[#1F4A3C]/90"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </>
        )}
        </form>
      </main>
    </div>
  );
}
