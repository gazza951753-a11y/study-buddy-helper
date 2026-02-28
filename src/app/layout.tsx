import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "StudyAssist — помощь студентам | Курсовые, дипломы, рефераты",
  description:
    "Профессиональная помощь студентам с учебными работами. Курсовые, дипломные, рефераты, контрольные — быстро, качественно, в срок. Гарантия уникальности от 70%.",
  keywords:
    "помощь студентам, курсовая работа, дипломная работа, реферат, контрольная работа, заказать курсовую, заказать диплом, учебные работы",
  authors: [{ name: "StudyAssist" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://studyassist.ru/" },
  openGraph: {
    type: "website",
    url: "https://studyassist.ru/",
    title: "StudyAssist — помощь студентам с учебными работами",
    description:
      "Курсовые, дипломные, рефераты, контрольные. Индивидуальный подход, гарантия уникальности, бесплатные доработки.",
    siteName: "StudyAssist",
    locale: "ru_RU",
    images: [
      {
        url: "https://studyassist.ru/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudyAssist — помощь студентам с учебными работами",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyAssist — помощь студентам с учебными работами",
    description: "Курсовые, дипломные, рефераты, контрольные. Гарантия качества и уникальности.",
    images: ["https://studyassist.ru/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://studyassist.ru/#organization",
      name: "StudyAssist",
      url: "https://studyassist.ru/",
      logo: { "@type": "ImageObject", url: "https://studyassist.ru/favicon.svg" },
      description:
        "Профессиональная помощь студентам с учебными работами: курсовые, дипломные, рефераты, контрольные.",
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: "Russian" },
    },
    {
      "@type": "Service",
      "@id": "https://studyassist.ru/#service",
      name: "Помощь студентам с учебными работами",
      provider: { "@id": "https://studyassist.ru/#organization" },
      serviceType: "Образовательные услуги",
      description:
        "Курсовые, дипломные работы, рефераты, контрольные. Гарантия уникальности от 70%, точные сроки, бесплатные доработки.",
      areaServed: { "@type": "Country", name: "Russia" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Виды учебных работ",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Курсовая работа" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Дипломная работа" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Реферат" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Контрольная работа" } },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://studyassist.ru/#website",
      url: "https://studyassist.ru/",
      name: "StudyAssist",
      inLanguage: "ru",
      publisher: { "@id": "https://studyassist.ru/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>

        {/* Yandex.Metrika */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(104140743,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/104140743"
              style={{ position: "absolute", left: -9999 }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
