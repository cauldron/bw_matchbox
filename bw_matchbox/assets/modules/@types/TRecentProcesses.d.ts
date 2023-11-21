interface TRecentProcess {
  id: number;
  // NOTE: The name shouldn't be stored in cookie. We can get it from server with `loadProcessesAttributes`.
  name?: string;
  time: number;
}
type TRecentProcesses = TRecentProcess[];
