import { compileFilter } from './FilterPredicate';
export const categories = [
  { title: 'Intake', view: '786f8ed0-b560-4be0-be0f-092c2a713bfb', upcoming: true },
  { title: 'Junior Review', view: 'd6262f4b-2c58-4bc7-90a7-91d1e7a62330', upcoming: true },
  { title: 'Junior Input', view: '592d06b5-503f-4b2f-b635-19529d81b5b7', upcoming: true },
  { title: 'Senior Review', view: 'c78dc459-d3af-4454-80af-71e2821f5706', upcoming: true },
  { title: 'Pipeline', view: '0e37c03f-d6f8-444f-9075-b71c3b730356', upcoming: false },
  { title: 'Watchlist', view: 'ad23a0f7-5f59-4933-9829-9b31e1ee3176', upcoming: false }
];
export interface Page { DefaultViewUrl?: string; value?: Record<string, unknown>[]; 'odata.nextLink'?: string; '@odata.nextLink'?: string; }
export type Read = (url: string) => Promise<Page>;
export interface CountResult { count?: number; error?: string; progress?: string; }
const isListThreshold = (error: unknown): boolean =>
  error instanceof Error && error.message.indexOf('SPQueryThrottledException') >= 0;
// Preserve the legacy flow's UTC-08 calendar date, including its midnight UTC literal.
export function saleDay(now: Date): string {
  return new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function countFilter(filter: string, upcoming: boolean, day: string): string {
  return `(${filter})${upcoming ? ` and SaleDate ne null and SaleDate ge '${day}'` : ''}`;
}
export function listEndpoint(site: string, id: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Configure a valid SharePoint list ID in the web part settings.');
  }
  return `${site.replace(/\/$/, '')}/_api/web/lists(guid'${id}')/items`;
}
export class CountService {
  public constructor(private readonly read: Read, private readonly site: string,
    private readonly propertyList: string, private readonly filtersList: string) {}

  private async countQuery(endpoint: string, filter: string, cancelled: () => boolean): Promise<number> {
    let count = 0;
    await this.pages(`${endpoint}?$select=Id&$orderby=Id&$top=2000&$filter=${encodeURIComponent(filter)}`,
      rows => { count += rows.length; }, cancelled);
    return count;
  }

  private async pages(url: string, consume: (rows: Record<string, unknown>[]) => void,
    cancelled: () => boolean): Promise<void> {
    const seen = new Set<string>();
    // SharePoint continuation URLs can change casing and percent-encoding.
    const canonicalPath = (path: string): string => decodeURIComponent(path).toLowerCase();
    const resourcePath = canonicalPath(new URL(url).pathname);
    while (url) {
      if (cancelled()) throw new Error('Cancelled');
      const next = new URL(url, this.site + '/');
      const base = new URL(this.site);
      if (next.origin !== base.origin || !canonicalPath(next.pathname).startsWith(canonicalPath(base.pathname).replace(/\/$/, '') + '/_api/') || canonicalPath(next.pathname) !== resourcePath) {
        throw new Error('SharePoint returned an unexpected paging link.');
      }
      if (seen.has(next.href)) throw new Error('SharePoint repeated a page; count unavailable.');
      seen.add(next.href);
      const page = await this.read(next.href);
      if (cancelled()) throw new Error('Cancelled');
      if (!Array.isArray(page.value)) throw new Error('SharePoint returned an invalid result.');
      consume(page.value);
      const continuation = page['@odata.nextLink'] || page['odata.nextLink'];
      url = continuation ? new URL(continuation, next.href).href : '';
    }
  }

