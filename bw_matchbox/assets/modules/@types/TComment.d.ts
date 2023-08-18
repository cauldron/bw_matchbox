type TCommentId = number;
type TThreadId = number;
interface TComment {
  id: TCommentId; // 2
  position: number; // 1
  thread: number; // 1
  user: string; // 'Puccio Bernini'
  content: string; // '...'
}
interface TThread {
  id: TThreadId; // 1
  created: TGmtDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
  modified: TGmtDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
  name: string; // 'Возмутиться кпсс гул'
  reporter: string; // '阿部 篤司'
  resolved: boolean; // false
  process: TProcess;
}
type TThreadsHash = Record<TTreadId, TThread>;
type TCommentsHash = Record<TTreadId, TComment>;
type TCommentsByThreads = Record<TTreadId, TCommentId[]>;
