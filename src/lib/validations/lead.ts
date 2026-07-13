import { z } from "zod";

// AU mobile (04xx xxx xxx) or landline (0[2-8]x xxx xxx), spaces/dashes optional.
const AU_PHONE_REGEX = /^0[2-8]\d{8}$/;

export const SUBURB_NOT_LISTED = "NOT_LISTED";

export const sellLeadSchema = z
  .object({
    streetAddress: z.string().min(3, "Please enter the property address"),
    suburbId: z.string().min(1, "Please select a suburb"),
    unlistedSuburb: z.string().optional(),
    propertyType: z.enum(["HOUSE", "UNIT", "TOWNHOUSE", "LAND", "RURAL", "OTHER"]),
    // Preprocessed (not just .transform()'d) so this is idempotent whether it
    // receives a raw form string or an already-parsed number — the client
    // validates with this same schema before submitting, which means the
    // server receives the *output* of the client's parse, not raw input. A
    // plain z.string().transform(Number) breaks on the second pass because
    // it rejects a number input outright. See the API route for why this
    // matters — a real bug found and fixed after deploying.
    estimatedValue: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive("Enter a valid amount").optional()
    ),
    sellingTimeframe: z.enum(["ASAP", "ONE_TO_THREE_MONTHS", "THREE_TO_SIX_MONTHS", "JUST_RESEARCHING"]),
    currentSituation: z.string().max(1000).optional(),
    name: z.string().min(1, "Please enter your name"),
    email: z.string().email("Please enter a valid email"),
    phone: z
      .string()
      .transform((val) => val.replace(/[\s-]/g, ""))
      .refine((val) => AU_PHONE_REGEX.test(val), {
        message: "Please enter a valid Australian phone number",
      }),
    consent: z.literal(true, {
      message: "You must agree to be contacted to continue",
    }),
  })
  .refine(
    (data) => data.suburbId !== SUBURB_NOT_LISTED || !!data.unlistedSuburb?.trim(),
    {
      message: "Please tell us your suburb",
      path: ["unlistedSuburb"],
    }
  );

export type SellLeadInput = z.infer<typeof sellLeadSchema>;

export const SELLING_TIMEFRAME_LABELS: Record<string, string> = {
  ASAP: "As soon as possible",
  ONE_TO_THREE_MONTHS: "1–3 months",
  THREE_TO_SIX_MONTHS: "3–6 months",
  JUST_RESEARCHING: "Just researching",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  UNIT: "Unit",
  TOWNHOUSE: "Townhouse",
  LAND: "Land",
  RURAL: "Rural",
  OTHER: "Other",
};
