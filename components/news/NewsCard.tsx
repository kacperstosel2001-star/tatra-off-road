import React from 'react';
import Link from 'next/link'
import { localePath } from '@/lib/i18n';
import Image from 'next/image';
import { NewsDTO } from '@/types/payload';
import { ArrowUpRight } from 'lucide-react';

export function NewsCard({ article, lang, dict }: { article: NewsDTO; lang: string; dict: any }) {
  return (
    <Link href={localePath(lang, `/news/${article.slug}`)} className="group block h-full flex flex-col relative overflow-hidden bg-[rgba(245,241,231,0.02)] border border-[rgba(245,241,231,0.06)] hover:border-[rgba(245,241,231,0.15)] transition-colors duration-300">
      <div className="relative h-[240px] w-full overflow-hidden">
        <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-6 lg:p-8 flex-grow flex flex-col">
        <div className="text-orange text-[12px] font-label uppercase tracking-[0.15em] mb-4">
          {new Date(article.publishedAt).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'pl-PL')}
        </div>
        <h3 className="font-display text-[24px] text-snow mb-4 leading-[1.2]">{article.title}</h3>
        <p className="text-stone text-[15px] leading-[1.6] mb-6 flex-grow">{article.excerpt}</p>
        <div className="inline-flex items-center text-[13px] font-label text-orange uppercase tracking-[0.1em] mt-auto">
          {dict.news.readMore} <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}
