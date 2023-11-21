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

/** Timestamp ticks for one day (24 hours) */
export const dailyTicks = 24 * 60 * 60 * 1000;

/** The count of actual process records to store (0 - use all the records) */
export const storeRecentProcessesCount = 10;

/** Days to keep actual recent process records (0 don't actualize by time) */
export const storeRecentProcessesForDays = 0;

/** Cookie name to store recent process list */
export const storeRecentProcessesCookieName = 'recent-processes';
