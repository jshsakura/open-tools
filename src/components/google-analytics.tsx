"use client"

interface GoogleAnalyticsProps {
  gaId?: string
  adsenseId?: string
}

export function GoogleAnalytics({ gaId, adsenseId }: GoogleAnalyticsProps) {
  if (!gaId && !adsenseId) {
    return null
  }

  return (
    <>
      {gaId && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          id="google-analytics"
        />
      )}
      {gaId && (
        <script
          id="google-analytics-config"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
        />
      )}
      {adsenseId && (
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adsenseId}"
          crossOrigin="anonymous"
          id="google-adsense"
        />
      )}
      {adsenseId && (
        <script
          id="google-adsense-config"
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      )}
    </>
  )
}
