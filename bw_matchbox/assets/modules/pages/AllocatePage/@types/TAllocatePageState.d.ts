interface TAllocatePageStateParams {
  // Groups...
  groups?: TAllocationGroup[];
  // Data...
  biosphere: TAllocationData[];
  production: TAllocationData[];
  technosphere: TAllocationData[];
  // Current configuration parameters...
  processId: TProductId;
  currentRole: TUserRole;
  currentUser: TUserName;
  // Modules...
  nodes: AllocatePageNodes;
}
