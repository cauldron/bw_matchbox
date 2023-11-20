interface TRecentProcess {
  id: number;
  name: string; // TODO: Is it neccessary to store name? Can we get name by id without extra requests on the frontend side?
  timestamp: number;
}
type TRecentProcesses = TRecentProcess[];
