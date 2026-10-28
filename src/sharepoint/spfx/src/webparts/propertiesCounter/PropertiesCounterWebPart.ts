import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { SPHttpClient } from '@microsoft/sp-http';
import { categories, CountResult, CountService, Page } from './CountService';
import { countErrorHint, sharePointError } from './SharePointError';
import { listViewUrl, resolveListUrl } from './ListNavigation';
import './counter.module.scss';

interface Properties { propertyListId: string; filterListId: string; }
export default class PropertiesCounterWebPart extends BaseClientSideWebPart<Properties> {
  private generation = 0;
  private disposed = false;
  private results: CountResult[] = [];
  private busy = false;
  private message = '';
  private listBaseUrl: string | undefined;
  private get site(): string { return this.context.pageContext.web.absoluteUrl.replace(/\/$/, ''); }

  public render(): void { this.refresh(); }

  private draw(): void {
    this.domElement.innerHTML = '';
    const root = document.createElement('section');
    root.className = 'avp-counter';
    root.setAttribute('aria-label', 'AVP property workload');
    const header = document.createElement('header');
    const status = document.createElement('p'); status.className = 'avp-status'; status.setAttribute('role', 'status');
    status.textContent = this.message;
    const refresh = document.createElement('button'); refresh.type = 'button'; refresh.textContent = this.busy ? 'Refreshing…' : 'Refresh counts';
    refresh.disabled = this.busy; refresh.onclick = () => this.refresh();
    header.append(status, refresh); root.append(header);
    const grid = document.createElement('div'); grid.className = 'avp-grid';
    categories.forEach((category, index) => {
      const card = document.createElement('a'); card.className = 'avp-card';
      this.setLink(card, this.listUrl(category.view)); card.target = '_blank'; card.rel = 'noopener noreferrer';
      const label = document.createElement('span'); label.className = 'avp-label'; label.textContent = category.title;
      const value = document.createElement('strong'); value.className = 'avp-count';
      const result = this.results[index];
      value.textContent = result?.error ? 'Unavailable' : result?.count !== undefined ? result.count.toLocaleString() : '…';
      if (result?.error) { value.classList.add('avp-error'); card.title = result.error; }
      const hint = document.createElement('span'); hint.className = 'avp-hint';
      hint.textContent = result?.error ? countErrorHint(result.error) : result?.progress || 'View property listing';
      card.setAttribute('aria-label', `${category.title}: ${value.textContent}. Opens in a new tab.`);
      card.append(label, value, hint); grid.append(card);
    });
    root.append(grid);
    const tools = document.createElement('nav'); tools.className = 'avp-tools'; tools.setAttribute('aria-label', 'Other AVP tools');
    [
      ['Import properties', `${this.site}/Lists/Manual%20Data%20Importer/AllItems.aspx`],
      ['Dropped properties', this.listUrl('4e64519f-7565-4070-86f2-15d3949c3c00')],
      ['Search all properties', this.listUrl()]
    ].forEach(([label, url]) => {
      const link = document.createElement('a'); link.textContent = label + ' ↗'; this.setLink(link, url); link.target = '_blank'; link.rel = 'noopener noreferrer'; tools.append(link);
    });
    root.append(tools); this.domElement.append(root);
  }

  private setLink(link: HTMLAnchorElement, url: string | undefined): void {
    if (url) { link.href = url; link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex'); }
    else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.tabIndex = -1; }
  }

  private listUrl(view?: string): string | undefined {
    return listViewUrl(this.listBaseUrl, this.properties.propertyListId, view);
  }

