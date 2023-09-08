interface TAllocationResultGroup {
  name: string;
  technosphere: TAllocationId[];
  biosphere: TAllocationId[];
}
interface TAllocationResultAllocationGroup {
  name: string;
  factor: number;
}
interface TAllocationResultAllocation {
  product: TAllocationId; // production[].id
  groups: TAllocationResultAllocationGroup[];
}
interface TAllocationResult {
  process: TProcessId;
  groups: TAllocationResultGroup[];
  allocation: TAllocationResultAllocation[];
}
