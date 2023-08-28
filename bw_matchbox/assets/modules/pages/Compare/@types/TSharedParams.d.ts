type TMatchTypeId = string; // "3" number in string
type TMatchTypes = Record<TMatchTypeId, string>;
/* // Issue #52: match_types sample:
 * {
 *   '1': 'No direct match available',
 *   '2': 'Direct match with near-identical data',
 *   '3': 'Match with updated data',
 *   '4': 'Match with updated data and adding source transport',
 *   '5': 'Match with market and replace or remove transport',
 *   '6': 'Match with market and replace or remove transport and loss factor',
 *   '7': 'Equivalent datasets after modification',
 * }
 */

interface TSharedParams {
  comment: string; // comment'
  match_type_default: TMatchTypeId; // match_type_default3'
  match_types: TMatchTypes; // {1: 'No direct match available', 2: 'Direct match with near-identical data', 3: 'Match with updated data', 4: 'Match with updated data and adding source transport', 5: 'Match with market and replace or remove transport', 6: 'Match with market and replace or remove transport and loss factor', 7: 'Equivalent datasets after modification'}
  source_data: TDataRecord[]; // [...]
  source_id: number; // 201
  source_node_location: string; // source_node_locationUnited States'
  source_node_name: string; // source_node_nameSand, gravel, clay, phosphate, other nonmetallic minerals; at mine'
  source_node_unit: string; // source_node_unitUSD'
  source_node_url: string; // source_node_urlhttp://localhost:5000/process/201'
  target_data: TDataRecord[]; // []
  target_id: number; // 4874
  target_name: string; // target_nameEthalfluralin'
  target_node: TDataRecord; // {amount: 1, amount_display: '1.0', name: 'Ethalfluralin', unit: '', location: '', …}
  target_node_name: string; // target_node_nameEthalfluralin'
  target_node_url: string; // target_node_urlhttp://localhost:5000/process/4874'
}