  private async read(url: string): Promise<Page> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1,
        { headers: { Accept: 'application/json;odata=nometadata', 'odata-version': '' } });
      if (response.ok) return response.json();
      if ((response.status === 429 || response.status === 503) && attempt < 2) {
        const raw = response.headers.get('Retry-After');
        const seconds = raw ? Number(raw) : NaN;
        const delay = Number.isFinite(seconds) ? seconds * 1000 : raw ? Date.parse(raw) - Date.now() : 1000 * Math.pow(2, attempt);
        // Do not retry earlier than the server requests; long waits become a visible error.
        if (delay > 30000) throw new Error('SharePoint is busy. Please refresh later.');
        await new Promise(resolve => setTimeout(resolve, Math.max(1000, Number.isFinite(delay) ? delay : 1000)));
        if (this.disposed) throw new Error('Cancelled');
        continue;
      }
      let body: unknown;
      try { body = await response.json(); } catch { /* Proxies can return HTML instead of OData JSON. */ }
      throw new Error(sharePointError(response.status, body, response.headers.get('SPRequestGuid') || undefined));
    }
    throw new Error('SharePoint is busy. Please refresh later.');
  }

  private refresh(): void {
    const generation = ++this.generation;
    const cancelled = (): boolean => this.disposed || generation !== this.generation;
    this.listBaseUrl = undefined;
    this.results = []; this.busy = true; this.message = 'Loading counts…'; this.draw();
    const service = new CountService(url => this.read(url), this.site, this.properties.propertyListId, this.properties.filterListId);
    void resolveListUrl(url => this.read(url), this.site, this.properties.propertyListId).then(baseUrl => {
      if (cancelled()) return;
      this.listBaseUrl = baseUrl;
      this.domElement.querySelectorAll<HTMLAnchorElement>('.avp-card').forEach((card, index) => this.setLink(card, this.listUrl(categories[index].view)));
      const links = this.domElement.querySelectorAll<HTMLAnchorElement>('.avp-tools a');
      this.setLink(links[1], this.listUrl('4e64519f-7565-4070-86f2-15d3949c3c00'));
      this.setLink(links[2], this.listUrl());
      return service.load((index, result) => {
      if (!cancelled()) {
        this.results[index] = result;
        // Update cards without replacing focused navigation/refresh controls.
        const card = this.domElement.querySelectorAll<HTMLAnchorElement>('.avp-card')[index];
        const value = card.querySelector<HTMLElement>('.avp-count')!;
        value.textContent = result.error ? 'Unavailable' : result.count !== undefined ? result.count.toLocaleString() : '…';
        card.querySelector<HTMLElement>('.avp-hint')!.textContent = result.error || result.progress ||
          'View property listing';
        if (result.error) {
          value.classList.add('avp-error'); card.title = result.error;
          card.querySelector<HTMLElement>('.avp-hint')!.textContent = countErrorHint(result.error);
        }
        card.setAttribute('aria-label', `${categories[index].title}: ${value.textContent}. Opens in a new tab.`);
      }
      }, cancelled);
    }).catch((error: Error) => {
      if (!cancelled()) {
        this.results = categories.map(() => ({ error: error.message }));
        this.message = error.message;
      }
    }).then(() => {
      if (!cancelled()) {
        this.busy = false;
        const failed = this.results.some(result => !!result.error);
        this.message = failed ? 'Some counts are unavailable. List links still work; refresh to retry.' :
          `Checked at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        const focused = this.domElement.contains(document.activeElement) ? document.activeElement : undefined;
        const anchorIndex = Array.from(this.domElement.querySelectorAll('a')).indexOf(focused as HTMLAnchorElement);
        const wasButton = focused?.tagName === 'BUTTON';
        this.draw();
        if (wasButton) this.domElement.querySelector('button')?.focus();
        else if (anchorIndex >= 0) this.domElement.querySelectorAll('a')[anchorIndex]?.focus();
      }
    });
  }
  protected onDispose(): void { this.disposed = true; this.generation++; this.domElement.innerHTML = ''; }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: 'Uses the current SharePoint site. View links target the existing AVP lists.' }, groups: [{ groupName: 'AVP list configuration', groupFields: [
      PropertyPaneTextField('propertyListId', { label: 'Property Listing GUID' }),
      PropertyPaneTextField('filterListId', { label: 'OData Filters GUID' })
    ] }] }] };
  }
}
