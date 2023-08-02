/* global
    commonHelpers,
    ProcessesListNodes,
*/

/** @descr Render table content.
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesListDataRender = {
  clearTableData() {
    const tBodyNode = ProcessesListNodes.getTBodyNode();
    tBodyNode.replaceChildren();
  },

  renderDataRow(rowData) {
    const {
      id, // 726 (required!)
      name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
      location, // 'United States'
      unit, // ''
      // details_url, // '/process/726'
      // match_url, // '/match/726'
      matched, // false
    } = rowData;
    /* console.log('[ProcessesListDataRender:renderDataRow]: start', {
     *   details_url, // '/process/726'
     *   id, // 726
     *   location, // 'United States'
     *   match_url, // '/match/726'
     *   matched, // false
     *   name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     *   unit, // ''
     *   rowData,
     * });
     */
    const matchUrl = '/match/' + id;
    const matchButton = matched
      ? `<a class="button" href="${matchUrl || ''}"><i class="fa-solid fa-check"></i> EDIT</a>`
      : `<a class="button button-primary" href="${
          matchUrl || ''
        }"><i class="fa-solid fa-circle-xmark"></i> ADD</a>`;
    const content = `
      <tr>
        <td><a href="/process/${id || ''}">${name || ''}</a></td>
        <td>${location || ''}</td>
        <td>${unit || ''}</td>
        <td>${matchButton || ''}</td>
      </tr>
    `;
    /* // Original server-side template code:
      <tr>
        <td><a href="{{ url_for('process_detail', id=row.id) }}">{{row.name}}</a></td>
        <td>{{row.location}}</td>
        <td>{{row.unit}}</td>
        <td>
          {% if row.matched %}
            <a class="button" href="{{ url_for("match", source=row.id)}}"><i class="fa-solid fa-check"></i> EDIT</a>
          {% else %}
            <a class="button button-primary" href="{{ url_for("match", source=row.id)}}"><i class="fa-solid fa-circle-xmark"></i> ADD</a>
          {% endif %}
        </td>
      </tr>
    */
    /* console.log('[ProcessesListDataRender:renderDataRow]: result', {
     *   content,
     *   matchUrl,
     *   matchButton,
     *   details_url, // '/process/726'
     *   id, // 726
     *   location, // 'United States'
     *   match_url, // '/match/726'
     *   matched, // false
     *   name, // 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     *   unit, // ''
     *   rowData,
     * });
     */
    return content;
  },

  /** renderTableData -- Display new data rows at the end of the table.
   * @param {<TProcessItem[]>} rows
   * @param {object} [opts] - Options
   * @param {boolean} [opts.append] - Append data to the end of the table (default behavior: replace)
   */
  renderTableData(rows, opts = {}) {
    const tBodyNode = ProcessesListNodes.getTBodyNode();
    /* Data item sample:
     * - details_url: '/process/726'
     * - id: 726
     * - location: 'United States'
     * - match_url: '/match/726'
     * - matched: false
     * - name: 'Electronic capacitors, resistors, coils, transformers, connectors and other components (except  semiconductors and printed circuit assemblies); at manufacturer'
     * - unit: ''
     */
    const rowsContent = rows.map(this.renderDataRow.bind(this));
    const rowsNodes = commonHelpers.htmlToElements(rowsContent);
    if (opts.append) {
      // Append new data (will be used for incremental update)...
      tBodyNode.append.apply(tBodyNode, rowsNodes);
    } else {
      // Replace data...
      tBodyNode.replaceChildren.apply(tBodyNode, rowsNodes);
    }
  },
};
