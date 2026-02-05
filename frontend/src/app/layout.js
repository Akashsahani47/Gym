import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ✅ ROOT METADATA (APPLIES TO WHOLE APP) */
export const metadata = {
  metadataBase: new URL("https://zelvoo.in"),

  title: {
    default: "Zelvoo | Smart Gym Management Platform",
    template: "%s | Zelvoo",
  },

  description:
    "Zelvoo is an all-in-one gym management platform for gym owners, trainers, and members. Manage gyms, memberships, workouts, payments, and analytics in one place.",

  keywords: [
    "gym management software",
    "fitness management system",
    "gym owner dashboard",
    "trainer platform",
    "member fitness app",
    "Zelvoo",
  ],

  openGraph: {
    title: "Zelvoo | Smart Gym Management Platform",
    description:
      "Manage gyms, trainers, members, workouts, and payments with Zelvoo.",
    url: "https://zelvoo.in",
    siteName: "Zelvoo",
    images: [
      {
        url: "/og-image.png", // put in /public
        width: 1200,
        height: 630,
        alt: "Zelvoo Gym Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Zelvoo | Smart Gym Management Platform",
    description:
      "All-in-one gym management platform for gym owners, trainers, and members.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
