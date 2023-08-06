modules.define(
  'ProcessesListDataLoad',
  [
    // Required modules...
    'CommonHelpers',
    'ProcessesListConstants',
    'ProcessesListData',
    'ProcessesListStates',
    'ProcessesListDataRender',
  ],
  function provide_ProcessesListDataLoad(
    provide,
    // Resolved modules...
    CommonHelpers,
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListStates,
    ProcessesListDataRender,
  ) {
    // Define module...

    /** @descr Dynamic data loading support
     */

    // global module variable
    // eslint-disable-next-line no-unused-vars
    const ProcessesListDataLoad = {
      __id: 'ProcessesListDataLoad',

      /** Load next/current (?) data chunk
       * @param {object} [opts] - Options.
       * @param {boolean} [opts.update] - Update current data chunk.
       */
      loadData(/* opts = {} */) {
        const { currentPage, orderBy, filterBy, userDb, searchValue, sharedParams, hasSearch } =
          ProcessesListData;
        const { databases, database } = sharedParams;
        const {
          pageSize,
          processesApiUrl: urlBase,
          useDebug,
          defaultOrderBy,
          defaultFilterBy,
        } = ProcessesListConstants;
        const userDbValue = databases[userDb]; // Could it be empty? Eg, to use: `|| database`
        const offset = currentPage * pageSize; // TODO!
        const params = {
          search: searchValue, // TODO: Should the `order_by` parameter be disabled if the `search` parameter has used?
          database: userDbValue, // useDebug ? database : userDb || defaultUserDb,
          order_by: !hasSearch && orderBy !== defaultOrderBy ? orderBy : '',
          filter: filterBy !== defaultFilterBy ? filterBy : '',
          offset,
          limit: pageSize,
        };
        const urlQuery = CommonHelpers.makeQuery(params, { addQuestionSymbol: true });
        const url = urlBase + urlQuery;
        // DEBUG: Using temporarily while working with requests (issues #41, #45, etc)...
        console.log('[ProcessesListDataLoad:loadData]: start', {
          searchValue,
          databases,
          userDbValue,
          useDebug,
          userDb,
          database,
          url,
          params,
          urlQuery,
          urlBase,
          currentPage,
          pageSize,
          offset,
          orderBy,
          filterBy,
        });
        ProcessesListStates.setLoading(true);
        fetch(url)
          .then((res) => {
            const { ok, status, statusText } = res;
            if (!ok) {
              // Something went wrong?
              const reason =
                [statusText, status && 'status: ' + status].filter(Boolean).join(', ') ||
                'Unknown error';
              const error = new Error('Data loading error: ' + reason);
              // eslint-disable-next-line no-console
              console.error('[ProcessesListDataLoad:loadData]: error (on then)', {
                reason,
                res,
                url,
                params,
                urlQuery,
                urlBase,
              });
              // eslint-disable-next-line no-debugger
              debugger;
              throw error;
            }
            // All is ok...
            return res.json();
          })
          .then((json) => {
            const { data, total_records: totalRecords } = json;
            const hasData = Array.isArray(data) && !!data.length;
            const loadedRecords = hasData ? data.length : 0;
            const currentRecords = offset + loadedRecords;
            const hasMoreData = hasData && currentRecords < totalRecords;
            const availableCount = hasMoreData ? totalRecords - currentRecords : 0;
            /* console.log('[ProcessesListDataLoad:loadData]: success', {
             *   availableCount,
             *   totalRecords,
             *   hasData,
             *   loadedRecords,
             *   currentRecords,
             *   hasMoreData,
             *   data,
             * });
             */
            // Update total records number...
            // ProcessesListData.totalRecords = totalRecords;
            ProcessesListStates.setTotalRecordsCount(totalRecords);
            // Append data to current table...
            // TODO: Use `opts.update` to update (replace rows) last loaded data set.
            ProcessesListDataRender.renderTableData(data, { append: true });
            ProcessesListStates.setError(undefined); // Clear the error: all is ok
            ProcessesListStates.setHasData(ProcessesListData.hasData || hasData); // Update 'has data' flag
            ProcessesListStates.setHasMoreData(hasMoreData); // Update 'has more data' flag
            ProcessesListStates.updateAvailableRecordsInfo(availableCount);
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('[ProcessesListDataLoad:loadData]: error (catched)', {
              error,
              url,
              params,
              urlQuery,
              urlBase,
            });
            // eslint-disable-next-line no-debugger
            debugger;
            // Store & display error...
            ProcessesListStates.setError(error);
          })
          .finally(() => {
            ProcessesListStates.setLoading(false);
            // Update all the page dynamic elements?
            ProcessesListStates.updatePage();
          });
      },
    };

    // Provide module...
    provide(ProcessesListDataLoad);
  },
);
