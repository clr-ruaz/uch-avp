/** Extract only the structured SharePoint error, never an HTML response or request URL.
 * Consumers must render this as textContent, not HTML.
 */
export function countErrorHint(error: string): string {
  if (error.includes('SPQueryThrottledException')) return 'SharePoint could not count this queue. Open the list or retry later.';
  if (error.includes('SharePoint error 403')) return 'You do not have access to this count.';
  return 'Count unavailable. Open the list or refresh to retry.';
}

export function sharePointError(status: number, body: unknown, requestId?: string): string {
  const record = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
  const root = record(body);
  const error = record(root.error || root['odata.error']);
  const message = typeof error.message === 'string' ? error.message : record(error.message).value;
  const clean = (value: unknown, limit: number): string => typeof value === 'string' ?
    value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, limit) : '';
  const detail = clean(message, 1200);
  const code = clean(error.code, 200);
  const correlation = requestId && /^[a-z0-9-]{1,80}$/i.test(requestId) ? ` Request ID: ${requestId}.` : '';
  const fallback = status === 403 ? 'Access denied.' : 'No structured error details were returned. Please retry.';
  return `SharePoint error ${status}${code ? ` (${code})` : ''}: ${detail || fallback}${correlation}`;
}
