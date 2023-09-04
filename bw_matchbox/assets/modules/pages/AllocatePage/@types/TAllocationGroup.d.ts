type TLocalGroupId = number;
interface TAllocationGroup {
  localId: TLocalGroupId;
  name: string;
  items: TAllocationData[];
}
