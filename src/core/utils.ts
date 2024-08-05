import { utcToZonedTime, zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";

export function extractUsernameFromUrl(url: string) {
  // Removing the protocol (http, https) and www
  let cleanUrl = url.replace(/(^\w+:|^)\/\/(www\.)?/, '');
  cleanUrl = cleanUrl.replace(/^www\./i, '');
  // Removing social media domains
  cleanUrl = cleanUrl.replace(/facebook\.com\/|instagram\.com\/|linkedin\.com\//, '');

  // Removing search queries
  const queryIndex = cleanUrl.indexOf('?');
  if (queryIndex !== -1) {
    cleanUrl = cleanUrl.substring(0, queryIndex);
  }
  cleanUrl = cleanUrl.trim().replace(/^\/+|\/+$/g, '');
  return cleanUrl;
}

export const getLocalTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const utcTime = (date: any, timezone?: string) => {
  if (!timezone) {
    timezone = getLocalTimezone()
  }
  const localTime = zonedTimeToUtc(new Date(date), timezone);
  return localTime;
};

export const localTime = (date: any, timezone?: string) => {
  if (!timezone) {
    timezone = getLocalTimezone()
  }
  const localTime = utcToZonedTime(new Date(date), timezone);
  return localTime;
}


// const DATE_TZ_FORMAT = "dd-MM-yyyy HH:mm:ss.SSS 'GMT' XXX (z)"
// export const formatTZ = (date: number | Date, timeZone: string = getLocalTimezone()) => {
//   formatInTimeZone(date, DATE_TZ_FORMAT, { timeZone: timeZone })
// }
// export const parseTZ = (date: string, timeZone: string = getLocalTimezone()) => {
//   parse(date,)
// }



export function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



export function combineNumberArrays(arrays: Array<{ key: string, value: Array<number> }>) {
  if (!arrays.length) return [];
  let combinedArray = [];

  for (let i = 0; i < arrays[0].value.length; i++) {
    let obj: { [key: string]: number } = {};
    arrays.forEach((array) => {
      obj[array.key] = (array.value?.[i] ?? 0);
    })
    combinedArray.push(obj);
  }

  return combinedArray;
}