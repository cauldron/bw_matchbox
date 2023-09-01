// @ts-check

import { commonModal } from '../../common/CommonModal.js';

export const CompareProxyDialogModal = {
  /** External data...
   * @type {TSharedParams}
   */
  sharedParams: undefined, // Initializing in `CompareCore.start` from `compare.html`

  // Counter for making unique records (see `replaceWithTargetHandler`)
  targetNodesCounter: 0,

  // Match type...
  selectedMatchType: undefined,

  // Methods...

  getTargetProxyName() {
    const { target_name } = this.sharedParams;
    const name = 'Proxy for ' + target_name.replace(/^market .*?for /i, '').trim();
    return name;
  },

  /**
   * @param {{ preventDefault: () => void; }} event
   */
  createOneToOneProxyFunc(event) {
    event.preventDefault();

    const submissionData = {
      exchanges: [{ input_id: this.sharedParams.target_id, amount: 1.0 }],
      source: this.sharedParams.source_id,
      comment: 'One-to-one proxy',
      name: this.getTargetProxyName(),
      match_type: '2',
    };
    const url = '/create-proxy/';
    fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    }).then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    });
  },

  getSelectedMatchType() {
    const { selectedMatchType } = this;
    const { match_type_default } = this.sharedParams;
    return selectedMatchType === undefined ? match_type_default : selectedMatchType;
  },

  /** renderProxyModalContent -- Generate proxy modal content
   * @return {string}
   */
  renderProxyModalContent() {
    const { source_node_unit, source_node_location, target_data, match_types, comment } =
      this.sharedParams;
    const selectedMatchType = this.getSelectedMatchType();

    const name = this.getTargetProxyName();

    const matchModalItems = Object.entries(match_types).map(([id, text]) => {
      const isSelected = id === selectedMatchType;
      return `<option value="${id}"${isSelected ? ' selected' : ''}>${text}</option>`;
    });
    const matchModalSelect = `
          <select id="match-type-select">
            ${matchModalItems.join('\n')}
          </select>
        `;

    const begin = `
          <form>
            <input class="u-full-width" type="text" id="proxy-name" name="proxy-name" value="${name}">
            <label for="proxy-comment">Comment</label>
            <textarea class="u-full-width" id="proxy-comment" name="proxy-comment">${comment}</textarea>
            <p><button class="button-primary" id="create-proxy-submit-button">Create Proxy Process</button>
            ${matchModalSelect}
            Unit: ${source_node_unit}
            | Location: ${source_node_location}</p>
            <table id="proxy-table" class="fixed-table" width="100%">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
        `;

    const rows = target_data.map(
      (/** @type {TDataRecord} */ item, /** @type {number} */ _index) => {
        return `
              <tr input_id=${item.input_id}>
                <td><div>${item.name}</div></td>
                <td><div>${item.amount_display}</div></td>
                <td><div><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></div></td>
              </tr>
          `;
      },
    );

    const end = `
              </tbody>
            </table>
          </form>
        `;

    const content = begin + rows.join('') + end;

    return content;
  },

  /**
   * @param {MouseEvent} event
   */
  onSubmitButtonClick(event) {
    event.preventDefault();
    const { target_data, source_id } = this.sharedParams;
    const match_type = this.getSelectedMatchType(); // document.getElementById('match-type-select').value;
    const comment = /** @type {HTMLInputElement} */ (document.getElementById('proxy-comment'))
      .value;
    const name = /** @type {HTMLInputElement} */ (document.getElementById('proxy-name')).value;
    const submissionData = {
      exchanges: target_data,
      source: source_id,
      match_type,
      comment,
      name,
    };
    const url = '/create-proxy/';
    fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    }).then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    });
  },

  /**
   * @param {Event} event
   */
  onMatchTypeSelectChange(event) {
    const target = /** @type {HTMLSelectElement} */ (event.target);
    const { value } = target;
    this.selectedMatchType = value;
  },

  /**
   * @param {MouseEvent} event
   */
  openProxyDialogModal(event) {
    event.preventDefault();

    const content = this.renderProxyModalContent();

    const title = 'Proxy name';

    commonModal.ensureInit().then(() => {
      commonModal
        .setModalContentId('proxy-dialog-modal')
        .setTitle(title)
        .setModalContentOptions({
          scrollable: true,
          padded: true,
        })
        .setContent(content)
        .showModal();

      const submit = document.getElementById('create-proxy-submit-button');
      submit.addEventListener('click', this.onSubmitButtonClick.bind(this));

      const matchTypeSelect = document.getElementById('match-type-select');
      matchTypeSelect.addEventListener('change', this.onMatchTypeSelectChange.bind(this));
    });
  },
};
