import type { ThemeConfig } from '@nextpress/theme-engine';

export const config: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  version: '0.1.0',
  description: 'The default NextPress theme',
  slots: {
    header: './components/ThemeHeader',
    footer: './components/ThemeFooter',
    home: './components/HomePage',
    'post-single': './components/PostTemplate',
    'product-single': './components/ProductTemplate',
    archive: './components/ArchivePage',
  },
  settings: [
    { key: 'primary_color', label: 'צבע ראשי', type: 'color', default: '#000000' },
    { key: 'show_sidebar', label: 'הצג סרגל צד', type: 'boolean', default: 'false' },
  ],
};
