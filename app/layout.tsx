import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowAI — AI Employee for Indian SMEs | Automate Leads, Follow-ups & Bookings",
  description: "FlowAI automates 70% of repetitive business tasks for Indian SMEs. Capture leads from WhatsApp, Email & Web — qualify, respond, and convert with AI-powered intelligence.",
  keywords: "AI automation, lead capture, WhatsApp business, CRM India, SME automation, AI employee",
  openGraph: {
    title: "FlowAI — Your AI Employee",
    description: "Automate leads, follow-ups, and bookings. Built for Indian SMEs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
