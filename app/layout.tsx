import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sohelmart | মাই বাজার",
  description: "অনলাইনে কেনাকাটা করুন সহজেই",
  icons: {
    icon: "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/LOGO%20.jpeg?v=2",
    apple: "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/LOGO%20.jpeg?v=2",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/LOGO%20.jpeg?v=2" />
        
        {/* 🔔 OneSignal Push Notification Scripts */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "e344b2ca-4a59-402c-a099-565a186b703a",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>

        {/* 🎬 Microsoft Clarity User Session Recording Script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "or7p6bfe6y");
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}