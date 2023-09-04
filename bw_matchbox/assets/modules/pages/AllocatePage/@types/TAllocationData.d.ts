type TCategory = string;
type TAllocationType = 'technosphere' | 'biosphere' | 'production';
type TAllocationId = number;

interface TAllocationRecord {
  categories: 'Unknown' | TCategory[]; // ['air']
  location: string; // 'GLO'
  name: string; // 'Clay-Williams'
  product: string; // 'LLC'
  unit: string; // 'kilogram'
}

interface TAllocationData {
  id: TAllocationId;
  type: TAllocationType; // 'technosphere'
  amount: number; // 0.06008158208572887
  input: TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
  output: TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
  inGroup?: TLocalGroupId; // Local data: input data is in group (should not be displayed in source data, but in group)
}
