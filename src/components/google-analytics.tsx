"use client"

import Script from "next/script"

interface GoogleAnalyticsProps {
  gaId?: string
  adsenseId?: string
}

export function GoogleAnalytics({ gaId, adsenseId }: GoogleAnalyticsProps) {
  if (!gaId && !adsenseId) {
    return null
  }

  const adsenseClient =
    adsenseId && adsenseId.startsWith("ca-pub-") ? adsenseId : adsenseId ? `ca-pub-${adsenseId}` : undefined

  return (
    <>
      {gaId && (
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          id="google-analytics"
          strategy="afterInteractive"
        />
      )}
      {gaId && (
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
        >{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}</Script>
      )}
      {adsenseId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          id="google-adsense"
          strategy="afterInteractive"
        />
      )}
    </>
  )
}
