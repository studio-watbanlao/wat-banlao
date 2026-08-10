// ----------------------------------------------------------------------

/**
 * Calculates the number of empty rows for a paginated table.
 */
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number): number {
  return Math.max(0, (page + 1) * rowsPerPage - arrayLength);
}

/**
 * Compares two values in descending order by a given key.
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;

  return 0;
}

/**
 * Returns a comparator function based on sort order and key.
 */
export function getComparator<T>(order: 'asc' | 'desc', orderBy: keyof T): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
