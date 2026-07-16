/**
 * Import pipeline — CSV adapter (Milestone 2).
 *
 * Covers bulk feeds / partner exports delivered as CSV. Includes a
 * self-contained RFC-4180 parser (handles quoted fields, embedded commas,
 * escaped quotes, and CRLF/LF) so no extra dependency is needed. `parseCsv`
 * and `mapCsvRows` are PURE and unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchText } from './http';

/** RawJob field → CSV column header. */
export interface CsvFieldMap {
  externalId?: string;
  sourceUrl?: string;
  applyUrl?: string;
  applyEmail?: string;
  title?: string;
  company?: string;
  location?: string;
  province?: string;
  city?: string;
  country?: string;
  descriptionHtml?: string;
  descriptionText?: string;
  salaryText?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryCurrency?: string;
  employmentType?: string;
  category?: string;
  closingDate?: string;
  postedDate?: string;
}

export interface CsvConfig {
  key: string;
  url: string;
  fieldMap: CsvFieldMap;
  defaultCompany?: string;
  delimiter?: string; // default ','
}

/**
 * RFC-4180 CSV parser. Returns rows of string cells. Pure.
 * Handles: quoted fields, "" escaped quotes, embedded delimiters/newlines,
 * and trailing newline. Blank trailing line is dropped.
 */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  const n = text.length;

  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\r') {
      // handled by the \n branch; skip lone CR
    } else {
      field += ch;
    }
  }
  // flush last field/row if any content
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Map parsed CSV rows (with header row) into RawJob[]. Pure. */
export function mapCsvRows(rows: string[][], config: Pick<CsvConfig, 'fieldMap' | 'defaultCompany'>): RawJob[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const idx: Record<string, number> = {};
  header.forEach((h, i) => (idx[h] = i));
  const fm = config.fieldMap;

  const get = (cells: string[], col: string | undefined): string | undefined => {
    if (!col) return undefined;
    const i = idx[col];
    if (i == null) return undefined;
    const v = (cells[i] ?? '').trim();
    return v || undefined;
  };
  const getNum = (cells: string[], col: string | undefined): number | undefined => {
    const v = get(cells, col);
    if (v == null) return undefined;
    const num = parseFloat(v.replace(/[, ]/g, ''));
    return isFinite(num) ? num : undefined;
  };

  return rows
    .slice(1)
    .filter((cells) => cells.some((c) => c.trim() !== ''))
    .map((cells): RawJob => {
      const link = get(cells, fm.applyUrl) || get(cells, fm.sourceUrl);
      return {
        externalId: get(cells, fm.externalId) || link,
        sourceUrl: get(cells, fm.sourceUrl) || link,
        applyUrl: get(cells, fm.applyUrl) || link,
        applyEmail: get(cells, fm.applyEmail),
        title: get(cells, fm.title),
        company: get(cells, fm.company) || config.defaultCompany,
        location: get(cells, fm.location),
        province: get(cells, fm.province),
        city: get(cells, fm.city),
        country: get(cells, fm.country),
        descriptionHtml: get(cells, fm.descriptionHtml),
        descriptionText: get(cells, fm.descriptionText),
        salaryText: get(cells, fm.salaryText),
        salaryMin: getNum(cells, fm.salaryMin),
        salaryMax: getNum(cells, fm.salaryMax),
        salaryCurrency: get(cells, fm.salaryCurrency),
        employmentType: get(cells, fm.employmentType),
        category: get(cells, fm.category),
        closingDate: get(cells, fm.closingDate),
        postedDate: get(cells, fm.postedDate),
      };
    })
    .filter((j) => j.title || j.applyUrl);
}

export class CsvAdapter implements SourceAdapter {
  readonly strategy = 'csv' as const;
  readonly key: string;
  constructor(private readonly config: CsvConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const text = await fetchText(this.config.url, { headers: { Accept: 'text/csv,*/*' } });
    const rows = parseCsv(text, this.config.delimiter || ',');
    return mapCsvRows(rows, this.config);
  }
}
