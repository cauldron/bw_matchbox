// @ts-check

const { host } = window.location;

export const isDev = host === 'localhost:5000';

export const isProd = !isDev;

// DEBUG = useDebug -- specify debug mode. Don't use it for production!
export const useDebug = true && isDev;

/** Api base */
export const readCommentsApiUrl = '/comments/read';
export const resolveThreadApiUrl = '/comments/resolve-thread';
export const createCommentApiUrl = '/comments/create-comment';

/** Intl.DateTimeFormat parameters... */
export const dateTimeFormatLocale = 'en-GB';

/** @type {Intl.DateTimeFormatOptions} */
export const dateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  // second: 'numeric',
};
