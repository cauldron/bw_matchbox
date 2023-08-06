modules.define(
  'ProcessesListStates',
  [
    // Required modules...
    'ProcessesListConstants',
    'ProcessesListData',
    'ProcessesListDataRender',
    'ProcessesListNodes',
  ],
  function provide_ProcessesListStates(
    provide,
    // Resolved modules...
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListDataRender,
    ProcessesListNodes,
  ) {
    // Define module...

    /** @descr Control component's states
     */

    // global module variable
    // eslint-disable-next-line no-unused-vars
    const ProcessesListStates = {
      __id: 'ProcessesListStates',

      setLoading(isLoading) {
        // Set css class for id="processes-list-root" --> loading, set local status
        const rootNode = ProcessesListNodes.getRootNode();
        rootNode.classList.toggle('loading', isLoading);
        ProcessesListData.isLoading = isLoading;
      },

      setHasData(hasData) {
        // Set css class for root node, update local state
        const rootNode = ProcessesListNodes.getRootNode();
        rootNode.classList.toggle('empty', !hasData);
        ProcessesListData.hasData = hasData;
      },

      getAvailableRecordsContent(availableCount) {
        if (!availableCount || availableCount < 0) {
          return '';
        }
        const { pageSize } = ProcessesListConstants;
        const moreThanAPage = pageSize < availableCount;
        const text = [
          // prettier-ignore
          moreThanAPage && pageSize,
          `${availableCount} available`,
        ]
          .filter(Boolean)
          .join(' out of ');
        return ` (next ${text})`;
      },

      updateAvailableRecordsInfo(availableCount) {
        const node = document.getElementById('available-records-info');
        const content = this.getAvailableRecordsContent(availableCount);
        node.innerHTML = content;
      },

      setHasMoreData(hasMoreData) {
        // Set css class for root node, update local state
        const rootNode = ProcessesListNodes.getRootNode();
        rootNode.classList.toggle('has-more-data', hasMoreData);
        ProcessesListData.hasMoreData = hasMoreData;
      },

      /* // UNUSED: setError -- Shorthand for `setHasData`
       * setEmpty(isEmpty) {
       *   this.setHasData(false);
       * },
       */

      setError(error) {
        // TODO: Set css class for id="processes-list-root" --> error, update local state
        const isError = !!error;
        const rootNode = ProcessesListNodes.getRootNode();
        const errorNode = ProcessesListNodes.getErrorNode();
        rootNode.classList.toggle('error', isError);
        ProcessesListData.isError = isError;
        ProcessesListData.error = error;
        const errorText = error ? error.message || String(error) : '';
        // DEBUG: Show error in console
        if (errorText) {
          // eslint-disable-next-line no-console
          console.error('[ProcessesListStates:setError]: got the error', {
            error,
            errorText,
          });
          // eslint-disable-next-line no-debugger
          debugger;
        }
        // Update error block content...
        errorNode.innerHTML = errorText;
      },

      clearData() {
        this.setHasData(false);
        this.setHasMoreData(true);
        this.updateAvailableRecordsInfo(0);
        ProcessesListDataRender.clearTableData();
      },

      /** setOrderBy -- Set 'order by' parameter.
       * @param {'random' | 'name' | 'location' | 'product'} [orderBy]
       * @param {object} [opts]
       * @param {boolean} [opts.omitClearData] - Don't clear data.
       */
      setOrderBy(orderBy, opts = {}) {
        const { defaultOrderBy } = ProcessesListConstants;
        const rootNode = ProcessesListNodes.getRootNode();
        const prevClass = ['order', ProcessesListData.orderBy || defaultOrderBy]
          .filter(Boolean)
          .join('-');
        const nextClass = ['order', orderBy || defaultOrderBy].filter(Boolean).join('-');
        if (prevClass !== nextClass) {
          rootNode.classList.toggle(prevClass, false);
        }
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.orderBy = orderBy || defaultOrderBy;
        // Clear current data...
        if (!opts.omitClearData) {
          this.clearData();
        }
      },

      /** setFilterBy -- Set 'filter by' parameter.
       * @param {'matched' | 'unmatched' | 'waitlist'} [filterBy]
       * @param {object} [opts]
       * @param {boolean} [opts.omitClearData] - Don't clear data.
       */
      setFilterBy(filterBy, opts = {}) {
        const { defaultFilterBy } = ProcessesListConstants;
        const rootNode = ProcessesListNodes.getRootNode();
        const prevClass = ['filter', ProcessesListData.filterBy || defaultFilterBy]
          .filter(Boolean)
          .join('-');
        const nextClass = ['filter', filterBy || defaultFilterBy].filter(Boolean).join('-');
        if (prevClass !== nextClass) {
          rootNode.classList.toggle(prevClass, false);
        }
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.filterBy = filterBy || defaultFilterBy;
        // Clear current data...
        if (!opts.omitClearData) {
          this.clearData();
        }
      },

      /** updateDomOrderBy -- Update actual 'order by' dom node.
       * @param {'random' | 'name' | 'location' | 'product'} [orderBy]
       */
      updateDomOrderBy(orderBy) {
        const { defaultOrderBy } = ProcessesListConstants;
        const value = orderBy || defaultOrderBy;
        const elems = document.querySelectorAll('input[type="radio"][name="order_by"]');
        elems.forEach((elem) => (elem.checked = elem.value === value));
      },

      /** updateDomFilterBy -- Update actual 'filter by' dom node.
       * @param {'random' | 'name' | 'location' | 'product'} [filterBy]
       */
      updateDomFilterBy(filterBy) {
        const { defaultFilterBy } = ProcessesListConstants;
        const value = filterBy || defaultFilterBy;
        const elems = document.querySelectorAll('input[type="radio"][name="filter_by"]');
        elems.forEach((elem) => (elem.checked = elem.value === value));
      },

      /** updatePage -- Update all the page dynamic elements
       */
      updatePage() {
        const { updatePageHandlers } = ProcessesListData;
        // Call all the registered update handlers...
        updatePageHandlers.forEach((handler) => {
          try {
            if (handler) {
              handler();
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[ProcessesListStates:updatePage]: error (catched)', {
              error,
              handler,
            });
            // eslint-disable-next-line no-debugger
            debugger;
          }
        });
      },

      start() {
        // Update parameters...
        this.updateDomOrderBy();
        this.updateDomFilterBy();
        this.setOrderBy();
        this.setFilterBy();
        // TODO: Update correspond dom radio groups?
      },
    };

    // Provide module...
    provide(ProcessesListStates);
  },
);
