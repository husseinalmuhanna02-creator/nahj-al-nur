/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationMethod, Coordinates, PrayerTimes, SunnahTimes } from 'adhan';
import { formatInTimeZone } from 'date-fns-tz';

export const PRAYER_METHODS = {
  LEVA_QUM: CalculationMethod.Tehran(), // Using Tehran as it's the closest standard for Shia
  NORTH_AMERICA: CalculationMethod.NorthAmerica(),
};

export const getPrayerTimes = (coords: { lat: number; lng: number }, method = PRAYER_METHODS.LEVA_QUM) => {
  const coordinates = new Coordinates(coords.lat, coords.lng);
  const date = new Date();
  const prayerTimes = new PrayerTimes(coordinates, date, method);
  
  // Shia Adjustment: Maghrib is later (usually when the redness in the eastern sky vanishes)
  // Adhan library handles some and provides Ishraq/Imsak too.
  
  return prayerTimes;
};

// Precise Hijri conversion with offset
export const getHijriDate = (offset: number, locale: string = 'ar') => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  
  return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};
