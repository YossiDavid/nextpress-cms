import { prisma } from '@nextpress/db';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { ThemeSettingsSection } from '@/components/admin/ThemeSettingsSection';
import { config as defaultThemeConfig } from '@nextpress/theme-default';
import type { ThemeSetting } from '@nextpress/theme-engine';

export default async function SettingsPage() {
  const options = await prisma.option.findMany({ where: { autoload: true } });
  const optMap = Object.fromEntries(options.map((o) => [o.key, o.value]));

  const activeThemeId = optMap['active_theme'] ?? 'default';

  // Load current theme settings
  const themeSettings: ThemeSetting[] = defaultThemeConfig.settings ?? [];
  const themeSettingsKeys = themeSettings.map(
    (s) => `theme_${defaultThemeConfig.id}_${s.key}`,
  );
  const themeOptions =
    themeSettingsKeys.length > 0
      ? await prisma.option.findMany({ where: { key: { in: themeSettingsKeys } } })
      : [];
  const themeSettingsMap = Object.fromEntries(themeOptions.map((o) => [o.key, o.value]));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">הגדרות</h1>
        <p className="text-muted-foreground text-sm mt-1">הגדרות המערכת הכלליות</p>
      </div>
      <SettingsForm initialOptions={optMap} />

      <ThemeSettingsSection
        activeThemeId={activeThemeId}
        themeConfig={defaultThemeConfig}
        themeSettingsMap={themeSettingsMap}
      />
    </div>
  );
}
