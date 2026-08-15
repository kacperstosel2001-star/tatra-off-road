"use client";

import React from 'react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
  dict: any;
}

export function PageHeader({ title, description, breadcrumbs, dict }: PageHeaderProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? `https://tatraoffroad.pl${crumb.href}` : undefined,
    })),
  };

  return (
    <div className="relative bg-ink pt-10 pb-12 lg:pt-14 lg:pb-16 overflow-hidden">
      {/* JSON-LD for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Background styling */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange opacity-[0.03] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-[56px]">
        {/* Breadcrumbs */}
        <nav className="mb-5 sm:mb-6 flex flex-wrap items-center gap-y-1 text-[12px] sm:text-[13px] text-stone font-label tracking-[0.08em] sm:tracking-[0.1em] uppercase">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="mx-2 sm:mx-3 opacity-40">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-orange transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-orange line-clamp-2">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
        
        <h1 className="font-display text-[32px] sm:text-[40px] lg:text-[64px] text-snow uppercase leading-[0.92] tracking-[0.02em] mb-4 lg:mb-6 break-words">
          {title}
        </h1>
        {description && (
          <p className="text-stone text-[15.5px] lg:text-[18px] max-w-[600px] leading-[1.65]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
