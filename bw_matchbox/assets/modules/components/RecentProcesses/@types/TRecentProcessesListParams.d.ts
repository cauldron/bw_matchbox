/** Possible parameters for externally configuring of the component */
interface TRecentProcessesListParams {
  rootNode: Element;
  noTableau?: boolean; // Do not show tableau block
  noLoader?: boolean; // Do not show inner loader
  noError?: boolean; // Do not show inner error block
  noActions?: boolean; // Disable actions panel
}
