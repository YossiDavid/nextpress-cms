// Template slots — override entire sections via ThemeConfig
export const KNOWN_SLOTS = [
  'header',
  'footer',
  'sidebar',
  'home',
  'post-single',
  'product-single',
  'archive',
] as const;

// Widget injection points — used via hooks.addFilter('slot.<name>', async (nodes) => [...nodes, <Widget />])
export const WIDGET_SLOTS = [
  'header-end',
  'footer-start',
  'sidebar',
  'post-single-before',
  'post-single-after',
  'product-single-before',
  'product-single-after',
] as const;

export type WidgetSlotName = (typeof WIDGET_SLOTS)[number];

export type SlotName = (typeof KNOWN_SLOTS)[number];

interface SlotEntry {
  component: string;
  priority: number;
}

export class SlotRegistry {
  private slots: Map<string, SlotEntry[]> = new Map();

  register(slot: string, component: string, priority = 10): void {
    const entries = this.slots.get(slot) ?? [];
    entries.push({ component, priority });
    entries.sort((a, b) => b.priority - a.priority);
    this.slots.set(slot, entries);
  }

  getSlot(slot: string): string | undefined {
    const entries = this.slots.get(slot);
    return entries?.[0]?.component;
  }

  getAllSlots(): string[] {
    return Array.from(this.slots.keys());
  }
}

export const slotRegistry = new SlotRegistry();
