interface TSharedParams {
  // Data...
  biosphere: TAllocationData[];
  production: TAllocationData[];
  technosphere: TAllocationData[];
  // Current configuration parameters...
  rootNode?: HTMLElement;
  currentRole: TUserRole;
  currentUser: TUserName;
}
