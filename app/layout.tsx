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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/LOGO%20.jpeg?v=2" />
        <meta name="google-site-verification" content="BRcTy6WhGMh4Rz1jVP26FrGjxRHuxILqUgsXqCtKqaU" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />

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

        {/* 📱 Facebook Browser Font Fix */}
        <Script id="fix-font-size" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              if (navigator.userAgent.includes('FBAN') || navigator.userAgent.includes('FBAV') || navigator.userAgent.includes('Instagram')) {
                var meta = document.querySelector('meta[name="viewport"]');
                if (meta) {
                  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
                }
                document.documentElement.style.webkitTextSizeAdjust = '100%';
                document.documentElement.style.textSizeAdjust = '100%';
              }
            });
          `}
        </Script>

        {/* 🎬 Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wy7tt71xy3");
          `}
        </Script>

        {/* 📊 Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-587K38L62P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-587K38L62P');
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