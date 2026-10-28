/** Strict, non-executable subset of OData used by the AVP counting rules.
 * Unknown syntax and missing projected fields fail closed instead of changing counts.
 */
type Row = Record<string, unknown>;
type Predicate = (row: Row) => boolean;
export function compileFilter(source: string, dateFields: ReadonlySet<string> = new Set()): { fields: string[]; matches: Predicate } {
  const tokens: string[] = [];
  const pattern = /\s+|'(?:[^']|'')*'|-?\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*(?:\/[A-Za-z_][A-Za-z0-9_]*)*|[()]/gy;
  let offset = 0;
  while (offset < source.length) {
    pattern.lastIndex = offset;
    const token = pattern.exec(source);
    if (!token) throw new Error('Unsupported counting rule syntax. Contact the AVP administrator.');
    offset = pattern.lastIndex;
    if (token[0].trim()) tokens.push(token[0]);
  }
  let index = 0;
  const fields = new Set<string>();
  const fail = (): never => { throw new Error('Unsupported counting rule syntax. Contact the AVP administrator.'); };
  function expression(): Predicate {
    let left = conjunction();
    while (tokens[index] === 'or') { index++; const a = left, b = conjunction(); left = row => a(row) || b(row); }
    return left;
  }
  function conjunction(): Predicate {
    let left = term();
    while (tokens[index] === 'and') { index++; const a = left, b = term(); left = row => a(row) && b(row); }
    return left;
  }
  function term(): Predicate {
    if (tokens[index] === '(') {
      index++; const inner = expression();
      if (tokens[index++] !== ')') fail();
      return inner;
    }
    const field = tokens[index++];
    if (!field || !/^[A-Za-z_][A-Za-z0-9_]*(?:\/[A-Za-z_][A-Za-z0-9_]*)?$/.test(field)) return fail();
    const operator = tokens[index++];
    if (!['eq', 'ne', 'gt', 'ge', 'lt', 'le'].includes(operator)) return fail();
    const literal = tokens[index++];
    if (!literal) return fail();
    let expected: string | number | boolean | null;
    if (literal.startsWith("'")) expected = literal.slice(1, -1).replace(/''/g, "'");
    else if (literal === 'null') expected = null;
    else if (literal === 'true' || literal === 'false') expected = literal === 'true';
    else if (/^-?\d+(?:\.\d+)?$/.test(literal)) expected = Number(literal);
    else return fail();
    fields.add(field);
    return row => {
      let actual: unknown = row;
      // REST can omit the expanded object/title for an empty lookup. Only an
      // explicitly null foreign key permits treating that omission as null.
      if (field.includes('/') && row[field.split('/')[0] + 'Id'] === null) actual = null;
      for (const part of field.split('/')) {
        if (actual === null) break;
        if (typeof actual !== 'object' || !Object.prototype.hasOwnProperty.call(actual, part)) {
          throw new Error(`SharePoint omitted counting field ${field}.`);
        }
        actual = (actual as Row)[part];
      }
      let right = expected;
      // Convert only columns declared DateTime by SharePoint, never date-looking text.
      if (dateFields.has(field) && actual !== null && right !== null) {
        const dateValue = (value: unknown): number => {
          if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) {
            throw new Error(`Invalid date in counting field ${field}.`);
          }
          const time = Date.parse(value);
          if (!Number.isFinite(time)) throw new Error(`Invalid date in counting field ${field}.`);
          return time;
        };
        actual = dateValue(actual); right = dateValue(right);
      }
      if (actual !== null && !['string', 'number', 'boolean'].includes(typeof actual)) throw new Error(`Invalid counting field ${field}.`);
      if (operator === 'eq') return actual === right;
      if (operator === 'ne') return actual !== right;
      if (actual === null || right === null) return false;
      if (typeof actual !== typeof right) throw new Error(`Incompatible counting field ${field}.`);
      const left = actual as string | number | boolean;
      if (operator === 'gt') return left > right;
      if (operator === 'ge') return left >= right;
      if (operator === 'lt') return left < right;
      return left <= right;
    };
  }
  const matches = expression();
  if (index !== tokens.length) fail();
  return { fields: Array.from(fields), matches };
}
