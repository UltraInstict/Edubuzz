/**
 * Import pipeline — structured run logger (Milestone 4).
 *
 * Accumulates per-run metrics + structured events so an import can be audited
 * (data-quality / feed-health reports in M5). Backed by an in-memory buffer
 * plus optional console output; a DB-backed sink can be attached later without
 * changing callers.
 */

import type { RejectionReason } from '../types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ImportEvent {
  level: LogLevel;
  message: string;
  at: string; // ISO timestamp
  data?: Record<string, unknown>;
}

export interface ImportRunResult {
  source: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  acquired: number;
  canonicalized: number;
  imported: number;
  updated: number;
  duplicates: number;
  rejected: number;
  warnings: number;
  /** Jobs deactivated because they disappeared from the source this run. */
  expired: number;
  /** Rejection reason → count. */
  rejectionBreakdown: Partial<Record<RejectionReason, number>>;
  /** Non-fatal errors encountered while processing individual records. */
  errors: string[];
  events: ImportEvent[];
}

export class ImportLogger {
  private events: ImportEvent[] = [];
  readonly counters = {
    acquired: 0,
    canonicalized: 0,
    imported: 0,
    updated: 0,
    duplicates: 0,
    rejected: 0,
    warnings: 0,
    expired: 0,
  };
  readonly rejectionBreakdown: Partial<Record<RejectionReason, number>> = {};
  readonly errors: string[] = [];
  private readonly startedAt = Date.now();

  constructor(
    readonly source: string,
    private readonly opts: { console?: boolean } = {}
  ) {}

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const evt: ImportEvent = { level, message, at: new Date().toISOString(), data };
    this.events.push(evt);
    if (this.opts.console) {
      const tag = `[import:${this.source}]`;
      const line = data ? `${tag} ${message} ${JSON.stringify(data)}` : `${tag} ${message}`;
      if (level === 'error') console.error(line);
      else if (level === 'warn') console.warn(line);
      else console.log(line);
    }
  }

  debug(m: string, d?: Record<string, unknown>) { this.emit('debug', m, d); }
  info(m: string, d?: Record<string, unknown>) { this.emit('info', m, d); }
  warn(m: string, d?: Record<string, unknown>) { this.counters.warnings++; this.emit('warn', m, d); }
  error(m: string, d?: Record<string, unknown>) { this.errors.push(m); this.emit('error', m, d); }

  recordRejection(reasons: RejectionReason[]) {
    this.counters.rejected++;
    for (const r of reasons) {
      this.rejectionBreakdown[r] = (this.rejectionBreakdown[r] || 0) + 1;
    }
  }

  finalize(): ImportRunResult {
    const finished = Date.now();
    return {
      source: this.source,
      startedAt: new Date(this.startedAt).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - this.startedAt,
      acquired: this.counters.acquired,
      canonicalized: this.counters.canonicalized,
      imported: this.counters.imported,
      updated: this.counters.updated,
      duplicates: this.counters.duplicates,
      rejected: this.counters.rejected,
      warnings: this.counters.warnings,
      expired: this.counters.expired,
      rejectionBreakdown: { ...this.rejectionBreakdown },
      errors: [...this.errors],
      events: [...this.events],
    };
  }
}
