import React from 'react'
import { fixOrphans, fixOrphansHtml } from '@/lib/typography'

type Tag = keyof React.JSX.IntrinsicElements

type TypoProps<T extends Tag = 'span'> = {
  as?: T
  children?: React.ReactNode
  html?: string
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'dangerouslySetInnerHTML'>

/** Renders text with Polish/EN orphan (sierotka) prevention. */
export function Typo<T extends Tag = 'span'>({
  as,
  children,
  html,
  className,
  ...rest
}: TypoProps<T>) {
  const Tag = (as || 'span') as Tag

  if (html != null) {
    return React.createElement(Tag, {
      className,
      ...rest,
      dangerouslySetInnerHTML: { __html: fixOrphansHtml(html) },
    })
  }

  if (typeof children === 'string') {
    return React.createElement(Tag, { className, ...rest }, fixOrphans(children))
  }

  return React.createElement(Tag, { className, ...rest }, children)
}
