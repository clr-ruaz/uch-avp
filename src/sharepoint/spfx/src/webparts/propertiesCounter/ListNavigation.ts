import { listEndpoint, Read } from './CountService';
export const defaultPropertyListId = 'dcec0f31-ec6f-4d88-8f0b-fbfe1a7a7d15';

/** Resolve the list's actual UI URL; never assume a configurable GUID has a fixed path. */
export async function resolveListUrl(read: Read, site: string, listId: string): Promise<string> {
  const list = await read(`${listEndpoint(site, listId).slice(0, -6)}?$select=DefaultViewUrl`);
  if (typeof list.DefaultViewUrl !== 'string' || !list.DefaultViewUrl) throw new Error('SharePoint did not return a list navigation URL.');
  const base = new URL(site);
  const url = new URL(list.DefaultViewUrl, site.replace(/\/$/, '') + '/');
  const prefix = base.pathname.replace(/\/$/, '') + '/';
  if (url.origin !== base.origin || !url.pathname.startsWith(prefix) || url.username || url.password) {
    throw new Error('SharePoint returned an unexpected list navigation URL.');
  }
  return url.href;
}
export function listViewUrl(baseUrl: string | undefined, listId: string, view?: string): string | undefined {
  if (!baseUrl) return undefined;
  const url = new URL(baseUrl);
  // The supplied AVP view GUIDs belong only to the original list. Custom lists
  // open their own default view instead of inheriting another list's view IDs.
  if (view && listId.toLowerCase() === defaultPropertyListId) url.searchParams.set('viewid', view);
  return url.href;
}