  public async load(update: (index: number, result: CountResult) => void,
    cancelled: () => boolean = () => false, now: Date = new Date()): Promise<void> {
    const filters = new Map<string, string>();
    const duplicates = new Set<string>();
    const titles = new Set<string>();
    await this.pages(`${listEndpoint(this.site, this.filtersList)}?$select=Title,Filter&$top=100`, rows => {
      rows.forEach(row => {
        const title = String(row.Title);
        if (titles.has(title)) duplicates.add(title);
        titles.add(title);
        if (typeof row.Filter === 'string' && row.Filter.trim()) filters.set(title, row.Filter.trim());
      });
    }, cancelled);
    const endpoint = listEndpoint(this.site, this.propertyList);
    const day = saleDay(now);
    const fallback: { index: number; query: string }[] = [];
    let index = 0;
    const worker = async (): Promise<void> => {
      while (index < categories.length && !cancelled()) {
        const current = index++;
        const category = categories[current];
        try {
          const filter = filters.get(category.title);
          if (!filter || duplicates.has(category.title)) throw new Error('Missing or duplicate counting rule. Contact the AVP administrator.');
          const query = countFilter(filter, category.upcoming, day);
          try {
            const count = await this.countQuery(endpoint, query, cancelled);
            if (!cancelled()) update(current, { count });
          } catch (error) {
            if (!isListThreshold(error) || cancelled()) throw error;
            fallback.push({ index: current, query });
            update(current, { progress: 'Counting a large list…' });
          }
        } catch (error) {
          if (!cancelled()) update(current, { error: error instanceof Error ? error.message : 'Count unavailable. Try refreshing.' });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (!fallback.length || cancelled()) return;
    // A single unfiltered, ID-ordered traversal avoids threshold-prone lookup/OR filters.
    // Only required fields are projected; rows are discarded after evaluating each page.
    const schema = new Map<string, string>();
    try {
      // Field collections can honor $top without returning a continuation link.
      // Read the full (small) schema so wide AVP lists are not silently truncated.
      await this.pages(`${endpoint.slice(0, -6)}/fields?$select=InternalName,EntityPropertyName,TypeAsString`, rows => {
        for (const row of rows) {
          const name = typeof row.EntityPropertyName === 'string' && row.EntityPropertyName ? row.EntityPropertyName : row.InternalName;
          if (typeof name === 'string' && typeof row.TypeAsString === 'string') schema.set(name, row.TypeAsString);
        }
      }, cancelled);
    } catch (error) {
      if (!cancelled()) fallback.forEach(item => update(item.index, { error: (error as Error).message }));
      return;
    }
    const dateFields = new Set(Array.from(schema).filter(([, type]) => type === 'DateTime').map(([name]) => name));
    const pending: { index: number; fields: string[]; matches: (row: Record<string, unknown>) => boolean; count: number; failed?: boolean }[] = [];
    for (const item of fallback) {
      try {
        const rule = compileFilter(item.query, dateFields);
        for (const field of rule.fields) {
          const [name, member] = field.split('/');
          if (!schema.has(name)) throw new Error(`Unknown counting field ${name}.`);
          if (member && (schema.get(name) !== 'Lookup' || member !== 'Title')) throw new Error(`Unsupported lookup counting field ${field}.`);
        }
        pending.push({ index: item.index, ...rule, count: 0 });
      }
      catch (error) { if (!cancelled()) update(item.index, { error: (error as Error).message }); }
    }
    if (!pending.length || cancelled()) return;
    const fields = new Set<string>(['Id']);
    const expand = new Set<string>();
    pending.forEach(item => item.fields.forEach(field => {
      fields.add(field);
      if (field.includes('/')) {
        const lookup = field.split('/')[0];
        expand.add(lookup);
        fields.add(lookup + 'Id');
      }
    }));
    const url = `${endpoint}?$select=${encodeURIComponent(Array.from(fields).join(','))}` +
      `&$orderby=Id&$top=2000${expand.size ? '&$expand=' + encodeURIComponent(Array.from(expand).join(',')) : ''}`;
    let scanned = 0;
    try {
      await this.pages(url, rows => {
        for (const item of pending) {
          if (item.failed) continue;
          try { for (const row of rows) if (item.matches(row)) item.count++; }
          catch (error) {
            item.failed = true;
            if (!cancelled()) update(item.index, { error: (error as Error).message });
          }
        }
        scanned += rows.length;
        if (!cancelled()) pending.filter(item => !item.failed).forEach(item => update(item.index, { progress: `Checked ${scanned.toLocaleString()} properties…` }));
      }, cancelled);
      if (!cancelled()) pending.filter(item => !item.failed).forEach(item => update(item.index, { count: item.count }));
    } catch (error) {
      if (!cancelled()) pending.filter(item => !item.failed).forEach(item => update(item.index, { error: (error as Error).message }));
    }
  }
}
