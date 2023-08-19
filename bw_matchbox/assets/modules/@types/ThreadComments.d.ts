
interface TThreadCommentsParams {
  rootNode: Element;
  currentUser: string;
  role: string;
}

interface TThreadCommentsApi {
  getComments: () => TComment[];
  getThreads: () => TThread[];
  getCommentsHash: () => Record<TThreadId, TComment>;
  getThreadsHash: () => Record<TThreadId, TThread>;
  getCommentsByThreads: () => Record<TThreadId, TCommentId[]>;
  getUsers: () => TUserName[];
  getProcessIds: () => TProcessId[];
  getProcessesHash: () => Record<TProcessId, TProcess>;
  updateVisibleThreads: () => void;
  setFilterByUsers: (users: TUserName[]) => void;
  setFilterByProcesses: (processs: TProcessName[]) => void;
}

// Public interface
interface TThreadComments {
  handlers: TSharedHandlers;
  /** Public api methods */
  api: TThreadCommentsApi;
  events: TEvents;
  setParams: (params: TParams) => void;
  preInit: () => void;
  ensureInit: () => Promise;
}
