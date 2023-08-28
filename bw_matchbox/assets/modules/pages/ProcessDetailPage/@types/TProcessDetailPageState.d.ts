class ProcessDetailPageState {
  isWaitlist: boolean;
  setLoading: (isLoading: boolean) => void;
  setWaitlist: (isWaitlist: boolean) => void;
  setError: (error: string | Error | string[] | Error[]) => void;
  clearError: () => void;
  currentUser: TUserName;
  currentRole: TUserRole;
  currentProcess?: TProcessId;
}
type TProcessDetailPageState = ProcessDetailPageState;
