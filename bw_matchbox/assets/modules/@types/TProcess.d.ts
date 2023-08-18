type TProcessId = string;
interface TProcess {
  database: TProcessId; // 'new1'
  id: number; // 5300
  location: string; // 'United States'
  name: string; // 'Proxy for Ethalfluralin'
  product?: string; // null
  unit: string; // 'USD'
  url: string; // '/process/5300'
}
