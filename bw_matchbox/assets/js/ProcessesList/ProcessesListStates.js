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

      setHasSearch(hasSearch) {
        // Set css class for root node, update local state
        const rootNode = ProcessesListNodes.getRootNode();
        rootNode.classList.toggle('has-search', hasSearch);
        ProcessesListData.hasSearch = hasSearch;
      },

      setTotalRecordsCount(totalRecords) {
        ProcessesListData.totalRecords = totalRecords;
        // Set css class for root node, update local state
        const rootNode = ProcessesListNodes.getRootNode();
        const elems = rootNode.querySelectorAll('#total-records-number');
        elems.forEach((node) => {
          node.innerHTML = String(totalRecords);
        });
      },

      // setError -- Shorthand for `setHasData`
      setEmpty(isEmpty) {
        this.setHasData(!isEmpty);
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
        const value = orderBy || defaultOrderBy;
        const nextClass = ['order', value].filter(Boolean).join('-');
        if (prevClass !== nextClass) {
          rootNode.classList.toggle(prevClass, false);
        }
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.orderBy = value;
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
        const value = filterBy || defaultFilterBy;
        const nextClass = ['filter', value].filter(Boolean).join('-');
        if (prevClass !== nextClass) {
          rootNode.classList.toggle(prevClass, false);
        }
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.filterBy = value;
        // Clear current data...
        if (!opts.omitClearData) {
          this.clearData();
        }
      },

      /** setUserDb -- Set 'userDb' parameter.
       * @param {'matched' | 'unmatched' | 'waitlist'} [userDb]
       * @param {object} [opts]
       * @param {boolean} [opts.omitClearData] - Don't clear data.
       */
      setUserDb(userDb, opts = {}) {
        const { defaultUserDb } = ProcessesListConstants;
        const rootNode = ProcessesListNodes.getRootNode();
        const prevClass = ['filter', ProcessesListData.userDb || defaultUserDb]
          .filter(Boolean)
          .join('-');
        const value = userDb || defaultUserDb;
        const nextClass = ['filter', value].filter(Boolean).join('-');
        if (prevClass !== nextClass) {
          rootNode.classList.toggle(prevClass, false);
        }
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.userDb = value;
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

      /** updateDomUserDb -- Update actual 'userDb' dom node.
       * @param {'random' | 'name' | 'location' | 'product'} [userDb]
       */
      updateDomUserDb(userDb) {
        const { defaultUserDb } = ProcessesListConstants;
        const value = userDb || defaultUserDb;
        const elems = document.querySelectorAll('input[type="radio"][name="user-db"]');
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

      /* initUserDbData -- Initialize proxy db option
       */
      initUserDbData() {
        const { sharedParams } = ProcessesListData;
        const { databases } = sharedParams;
        if (!databases.proxy) {
          const proxyDbOption = document.getElementById('user-db-proxy');
          proxyDbOption.setAttribute('disabled', true);
          const proxyDbOptionParent = proxyDbOption.parentNode;
          proxyDbOptionParent.classList.toggle('radio-group-item-disabled', true);
        }
      },

      start() {
        // Update all the dynamic parameters...
        // Order by selector...
        this.updateDomOrderBy(undefined);
        this.setOrderBy(undefined, { omitClearData: true });
        // Filter by selector...
        this.updateDomFilterBy(undefined);
        this.setFilterBy(undefined, { omitClearData: true });
        // Database selector...
        this.updateDomUserDb(undefined);
        this.setUserDb(undefined, { omitClearData: true });
        // Initialize proxy db option
        this.initUserDbData();
      },
    };

    // Provide module...
    provide(ProcessesListStates);
  },
);
