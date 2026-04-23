'use client';

import { useTransition } from 'react';
import { setActiveTheme, saveThemeSettings } from '@/app/actions/themes';
import type { ThemeConfig } from '@nextpress/theme-engine';

interface Props {
  activeThemeId: string;
  themeConfig: ThemeConfig;
  themeSettingsMap: Record<string, string>;
}

export function ThemeSettingsSection({ activeThemeId, themeConfig, themeSettingsMap }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    startTransition(() => setActiveTheme(themeConfig.id));
  }

  function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const settings: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      settings[key] = String(value);
    }
    startTransition(() => saveThemeSettings(themeConfig.id, settings));
  }

  const isActive = activeThemeId === themeConfig.id;

  return (
    <section className="border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">נושא פעיל</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            ניהול הנושא הגרפי של האתר
          </p>
        </div>
        {isActive ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            פעיל
          </span>
        ) : (
          <button
            onClick={handleActivate}
            disabled={isPending}
            className="text-sm bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            הפעל
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">שם</p>
          <p className="font-medium mt-0.5">{themeConfig.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">גרסה</p>
          <p className="font-medium mt-0.5">{themeConfig.version}</p>
        </div>
        {themeConfig.description && (
          <div>
            <p className="text-muted-foreground">תיאור</p>
            <p className="font-medium mt-0.5">{themeConfig.description}</p>
          </div>
        )}
      </div>

      {themeConfig.settings && themeConfig.settings.length > 0 && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            הגדרות נושא
          </h3>
          {themeConfig.settings.map((setting) => {
            const optionKey = `theme_${themeConfig.id}_${setting.key}`;
            const currentValue = themeSettingsMap[optionKey] ?? setting.default ?? '';
            return (
              <div key={setting.key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor={setting.key}>
                  {setting.label}
                </label>
                {setting.type === 'color' && (
                  <input
                    id={setting.key}
                    name={setting.key}
                    type="color"
                    defaultValue={currentValue}
                    className="h-9 w-16 cursor-pointer rounded border border-border"
                  />
                )}
                {setting.type === 'boolean' && (
                  <input
                    id={setting.key}
                    name={setting.key}
                    type="checkbox"
                    defaultChecked={currentValue === 'true'}
                    value="true"
                    className="h-4 w-4"
                  />
                )}
                {setting.type === 'text' && (
                  <input
                    id={setting.key}
                    name={setting.key}
                    type="text"
                    defaultValue={currentValue}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                  />
                )}
                {setting.type === 'select' && setting.options && (
                  <select
                    id={setting.key}
                    name={setting.key}
                    defaultValue={currentValue}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
                  >
                    {setting.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
          <button
            type="submit"
            disabled={isPending}
            className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'שומר...' : 'שמור הגדרות'}
          </button>
        </form>
      )}
    </section>
  );
}
