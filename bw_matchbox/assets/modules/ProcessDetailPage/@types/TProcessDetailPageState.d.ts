class ProcessDetailPageState {
  isWaitlist: boolean;
  setLoading: (isLoading: boolean) => void;
  setWaitlist: (isWaitlist: boolean) => void;
  setError: (error: string | Error | string[] | Error[]) => void;
  clearError: () => void;
  currentUser: string;
  currentRole: string;
}
type TProcessDetailPageState = ProcessDetailPageState;
