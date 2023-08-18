interface TComment {
  id: number; // 2
  position: number; // 1
  thread: number; // 1
  user: string; // 'Puccio Bernini'
  content: string; // '...'
}
interface TThread {
  id: number; // 1
  created: TDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
  modified: TDateStr; // 'Sat, 12 Aug 2023 12:36:08 GMT'
  name: string; // 'Возмутиться кпсс гул'
  reporter: string; // '阿部 篤司'
  resolved: boolean; // false
  process: TProcess;
}
type TThreadsHash = Record<TTreadId, TThread>;
type TCommentsHash = Record<TTreadId, TComment>;
type TCommentsByThreads = Record<TTreadId, TCommentId[]>;
