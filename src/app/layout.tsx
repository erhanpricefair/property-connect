import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const DEFAULT_DESCRIPTION =
  "Free introductions to one vetted local real estate agent, mortgage broker, conveyancer, building inspector, or property manager in Melbourne. No obligation, no chasing.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Melbourne Property Introductions`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "sell my house Melbourne",
    "Melbourne real estate agent",
    "Melbourne mortgage broker",
    "property referral Melbourne",
    "building inspector Melbourne",
    "conveyancer Melbourne",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Melbourne Property Introductions`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Melbourne Property Introductions`,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "FRXgtjLlL7K36_pAimWhoN60NuNOrb3jHSA-Yg_vrWw",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  areaServed: {
    "@type": "City",
    name: "Melbourne",
  },
  serviceType: [
    "Real estate agent referral",
    "Mortgage broker referral",
    "Conveyancer referral",
    "Building inspector referral",
    "Property manager referral",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
