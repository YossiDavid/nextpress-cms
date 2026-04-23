import { hooks } from '@nextpress/core';
import type { ReactNode } from 'react';

interface Props {
  slot: string;
  className?: string;
}

/**
 * Renders content injected into a named slot via the hook system.
 *
 * Plugins can inject content into any slot:
 *   hooks.addFilter('slot.sidebar', async (nodes) => [...nodes, <MyWidget />]);
 *
 * Available built-in slots: header-end, footer-start, sidebar,
 *   post-single-before, post-single-after, product-single-before, product-single-after
 */
export async function SlotRenderer({ slot, className }: Props) {
  const nodes = await hooks.applyFilters<ReactNode[]>(`slot.${slot}`, []);
  if (!nodes.length) return null;
  return (
    <div className={className}>
      {nodes.map((node, i) => (
        <div key={i}>{node}</div>
      ))}
    </div>
  );
}
