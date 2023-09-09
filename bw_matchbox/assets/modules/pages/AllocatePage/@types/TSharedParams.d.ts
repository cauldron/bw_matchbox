interface TSharedParams {
  // Data...
  biosphere: TAllocationData[];
  production: TAllocationData[];
  technosphere: TAllocationData[];
  // Current configuration parameters...
  rootNode?: HTMLElement;
  processId: TProcessId;
  currentRole: TUserRole;
  currentUser: TUserName;
}
