class ProcessDetailPageState {
  isWaitlist: boolean;
  setLoading: (isLoading: boolean) => void;
  setWaitlist: (isWaitlist: boolean) => void;
  setError: (error: string | Error | string[] | Error[]) => void;
  clearError: () => void;
}
type TProcessDetailPageState = ProcessDetailPageState;
