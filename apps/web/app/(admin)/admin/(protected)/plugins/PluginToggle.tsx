'use client';

import { useTransition } from 'react';
import { togglePlugin } from '@/app/actions/plugins';

interface Props {
  pluginId: string;
  active: boolean;
}

export function PluginToggle({ pluginId, active }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      togglePlugin(pluginId, !active);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50',
        active ? 'bg-primary' : 'bg-input',
      ].join(' ')}
      aria-label={active ? 'השבת תוסף' : 'הפעל תוסף'}
    >
      <span
        className={[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
          active ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}
