import type { Metadata } from "next";
import { OtherServicesForm } from "./other-services-form";

export const metadata: Metadata = {
  title: "Building Inspectors, Conveyancers & Property Managers in Melbourne",
  description:
    "Connect free with one trusted local professional for a building inspection, conveyancing, or property management in Melbourne.",
  alternates: { canonical: "/other-services" },
};

export default function OtherServicesPage() {
  return <OtherServicesForm />;
}
