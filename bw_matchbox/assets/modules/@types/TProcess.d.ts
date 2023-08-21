type TProcessId = number;
interface TProcess {
  database: string; // 'new1'
  id: TProcessId; // 5300
  location: string; // 'United States'
  name: string; // 'Proxy for Ethalfluralin'
  product?: string; // null
  unit: string; // 'USD'
  url: string; // '/process/5300'
}
