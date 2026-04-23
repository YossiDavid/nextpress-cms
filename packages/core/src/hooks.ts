type HookCallback<T = unknown> = (...args: unknown[]) => T | Promise<T>;

interface RegisteredHook<T = unknown> {
  callback: HookCallback<T>;
  priority: number;
}

export class HookSystem {
  private actions = new Map<string, RegisteredHook<void>[]>();
  private filters = new Map<string, RegisteredHook[]>();

  addAction(hook: string, callback: HookCallback<void>, priority = 10): void {
    const hooks = this.actions.get(hook) ?? [];
    hooks.push({ callback, priority });
    hooks.sort((a, b) => a.priority - b.priority);
    this.actions.set(hook, hooks);
  }

  async doAction(hook: string, ...args: unknown[]): Promise<void> {
    const hooks = this.actions.get(hook) ?? [];
    for (const { callback } of hooks) {
      await callback(...args);
    }
  }

  addFilter<T>(hook: string, callback: HookCallback<T>, priority = 10): void {
    const hooks = this.filters.get(hook) ?? [];
    hooks.push({ callback: callback as HookCallback, priority });
    hooks.sort((a, b) => a.priority - b.priority);
    this.filters.set(hook, hooks);
  }

  async applyFilters<T>(hook: string, value: T, ...args: unknown[]): Promise<T> {
    const hooks = this.filters.get(hook) ?? [];
    let result = value;
    for (const { callback } of hooks) {
      result = await callback(result, ...args) as T;
    }
    return result;
  }

  removeAction(hook: string, callback: HookCallback<void>): void {
    const hooks = this.actions.get(hook) ?? [];
    this.actions.set(hook, hooks.filter(h => h.callback !== callback));
  }

  removeFilter(hook: string, callback: HookCallback): void {
    const hooks = this.filters.get(hook) ?? [];
    this.filters.set(hook, hooks.filter(h => h.callback !== callback));
  }

  hasAction(hook: string): boolean {
    return (this.actions.get(hook)?.length ?? 0) > 0;
  }

  hasFilter(hook: string): boolean {
    return (this.filters.get(hook)?.length ?? 0) > 0;
  }
}

export const hooks = new HookSystem();
