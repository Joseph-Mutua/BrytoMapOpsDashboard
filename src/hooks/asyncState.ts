export type AsyncState<T> =
  | { status: 'idle'; data: undefined; error: undefined }
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

export const idleAsyncState = <T,>(): AsyncState<T> => ({
  status: 'idle',
  data: undefined,
  error: undefined,
});
