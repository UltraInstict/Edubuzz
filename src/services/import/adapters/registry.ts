/**
 * Import pipeline — adapter registry (Milestone 2).
 *
 * A tiny registry so the orchestrator (M4) can enumerate and run all
 * configured sources without importing each adapter directly. Adding a new
 * connector = register(new XAdapter(cfg)) — the core engine never changes.
 */

import type { SourceAdapter } from '../types';

export class AdapterRegistry {
  private readonly adapters = new Map<string, SourceAdapter>();

  register(adapter: SourceAdapter): this {
    if (this.adapters.has(adapter.key)) {
      throw new Error(`Adapter already registered: ${adapter.key}`);
    }
    this.adapters.set(adapter.key, adapter);
    return this;
  }

  registerAll(adapters: SourceAdapter[]): this {
    for (const a of adapters) this.register(a);
    return this;
  }

  get(key: string): SourceAdapter | undefined {
    return this.adapters.get(key);
  }

  has(key: string): boolean {
    return this.adapters.has(key);
  }

  list(): SourceAdapter[] {
    return [...this.adapters.values()];
  }

  keys(): string[] {
    return [...this.adapters.keys()];
  }

  clear(): void {
    this.adapters.clear();
  }
}

/** Process-wide default registry. Sources are wired up in M4's orchestrator. */
export const registry = new AdapterRegistry();
