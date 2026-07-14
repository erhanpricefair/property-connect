import type { Metadata } from "next";
import { SellForm } from "./sell-form";

export const metadata: Metadata = {
  title: "Sell Your Property in Melbourne — Free Agent Match",
  description:
    "Tell us about your property and get matched with one vetted local real estate agent in Melbourne. Free, obligation-free, no chasing.",
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return <SellForm />;
}
