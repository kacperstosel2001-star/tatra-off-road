export function SeoContent({
  lang = 'pl',
  title,
  paragraphs,
}: {
  lang?: string
  title: string
  paragraphs: string[]
}) {
  return (
    <section className="bg-paper border-t border-stone-line section-pad" aria-labelledby="seo-heading">
      <div className="wrap max-w-[820px]">
        <h2 id="seo-heading" className="font-display text-[32px] lg:text-[40px] uppercase m-0 mb-6 leading-[0.95]">
          {title}
        </h2>
        <div className="grid gap-4 text-[16px] leading-[1.7] text-[#4a4638]">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="m-0">
              {p}
            </p>
          ))}
        </div>
        <p className="m-0 mt-6 text-[13px] text-stone uppercase tracking-[0.08em] font-label">
          {lang === 'en' ? 'Tatra Off-Road · Ząb, Podhale, Poland' : 'Tatra Off-Road · Ząb, Podhale'}
        </p>
      </div>
    </section>
  )
}
