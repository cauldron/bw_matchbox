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


