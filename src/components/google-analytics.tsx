"use client"

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
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          id="google-adsense"
        />
      )}
    </>
  )
}
