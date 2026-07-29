/**
 * Import pipeline — dependency-free HTML query engine.
 *
 * A tiny, self-contained HTML tokenizer + DOM-lite tree + CSS-subset selector
 * matcher. It exists so the HTML career-page adapter (htmlCareer.ts) can be
 * configured with CSS selectors per employer WITHOUT pulling in a runtime
 * dependency (the production deploy runs `git pull && astro build` only — it
 * does NOT `npm install`, so a new runtime dep would break the prod build).
 *
 * Supported selector syntax (enough for hand-tuned per-employer configs):
 *   - type:            div, a, li, h2
 *   - class:           .job-card
 *   - id:              #results
 *   - attribute:       [data-role], [data-type="job"]
 *   - compound:        a.stretched-link, li.job[data-open="true"]
 *   - descendant:      .jobs li a         (whitespace = descendant combinator)
 *   - selector list:   .a, .b             (comma = OR)
 *
 * Everything here is PURE (string in → nodes/strings out) and unit-testable
 * with fixtures — no network, no globals.
 */

export interface HNode {
  /** Lowercased tag name. '' for the synthetic root. '#text' for text nodes. */
  tag: string;
  attrs: Record<string, string>;
  children: HNode[];
  parent: HNode | null;
  /** Raw text for '#text' nodes. */
  text?: string;
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
// Tags whose raw content must not be parsed as markup.
const RAWTEXT_TAGS = new Set(['script', 'style', 'noscript', 'template']);

function makeEl(tag: string, attrs: Record<string, string>, parent: HNode | null): HNode {
  return { tag, attrs, children: [], parent };
}

/** Parse an attribute string (inside a start tag) into a map. */
function parseAttrs(src: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const name = m[1].toLowerCase();
    let val = m[2] ?? '';
    if (val && (val[0] === '"' || val[0] === "'")) val = val.slice(1, -1);
    attrs[name] = val;
  }
  return attrs;
}

/** Parse an HTML document into a DOM-lite tree. Never throws. */
export function parseHtml(html: string): HNode {
  const root = makeEl('', {}, null);
  if (!html) return root;

  let stack: HNode[] = [root];
  let i = 0;
  const n = html.length;

  const pushText = (text: string) => {
    if (!text) return;
    const parent = stack[stack.length - 1];
    parent.children.push({ tag: '#text', attrs: {}, children: [], parent, text });
  };

  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      pushText(html.slice(i));
      break;
    }
    if (lt > i) pushText(html.slice(i, lt));

    // Comment / doctype / CDATA — skip.
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end = html.indexOf('>', lt + 1);
      i = end === -1 ? n : end + 1;
      continue;
    }

    const gt = html.indexOf('>', lt + 1);
    if (gt === -1) {
      pushText(html.slice(lt));
      break;
    }
    let tagSrc = html.slice(lt + 1, gt);
    const isClose = tagSrc[0] === '/';
    if (isClose) tagSrc = tagSrc.slice(1);

    const selfClose = tagSrc.endsWith('/');
    if (selfClose) tagSrc = tagSrc.slice(0, -1);

    const spaceIdx = tagSrc.search(/[\s]/);
    const tagName = (spaceIdx === -1 ? tagSrc : tagSrc.slice(0, spaceIdx)).toLowerCase();
    const attrSrc = spaceIdx === -1 ? '' : tagSrc.slice(spaceIdx + 1);

    if (!tagName) {
      i = gt + 1;
      continue;
    }

    if (isClose) {
      // Pop up to the matching open tag.
      for (let s = stack.length - 1; s >= 1; s--) {
        if (stack[s].tag === tagName) {
          stack = stack.slice(0, s);
          break;
        }
      }
      i = gt + 1;
      continue;
    }

    const el = makeEl(tagName, parseAttrs(attrSrc), stack[stack.length - 1]);
    stack[stack.length - 1].children.push(el);

    if (RAWTEXT_TAGS.has(tagName) && !selfClose) {
      // Consume raw content until the matching close tag.
      const closeRe = new RegExp(`</${tagName}\\s*>`, 'i');
      const rest = html.slice(gt + 1);
      const closeMatch = closeRe.exec(rest);
      if (closeMatch) {
        el.children.push({ tag: '#text', attrs: {}, children: [], parent: el, text: rest.slice(0, closeMatch.index) });
        i = gt + 1 + closeMatch.index + closeMatch[0].length;
      } else {
        el.children.push({ tag: '#text', attrs: {}, children: [], parent: el, text: rest });
        i = n;
      }
      continue;
    }

    if (!selfClose && !VOID_TAGS.has(tagName)) stack.push(el);
    i = gt + 1;
  }

  return root;
}

// ---------------------------------------------------------------------------
// Selector matching
// ---------------------------------------------------------------------------

interface Simple {
  tag?: string;
  id?: string;
  classes: string[];
  attrs: Array<{ name: string; value?: string }>;
}

