modules.define(
  'ProcessesListStates',
  [
    // Required modules...
    'ProcessesListData',
    'ProcessesListDataRender',
    'ProcessesListNodes',
  ],
  function provide_ProcessesListStates(
    provide,
    // Resolved modules...
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
        ProcessesListDataRender.clearTableData();
      },

      setOrderBy(orderBy) {
        const rootNode = ProcessesListNodes.getRootNode();
        const prevClass = ['order', ProcessesListData.orderBy || 'random']
          .filter(Boolean)
          .join('-');
        const nextClass = ['order', orderBy || 'random'].filter(Boolean).join('-');
        rootNode.classList.toggle(prevClass, false);
        rootNode.classList.toggle(nextClass, true);
        ProcessesListData.orderBy = orderBy;
        // Clear current dataod...
        this.clearData();
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
    };

    // Provide module...
    provide(ProcessesListStates);
  },
);
