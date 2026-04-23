export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  // Slot component paths relative to the theme directory
  slots: Partial<
    Record<
      | 'header'
      | 'footer'
      | 'sidebar'
      | 'home'
      | 'post-single'
      | 'product-single'
      | 'archive',
      string
    >
  >;
  // Settings schema
  settings?: ThemeSetting[];
}

export interface ThemeSetting {
  key: string;
  label: string;
  type: 'text' | 'color' | 'boolean' | 'select';
  default?: string;
  options?: { label: string; value: string }[];
}
