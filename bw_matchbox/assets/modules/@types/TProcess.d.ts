type TProcessId = number;
interface TProcess {
  id: TProcessId; // 5300
  details_url: string; // '/process/149'
  location: string; // 'United States'
  match_type: string; // 'Unknown'
  match_url: string; // '/match/149'
  matched: boolean; // false
  name: string; // 'Printed circuit and electronic assembly; at manufacturer'
  product?: string; // null
  proxy_url?: string; // null
  unit: string; // 'USD'
  waitlist: boolean; // false
  // Issue #156: Unallocated properties...
  allocated?: boolean; // ??? -- Can't see it in the server data (in the method `processes` of `webapp.py`)
  allocate_url?: string; // 'allocate/149'
}