/** Parse a single compound selector (no combinators). */
function parseSimple(sel: string): Simple {
  const out: Simple = { classes: [], attrs: [] };
  const re = /([.#]?[a-zA-Z0-9_-]+)|(\[[^\]]+\])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sel))) {
    const tok = m[0];
    if (tok[0] === '.') out.classes.push(tok.slice(1));
    else if (tok[0] === '#') out.id = tok.slice(1);
    else if (tok[0] === '[') {
      const inner = tok.slice(1, -1);
      const eq = inner.indexOf('=');
      if (eq === -1) out.attrs.push({ name: inner.trim().toLowerCase() });
      else {
        const name = inner.slice(0, eq).trim().toLowerCase();
        let value = inner.slice(eq + 1).trim();
        if (value && (value[0] === '"' || value[0] === "'")) value = value.slice(1, -1);
        out.attrs.push({ name, value });
      }
    } else {
      out.tag = tok.toLowerCase();
    }
  }
  return out;
}

function classList(node: HNode): string[] {
  const c = node.attrs['class'];
  return c ? c.split(/\s+/).filter(Boolean) : [];
}

function matchesSimple(node: HNode, s: Simple): boolean {
  if (node.tag === '#text' || node.tag === '') return false;
  if (s.tag && node.tag !== s.tag) return false;
  if (s.id && node.attrs['id'] !== s.id) return false;
  if (s.classes.length) {
    const cl = classList(node);
    if (!s.classes.every((c) => cl.includes(c))) return false;
  }
  for (const a of s.attrs) {
    const v = node.attrs[a.name];
    if (v === undefined) return false;
    if (a.value !== undefined && v !== a.value) return false;
  }
  return true;
}

/** Walk every element descendant of `node` (excludes text nodes). */
function* walk(node: HNode): Generator<HNode> {
  for (const child of node.children) {
    if (child.tag !== '#text') {
      yield child;
      yield* walk(child);
    }
  }
}

/** querySelectorAll for a comma-separated list of descendant-combinator selectors. */
export function queryAll(root: HNode, selector: string): HNode[] {
  const groups = selector.split(',').map((g) => g.trim()).filter(Boolean);
  const seen = new Set<HNode>();
  const results: HNode[] = [];

  for (const group of groups) {
    const parts = group.split(/\s+/).filter(Boolean).map(parseSimple);
    if (!parts.length) continue;

    // Start with all elements matching the first compound, then narrow by
    // descendant relationship for each subsequent compound.
    let current: HNode[] = [];
    for (const el of walk(root)) if (matchesSimple(el, parts[0])) current.push(el);

    for (let p = 1; p < parts.length; p++) {
      const next: HNode[] = [];
      const nseen = new Set<HNode>();
      for (const ancestor of current) {
        for (const el of walk(ancestor)) {
          if (matchesSimple(el, parts[p]) && !nseen.has(el)) {
            nseen.add(el);
            next.push(el);
          }
        }
      }
      current = next;
    }

    for (const el of current) {
      if (!seen.has(el)) {
        seen.add(el);
        results.push(el);
      }
    }
  }
  return results;
}

/** First match of `selector` within `root`, or null. */
export function queryFirst(root: HNode, selector: string): HNode | null {
  return queryAll(root, selector)[0] ?? null;
}

/** Concatenated, whitespace-collapsed text content of a node subtree. */
export function textOf(node: HNode | null | undefined): string {
  if (!node) return '';
  let out = '';
  const rec = (n: HNode) => {
    if (n.tag === '#text') out += n.text || '';
    else for (const c of n.children) rec(c);
  };
  rec(node);
  return out.replace(/\s+/g, ' ').trim();
}

/** Inner HTML-ish serialization of a node subtree (best-effort, for descriptions). */
export function innerHtmlOf(node: HNode | null | undefined): string {
  if (!node) return '';
  const rec = (n: HNode): string => {
    if (n.tag === '#text') return n.text || '';
    const inner = n.children.map(rec).join('');
    if (n.tag === '') return inner;
    const attrs = Object.entries(n.attrs)
      .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${v.replace(/"/g, '&quot;')}"`))
      .join('');
    if (VOID_TAGS.has(n.tag)) return `<${n.tag}${attrs}>`;
    return `<${n.tag}${attrs}>${inner}</${n.tag}>`;
  };
  return node.children.map(rec).join('').trim();
}

/** Value of an attribute on a node (case-insensitive name). */
export function attrOf(node: HNode | null | undefined, name: string): string {
  if (!node) return '';
  return node.attrs[name.toLowerCase()] ?? '';
}

/** Resolve a possibly-relative href against a base URL. Returns '' on failure. */
export function resolveUrl(href: string, base: string): string {
  if (!href) return '';
  try {
    return new URL(href, base || undefined).toString();
  } catch {
    return href.startsWith('http') ? href : '';
  }
}
