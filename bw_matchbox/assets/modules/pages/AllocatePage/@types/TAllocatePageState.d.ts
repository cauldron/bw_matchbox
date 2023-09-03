class TAllocatePageStateParams {
  // Groups...
  groups?: TAllocationGroup[];
  // Data...
  biosphere: TAllocationData[];
  production: TAllocationData[];
  technosphere: TAllocationData[];
  // Current configuration parameters...
  currentRole: TUserRole;
  currentUser: TUserName;
  // Modules...
  nodes: AllocatePageNodes;
}

class AllocatePageState /* implements TAllocatePageStateParams */ {
  // Properties come from `TAllocatePageStateParams`...

  // Source data...
  biosphere: TAllocationData[];
  production: TAllocationData[];
  technosphere: TAllocationData[];

  // Allocated groups...
  groups: TAllocationGroup[];
  newGroupsCount: number;

  // Current configuration parameters...
  currentRole: TUserRole;
  currentUser: TUserName;

  // Modules...
  nodes: AllocatePageNodes;

  // Interface...
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | Error | string[] | Error[]) => void;
  clearError: () => void;

  // Data methods...

  addNewGroup: (group: TAllocationGroup) => void;
}
type TAllocatePageState = AllocatePageState;
