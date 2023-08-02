/* global
    commonHelpers,
    ProcessesListConstants,
    ProcessesListData,
    ProcessesListStates,
    ProcessesListDataRender,
*/

/** @descr Dynamic data loading support
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const ProcessesListDataLoad = {
  /** Load next/current (?) data chunk */
  loadData() {
    const { pageSize, processesApiUrl: urlBase } = ProcessesListConstants;
    const { currentPage, database, orderBy } = ProcessesListData;
    const offset = currentPage * pageSize; // TODO!
    const params = {
      database,
      order_by: orderBy,
      offset,
      limit: pageSize,
    };
    const urlQuery = commonHelpers.makeQuery(params, { addQuestionSymbol: true });
    const url = urlBase + urlQuery;
    console.log('[ProcessesListDataLoad:loadData]: start', {
      url,
      params,
      urlQuery,
      urlBase,
      currentPage,
      pageSize,
      offset,
      orderBy,
    });
    ProcessesListStates.setLoading(true);
    fetch(url)
      .then((res) => {
        const { ok, status, statusText } = res;
        if (!ok) {
          // Something went wrong?
          const reason = [statusText, status && 'status: ' + status].filter(Boolean).join(', ');
          const error = new Error('Data loading error:' + reason);
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
      .then((result) => {
        const { data, total_records: totalRecords } = result;
        const hasData = Array.isArray(data) && !!data.length;
        console.log('[ProcessesListDataLoad:loadData]: done', {
          data,
          totalRecords,
          result,
          url,
          params,
          urlQuery,
          urlBase,
        });
        // Update total records number...
        ProcessesListData.totalRecords = totalRecords;
        // Append data to current table...
        ProcessesListDataRender.renderTableData(data, { append: true });
        ProcessesListStates.setError(undefined); // Clear the error: all is ok
        ProcessesListStates.setHasData(ProcessesListData.hasData || hasData); // Update 'has data' flag
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
