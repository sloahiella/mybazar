import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
// @ts-ignore
import InstallButton from "./components/InstallButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ ওয়েবসাইটের নাম এবং তথ্য
export const metadata: Metadata = {
  title: "Sohelmart | মাই বাজার",
  description: "অনলাইনে কেনাকাটা করুন সহজেই",
  icons: {
    icon: "https://i.ibb.co.com/KjRBVJxC/logo.jpg",
    apple: "https://i.ibb.co.com/KjRBVJxC/logo.jpg",
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
        {/* 🛒 PWA & App Settings */}
        <link rel="icon" href="https://i.ibb.co.com/KjRBVJxC/logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#db2777" />
        <meta name="google-site-verification" content="BRcTy6WhGMh4Rz1jVP26FrGjxRHuxILqUgsXqCtKqaU" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* 🛠️ Service Worker Registration (অ্যাপ হিসেবে চলার জন্য) */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('সোহেল ভাই, আপনার অ্যাপ রেডি!');
                }).catch(function(err) {
                  console.log('সেটিংস একটু ভুল হয়েছে মনে হয়:', err);
                });
              });
            }
          `}
        </Script>

        {/* 🔔 OneSignal Push Notification (নোটিফিকেশন এর জন্য) */}
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

        {/* 📱 Facebook Browser Fix (ফেসবুক থেকে ইউজারের সুবিধা) */}
        <Script id="fix-font-size" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              if (navigator.userAgent.includes('FBAN') || navigator.userAgent.includes('FBAV') || navigator.userAgent.includes('Instagram')) {
                var meta = document.querySelector('meta[name="viewport"]');
                if (meta) {
                  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
                }
              }
            });
          `}
        </Script>

        {/* 🎬 Microsoft Clarity (ইউজাররা কী দেখছে তা বোঝার জন্য) */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wy7tt71xy3");
          `}
        </Script>

        {/* 📊 Google Analytics GA4 (রিপোর্ট দেখার জন্য) */}
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✨ অ্যাপ ইনস্টল করার জন্য আপনার নতুন বাটন ✨ */}
        <InstallButton />
        {children}
      </body>
    </html>
  );
}