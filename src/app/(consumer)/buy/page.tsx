import type { Metadata } from "next";
import { BuyForm } from "./buy-form";

export const metadata: Metadata = {
  title: "Find a Buyer's Agent in Melbourne — Free Introduction",
  description:
    "Tell us your budget and preferred suburbs and get matched with one vetted local real estate agent in Melbourne. Free, obligation-free.",
  alternates: { canonical: "/buy" },
};

export default function BuyPage() {
  return <BuyForm />;
}
