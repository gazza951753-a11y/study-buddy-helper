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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "5000",
        reviewCount: "5000",
      },
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
    {
      "@type": "FAQPage",
      "@id": "https://studyassist.ru/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Как происходит оплата и какие гарантии безопасности?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Мы работаем по предоплате через проверенные платёжные системы: ЮMoney и СБП. Это защищает обе стороны — вы получаете чек и подтверждение платежа, а мы гарантируем выполнение заказа. Для крупных проектов возможна поэтапная оплата. Все транзакции безопасны и конфиденциальны.",
          },
        },
        {
          "@type": "Question",
          name: "Какие гарантии вы предоставляете?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Гарантируем уникальность работы (проверка по Антиплагиат), соблюдение сроков, бесплатные доработки по замечаниям преподавателя в течение 30 дней после сдачи.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли срочно заказать работу?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да, выполняем срочные заказы от 1 дня. Стоимость срочного выполнения зависит от сложности и объёма работы. Уточните у менеджера.",
          },
        },
        {
          "@type": "Question",
          name: "Как связаться с автором?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Вы можете общаться с автором через личный кабинет или Telegram. Менеджер всегда на связи для решения любых вопросов.",
          },
        },
        {
          "@type": "Question",
          name: "Что если работа не понравится преподавателю?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Мы бесплатно внесём правки по замечаниям преподавателя. Наша цель — ваша успешная сдача, поэтому работаем до результата.",
          },
        },
        {
          "@type": "Question",
          name: "Насколько уникальной будет работа?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Каждая работа пишется индивидуально под ваше задание. Гарантируем уникальность от 70% по системе Антиплагиат (или выше по вашим требованиям).",
          },
        },
        {
          "@type": "Question",
          name: "Конфиденциальны ли мои данные?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Абсолютно. Мы не передаём данные третьим лицам и не публикуем выполненные работы. Ваша безопасность — наш приоритет.",
          },
        },
      ],
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
