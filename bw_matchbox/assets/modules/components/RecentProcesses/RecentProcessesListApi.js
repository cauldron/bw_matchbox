// @ts-check

import { commonNotify } from '../../common/CommonNotify.js';

// Import types only...
/* eslint-disable no-unused-vars */
import { RecentProcessesListData } from './RecentProcessesListData.js';
import { RecentProcessesListLoader } from './RecentProcessesListLoader.js';
import { RecentProcessesListStates } from './RecentProcessesListStates.js';
import { RecentProcessesListNodes } from './RecentProcessesListNodes.js';
import { RecentProcessesListRender } from './RecentProcessesListRender.js';
/* eslint-enable no-unused-vars */

import { RecentProcessesListHelpers } from './RecentProcessesListHelpers.js';

/* External API (alternate way, basic handlers are in `handlers` object (above)...
 * @implements {TRecentProcessesListApi}
 */
export class RecentProcessesListApi {
  /** @type {RecentProcessesListData} */
  recentProcessesListData;
  /** @type {RecentProcessesListLoader} */
  recentProcessesListLoader;
  /** @type {RecentProcessesListStates} */
  recentProcessesListStates;
  /** @type {RecentProcessesListNodes} */
  recentProcessesListNodes;
  /** @type {RecentProcessesListRender} */
  recentProcessesListRender;

  /**
   * @param {object} params
   * @param {RecentProcessesListData} params.recentProcessesListData
   * @param {RecentProcessesListLoader} params.recentProcessesListLoader
   * @param {RecentProcessesListStates} params.recentProcessesListStates
   * @param {RecentProcessesListNodes} params.recentProcessesListNodes
   * @param {RecentProcessesListRender} params.recentProcessesListRender
   */
  constructor(params) {
    const {
      // prettier-ignore
      recentProcessesListData,
      recentProcessesListLoader,
      recentProcessesListStates,
      recentProcessesListNodes,
      recentProcessesListRender,
    } = params;
    this.recentProcessesListData = recentProcessesListData;
    this.recentProcessesListLoader = recentProcessesListLoader;
    this.recentProcessesListStates = recentProcessesListStates;
    this.recentProcessesListNodes = recentProcessesListNodes;
    this.recentProcessesListRender = recentProcessesListRender;
  }

  getRecentProcesses() {
    return this.recentProcessesListData.recentProcesses;
  }

  loadData() {
    RecentProcessesListStates.setLoading(true);
    RecentProcessesListLoader.loadRecentProcesses()
      .then((recentProcesses) => {
        this.recentProcessesListData.recentProcesses = recentProcesses;
        const hasData = !!recentProcesses.length;
        if (hasData) {
          return RecentProcessesListLoader.loadProcessesAttributes(recentProcesses);
        }
      })
      .then((/** @type {TProcessAttributes[] | undefined} */ processesAttributes) => {
        if (Array.isArray(processesAttributes) && processesAttributes.length) {
          // Update processes list with attributes (add names)...
          this.recentProcessesListData.recentProcesses =
            RecentProcessesListHelpers.extendRecentProcessesWithAttributes(
              this.recentProcessesListData.recentProcesses,
              processesAttributes,
            );
        }
        // TODO: Invoke events to re-render content?
        this.recentProcessesListRender.renderData();
        const hasData = !!this.recentProcessesListData.recentProcesses.length;
        RecentProcessesListStates.setHasData(hasData);
        RecentProcessesListStates.setError(undefined);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[RecentProcessesListApi:loadData]: error (catched)', {
          error,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        commonNotify.showError(error);
        RecentProcessesListStates.setError(error);
        RecentProcessesListStates.setHasData(false);
        // throw error;
      })
      .finally(() => {
        RecentProcessesListStates.setLoading(false);
      });
  }
}
