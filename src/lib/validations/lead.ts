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

const PROPERTY_TYPE_VALUES = ["HOUSE", "UNIT", "TOWNHOUSE", "LAND", "RURAL", "OTHER"] as const;
const TIMEFRAME_VALUES = [
  "ASAP",
  "ONE_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "JUST_RESEARCHING",
] as const;

const toOptionalNumber = (val: unknown) =>
  val === "" || val === undefined || val === null ? undefined : Number(val);

// Shared across Buy/Finance/Other Services — kept out of sellLeadSchema so that
// schema's shape stays untouched (it's already proven correct in production).
const contactFields = {
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s-]/g, ""))
    .refine((val) => AU_PHONE_REGEX.test(val), {
      message: "Please enter a valid Australian phone number",
    }),
};

// =========================================================================
// BUY
// =========================================================================

export const FINANCE_STATUS_LABELS: Record<string, string> = {
  PRE_APPROVED: "Pre-approved for finance",
  APPLYING: "Currently applying",
  NEED_TO_START: "Haven't started yet",
  CASH_BUYER: "Cash buyer",
};

export const BUYING_TIMEFRAME_LABELS = SELLING_TIMEFRAME_LABELS;

export const buyLeadSchema = z
  .object({
    suburbIds: z.array(z.string().min(1)).min(1, "Please select at least one suburb"),
    budgetMin: z.preprocess(toOptionalNumber, z.number().positive("Enter a valid amount").optional()),
    budgetMax: z.preprocess(toOptionalNumber, z.number().positive("Enter a valid amount").optional()),
    financeStatus: z.enum(["PRE_APPROVED", "APPLYING", "NEED_TO_START", "CASH_BUYER"]),
    propertyType: z.enum(PROPERTY_TYPE_VALUES).optional(),
    buyingTimeframe: z.enum(TIMEFRAME_VALUES),
    wantsFinanceIntro: z.boolean().optional(),
    financeConsent: z.boolean().optional(),
    ...contactFields,
    consent: z.literal(true, { message: "You must agree to be contacted to continue" }),
  })
  .refine(
    (data) => data.budgetMin === undefined || data.budgetMax === undefined || data.budgetMin <= data.budgetMax,
    { message: "Minimum budget can't be more than maximum", path: ["budgetMax"] }
  )
  .refine((data) => !data.wantsFinanceIntro || data.financeConsent === true, {
    message: "Please agree to the financial data handling terms to connect with a broker",
    path: ["financeConsent"],
  });

export type BuyLeadInput = z.infer<typeof buyLeadSchema>;

// =========================================================================
// FINANCE
// =========================================================================

export const LOAN_PURPOSE_LABELS: Record<string, string> = {
  FIRST_HOME: "First home",
  UPGRADE: "Upgrading",
  INVESTMENT: "Investment property",
  REFINANCE: "Refinance",
};

export const INCOME_EXACT = "EXACT";

export const INCOME_BAND_LABELS: Record<string, string> = {
  UNDER_60K: "Under $60,000",
  BAND_60K_100K: "$60,000 – $100,000",
  BAND_100K_150K: "$100,000 – $150,000",
  BAND_150K_250K: "$150,000 – $250,000",
  OVER_250K: "$250,000+",
  [INCOME_EXACT]: "I'd rather enter an exact figure",
};

export const financeLeadSchema = z
  .object({
    purchasePrice: z.preprocess(toOptionalNumber, z.number().positive("Enter a valid amount")),
    depositAmount: z.preprocess(toOptionalNumber, z.number().positive("Enter a valid amount")),
    incomeBand: z.enum([
      "UNDER_60K",
      "BAND_60K_100K",
      "BAND_100K_150K",
      "BAND_150K_250K",
      "OVER_250K",
      INCOME_EXACT,
    ]),
    incomeExact: z.preprocess(toOptionalNumber, z.number().positive("Enter a valid amount").optional()),
    loanPurpose: z.enum(["FIRST_HOME", "UPGRADE", "INVESTMENT", "REFINANCE"]),
    ...contactFields,
    generalConsent: z.literal(true, { message: "You must agree to be contacted to continue" }),
    financialConsent: z.literal(true, {
      message: "You must agree to the financial data handling terms",
    }),
  })
  .refine((data) => data.incomeBand !== INCOME_EXACT || data.incomeExact !== undefined, {
    message: "Please enter your income",
    path: ["incomeExact"],
  });

export type FinanceLeadInput = z.infer<typeof financeLeadSchema>;

// =========================================================================
// OTHER SERVICES
// =========================================================================

export const INSPECTION_TYPE_LABELS: Record<string, string> = {
  PRE_PURCHASE: "Pre-purchase",
  PRE_SALE: "Pre-sale",
  PEST: "Pest inspection",
  BUILDING_AND_PEST: "Building & pest combined",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  BUYING: "Buying",
  SELLING: "Selling",
};

export const PROPERTY_MANAGEMENT_STATUS_LABELS: Record<string, string> = {
  CURRENTLY_RENTED: "Currently rented",
  VACANT: "Vacant",
  OWNER_OCCUPIED_MOVING: "Owner-occupied, moving to rental",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const notPastDateSchema = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((val) => val >= todayStr(), { message: "Date can't be in the past" });

const otherServicesCommonFields = {
  streetAddress: z.string().min(3, "Please enter the property address"),
  suburbId: z.string().min(1, "Please select a suburb"),
  unlistedSuburb: z.string().optional(),
  ...contactFields,
  consent: z.literal(true, { message: "You must agree to be contacted to continue" }),
};

export const otherServicesLeadSchema = z
  .discriminatedUnion("serviceType", [
    z.object({
      serviceType: z.literal("INSPECTION"),
      inspectionType: z.enum(["PRE_PURCHASE", "PRE_SALE", "PEST", "BUILDING_AND_PEST"]),
      requiredByDate: notPastDateSchema("Please select a required-by date"),
      ...otherServicesCommonFields,
    }),
    z.object({
      serviceType: z.literal("CONVEYANCING"),
      transactionType: z.enum(["BUYING", "SELLING"]),
      settlementDate: z.string().min(1, "Please select an expected settlement date"),
      ...otherServicesCommonFields,
    }),
    z.object({
      serviceType: z.literal("PROPERTY_MANAGEMENT"),
      propertyType: z.enum(PROPERTY_TYPE_VALUES),
      currentStatus: z.enum(["CURRENTLY_RENTED", "VACANT", "OWNER_OCCUPIED_MOVING"]),
      desiredStartDate: z.string().min(1, "Please select a desired start date"),
      ...otherServicesCommonFields,
    }),
  ])
  .refine((data) => data.suburbId !== SUBURB_NOT_LISTED || !!data.unlistedSuburb?.trim(), {
    message: "Please tell us your suburb",
    path: ["unlistedSuburb"],
  });

export type OtherServicesLeadInput = z.infer<typeof otherServicesLeadSchema>;
