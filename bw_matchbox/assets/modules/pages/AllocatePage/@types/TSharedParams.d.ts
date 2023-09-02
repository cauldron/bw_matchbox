type TCategory = string;
// type TUserRole = string;
// type TUserName = string;

interface TAllocationItem {
  categories: 'Unknown' | TCategory[];
  location: string;
  name: string;
  product: string;
  unit: string;
}

interface TSharedParams {
  // Data...
  biosphere: TAllocationItem[];
  production: TAllocationItem[];
  technosphere: TAllocationItem[];
  // Current configuration parameters...
  currentRole: TUserRole;
  currentUser: TUserName;
}
