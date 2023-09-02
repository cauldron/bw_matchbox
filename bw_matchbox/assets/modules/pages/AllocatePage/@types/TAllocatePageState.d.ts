class TAllocatePageStateParams {
  // Data...
  biosphere: TAllocationItem[];
  production: TAllocationItem[];
  technosphere: TAllocationItem[];
  // Current configuration parameters...
  currentRole: TUserRole;
  currentUser: TUserName;
  // Modules...
  nodes: AllocatePageNodes;
}

class AllocatePageState implements TAllocatePageStateParams {
  /* // Properties come from `TAllocatePageStateParams`...
   * // Data...
   * biosphere: TAllocationItem[];
   * production: TAllocationItem[];
   * technosphere: TAllocationItem[];
   * // Current configuration parameters...
   * currentRole: TUserRole;
   * currentUser: TUserName;
   * // Modules...
   * nodes: AllocatePageNodes;
   */

  // Interface...
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | Error | string[] | Error[]) => void;
  clearError: () => void;
}
type TAllocatePageState = AllocatePageState;
