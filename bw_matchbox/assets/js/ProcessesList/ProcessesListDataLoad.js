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
      /** Load next/current (?) data chunk
       * @param {object} [opts] - Options.
       * @param {boolean} [opts.update] - Update current data chunk.
       */
      loadData(_opts = true) {
        const { pageSize, processesApiUrl: urlBase } = ProcessesListConstants;
        const { currentPage, database, orderBy } = ProcessesListData;
        const offset = currentPage * pageSize; // TODO!
        const params = {
          database,
          order_by: orderBy,
          offset,
          limit: pageSize,
        };
        const urlQuery = CommonHelpers.makeQuery(params, { addQuestionSymbol: true });
        const url = urlBase + urlQuery;
        /* console.log('[ProcessesListDataLoad:loadData]: start', {
         *   url,
         *   params,
         *   urlQuery,
         *   urlBase,
         *   currentPage,
         *   pageSize,
         *   offset,
         *   orderBy,
         * });
         */
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
            /* console.log('[ProcessesListDataLoad:loadData]: start', {
             *   hasMoreData,
             *   currentRecords,
             *   totalRecords,
             *   loadedRecords,
             *   offset,
             *   url,
             *   params,
             *   urlQuery,
             *   urlBase,
             *   currentPage,
             *   pageSize,
             *   orderBy,
             *   json,
             * });
             */
            // Update total records number...
            ProcessesListData.totalRecords = totalRecords;
            // Append data to current table...
            // TODO: Use `opts.update` to update last data chunk.
            ProcessesListDataRender.renderTableData(data, { append: true });
            ProcessesListStates.setError(undefined); // Clear the error: all is ok
            ProcessesListStates.setHasData(ProcessesListData.hasData || hasData); // Update 'has data' flag
            ProcessesListStates.setHasMoreData(hasMoreData); // Update 'has more data' flag
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

      /** Load first portion of data to display */
      start() {
        this.loadData();
      },
    };

    // Provide module...
    provide(ProcessesListDataLoad);
  },
);
