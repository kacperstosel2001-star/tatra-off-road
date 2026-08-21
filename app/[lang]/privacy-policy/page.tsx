import { localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const isEn = lang === 'en'
  return {
    title: `${dict.nav.privacy} | Tatra Off-Road`,
    description: isEn
      ? 'How we process personal data and cookies.'
      : 'Informacje o przetwarzaniu danych osobowych i plików cookies.',
    robots: { index: false, follow: true },
  }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const isEn = lang === 'en'

  return (
    <>
      <Topbar lang={lang} />
      <Header dict={dict} lang={lang} />

      <main className="bg-black min-h-screen pb-24">
        <PageHeader
          title={dict.nav.privacy}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(lang, '/') },
            { label: dict.nav.privacy },
          ]}
          dict={dict}
        />

        <div className="max-w-[900px] mx-auto px-6 lg:px-[56px] mt-12 text-stone text-[15px] leading-[1.8] space-y-6">
          {isEn ? (
            <>
              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4">
                1. General
              </h2>
              <p>
                This privacy policy explains how personal data submitted by users is processed and
                protected when using the Tatra Off-Road website.
              </p>

              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4 mt-8">
                2. Data controller
              </h2>
              <p>
                The controller of personal data in this service is Tatra Off-Road based in Zakopane.
                For data-protection matters you can contact us via the contact form.
              </p>

              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4 mt-8">
                3. Cookies
              </h2>
              <p>
                The site uses cookies to provide services, personalise ads and analyse traffic. You
                can set cookie storage or access conditions in your browser.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4">
                1. Postanowienia Ogólne
              </h2>
              <p>
                Niniejsza polityka prywatności określa zasady przetwarzania i ochrony danych
                osobowych przekazanych przez Użytkowników w związku z korzystaniem przez nich ze
                strony Tatra Off-Road.
              </p>

              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4 mt-8">
                2. Administrator Danych
              </h2>
              <p>
                Administratorem danych osobowych zawartych w serwisie jest Tatra Off-Road z siedzibą
                w Zakopanem. W sprawach ochrony danych możesz kontaktować się poprzez nasz formularz
                kontaktowy.
              </p>

              <h2 className="text-snow text-[24px] font-display uppercase tracking-[0.05em] mb-4 mt-8">
                3. Pliki Cookies
              </h2>
              <p>
                Strona korzysta z plików cookies w celu realizacji usług, personalizacji reklam i
                analizowania ruchu na stronie. Możesz określić warunki przechowywania lub dostępu do
                plików cookies w Twojej przeglądarce.
              </p>
            </>
          )}
        </div>
      </main>

      <Footer dict={dict} lang={lang} />
    </>
  )
}
