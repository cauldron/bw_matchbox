modules.define(
  'CompareProxyDialogModal',
  [
    // Required modules...
    'CommonModal',
  ],
  function provide_CompareProxyDialogModal(
    provide,
    // Resolved modules...
    CommonModal,
  ) {
    // Define module...
    const CompareProxyDialogModal = {
      // External data...
      sharedData: undefined, // Initializing in `CompareCore.start` from `bw_matchbox/assets/templates/compare.html`

      // Counter for making unique records (see `replaceWithTargetHandler`)
      targetNodesCounter: 0,

      // Match type...
      selectedMatchType: undefined,

      // Methods...

      getTargetProxyName() {
        const { target_name } = this.sharedData;
        const name =
          'Proxy for ' +
          target_name
            .replace('Market group for ', '')
            .replace('market group for ', '')
            .replace('Market for ', '')
            .replace('market for ', '')
            .trim();
        return name;
      },

      createOneToOneProxyFunc(event) {
        event.preventDefault();

        const submissionData = {
          exchanges: [{ input_id: this.sharedData.target_id, amount: 1.0 }],
          source: this.sharedData.source_id,
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
        const { match_type_default } = this.sharedData;
        return selectedMatchType === undefined ? match_type_default : selectedMatchType;
      },

      /** renderProxyModalContent -- Generate proxy modal content
       * @return {string}
       */
      renderProxyModalContent() {
        const { source_node_unit, source_node_location, target_data, match_types, comment } = this.sharedData;
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

        const rows = target_data.map(function (item, _index) {
          return `
              <tr input_id=${item.input_id}>
                <td><div>${item.name}</div></td>
                <td><div>${item.amount_display}</div></td>
                <td><div><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></div></td>
              </tr>
          `;
        });

        const end = `
              </tbody>
            </table>
          </form>
        `;

        const content = begin + rows.join('') + end;

        return content;
      },

      onSubmitButtonClick(event) {
        event.preventDefault();
        const { target_data, source_id } = this.sharedData;
        const match_type = this.getSelectedMatchType(); // document.getElementById('match-type-select').value;
        const comment = document.getElementById('proxy-comment').value;
        const name = document.getElementById('proxy-name').value;
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

      onMatchTypeSelectChange(event) {
        const { target } = event;
        const { value } = target;
        this.selectedMatchType = value;
      },

      openProxyDialogModal(event) {
        event.preventDefault();

        const content = this.renderProxyModalContent();

        const title = 'Proxy name';

        CommonModal.setModalContentId('proxy-dialog-modal')
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
      },
    };

    // Provide module...
    provide(CompareProxyDialogModal);
  },
);
