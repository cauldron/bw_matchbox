// Public and shared  interfaces for `ThreadComments`

/** Possible parameters for externally configuring of the component */
interface TThreadCommentsParams {
  rootNode: Element;
  currentProcess?: number;
  currentUser: string;
  role: string;
  noTableau?: boolean; // Do not show tableau block
  noLoader?: boolean; // Do not show inner loader
  noError?: boolean; // Do not show inner error block
  noActions?: boolean; // Disable actions panel
  disableAddNewThread?: boolean; // Disable ability to add new thread
  disableAddThreadComment?: boolean; // Disable ability to add new comment
  disableThreadResolve?: boolean; // Disable ability to resolve/resolve(open) the thread
  disableResolveByNonReporters?: boolean; // Resolve/open function allowed only for thread reporter
  hideDisabledTitleActions?: boolean; // Don't display disabled thread title actions
}

interface TThreadCommentsSetFilterOpts {
  omitUpdate?: boolean;
}

type TThreadCommentsFilterByState = 'none' | 'resolved' | 'open';
type TThreadCommentsSortMode = 'resolved' | 'name' | 'modifiedDate';
type TThreadCommentsSortModes = TThreadCommentsSortMode[];
type TThreadCommentsSortThreadsBy = TThreadCommentsSortMode | TThreadCommentsSortModes;

interface TThreadCommentsViewParams {
  sortThreadsBy: TThreadCommentsSortThreadsBy;
  sortThreadsReversed: boolean;
  filterByState: TThreadCommentsFilterByState;
  filterByUsers: TUserName[];
  filterByProcesses: TProcessId[];
  filterByMyThreads: boolean;
}

interface TThreadCommentsLoadParams {
  user?: string; // str. Username to filter by
  process?: number; // int. Proxy process ID
  resolved?: string; // str, either "0" or "1". Whether comment thread is resolved or not
  thread?: number; // int. Comment thread id
}

interface TThreadCommentsApi {
  // threadCommentsData: ThreadCommentsData;
  // threadCommentsHandlers: ThreadCommentsHandlers;
  // threadCommentsStates: ThreadCommentsStates;
  // threadCommentsRender: ThreadCommentsRender;

  getComments: () => TComment[];
  getThreads: () => TThread[];
  getCommentsHash: () => Record<TThreadId, TComment>;
  getThreadsHash: () => Record<TThreadId, TThread>;
  getCommentsByThreads: () => Record<TThreadId, TCommentId[]>;
  getUsers: () => TUserName[];
  getProcessIds: () => TProcessId[];
  getProcessesHash: () => Record<TProcessId, TProcess>;
  updateVisibleThreads: () => void;
  setFilterByUsers: (users: TUserName[], opts?: TThreadCommentsSetFilterOpts) => void;
  setFilterByProcesses: (processes: number[], opts?: TThreadCommentsSetFilterOpts) => void;
  setFilterByState: (
    state: TThreadCommentsFilterByState,
    opts?: TThreadCommentsSetFilterOpts,
  ) => void;
  setSortThreadsBy: (
    value: TThreadCommentsSortThreadsBy,
    opts?: TThreadCommentsSetFilterOpts,
  ) => void;
  setSortThreadsReversed: (value: boolean, opts?: TThreadCommentsSetFilterOpts) => void;
  setFilterByMyThreads: (value: boolean, opts?: TThreadCommentsSetFilterOpts) => void;
  resetFilters: () => void;
  expandAllThreads: () => void;
  getDefaultViewParams: () => TThreadCommentsViewParams;
}

// Public interface
interface TThreadComments {
  handlers: TSharedHandlers;
  /** Public api methods */
  api: TThreadCommentsApi;
  events: TEvents;
  setParams: (params: TParams) => void;
  // setViewParams: (TThreadCommentsViewParams: viewParams) => void; // It's in the handlers now
  preInit: () => void;
  ensureInit: () => Promise;
  threadCommentsRender: ThreadCommentsRender;
}
