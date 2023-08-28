// Compare rows-related feature types (ts-like):
type TRowKind = 'source' | 'target';
type TRowEl = HTMLTableRowElement;
type TRowId = string;
interface TSelectedRow {
  rowKind: TRowKind;
  // TODO: It will be impossible to use elements for paginated tables
  // (because the nodes for the same elements could be different).
  rowEl: TRowEl;
  rowId: TRowId;
}
interface TCollapsedRow extends TSelectedRow {
  pairId: TRowId;
}
