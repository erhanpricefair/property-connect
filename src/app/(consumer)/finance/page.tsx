import type { Metadata } from "next";
import { FinanceForm } from "./finance-form";

export const metadata: Metadata = {
  title: "Compare Mortgage Brokers in Melbourne — Free Match",
  description:
    "Get matched with one local mortgage broker for your purchase, refinance, or investment loan. Free introduction, no obligation.",
  alternates: { canonical: "/finance" },
};

export default function FinancePage() {
  return <FinanceForm />;
}
