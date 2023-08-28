/** Data item for compare page */
interface TDataRecord {
  amount: number; // 7.135225509515751e-9
  amount_display: string; // "7.1e-09"
  input_id: number; // 633
  location: string; // "United States"
  name: string; // "Clothing; at manufacturer"
  row_id: string; // "0" (auto increment primary key; initilizes dynamically on the client from the first iteration)
  unit: string; // ""
  url: string; // "/process/633"
  collapsed: boolean; // true
  'collapsed-group': string; // "Collapsed-XXX-YYYYYY" -- unique key to locate corresponding pair.
  matched?: boolean;
}
