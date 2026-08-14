import type { CollectionConfig } from 'payload'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  labels: { singular: 'Aktualność', plural: 'Aktualności' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'active'],
    group: 'Treść',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: { description: 'np. nowe-can-am-outlander-2025' },
    },
    { name: 'excerpt', type: 'textarea', localized: true, label: 'Lead / zajawka' },
    { name: 'content', type: 'textarea', localized: true, label: 'Treść (HTML dozwolony)' },
    { name: 'author', type: 'text', defaultValue: 'Tatra Off-Road Team', label: 'Autor' },
    { name: 'publishedAt', type: 'date', required: true, label: 'Data publikacji' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'URL zdjęcia (opcjonalnie)',
    },
    {
      type: 'group',
      name: 'meta',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', localized: true, label: 'Meta title' },
        { name: 'description', type: 'textarea', localized: true, label: 'Meta description' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Opublikowana' },
  ],
}
