/**
 * ChronosBridge Core
 * Mathematische Kalender-Engine und Umrechnungssysteme.
 */
class CalendarUtils {
        static addDays(date, days) {
            const result = new Date(date);
            result.setUTCDate(result.getUTCDate() + days);
            return result;
        }

        static getNthWeekdayOfMonth(year, month, weekday, n) {
            const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
            let currentWeekday = firstDayOfMonth.getUTCDay();
            let daysToAdd = (weekday - currentWeekday + 7) % 7;
            daysToAdd += (n - 1) * 7;
            return this.addDays(firstDayOfMonth, daysToAdd);
        }

        static getWesternEaster(year) {
            const a = year % 19, b = year % 4, c = year % 7, k = Math.floor(year / 100),
                p = Math.floor((13 + 8 * k) / 25), q = Math.floor(k / 4),
                M = (15 - p + k - q) % 30, N = (4 + k - q) % 7,
                d = (19 * a + M) % 30, e = (2 * b + 4 * c + 6 * d + N) % 7,
                day = 22 + d + e;
            return day > 31 ? new Date(Date.UTC(year, 3, day - 31)) : new Date(Date.UTC(year, 2, day));
        }

        static getOrthodoxEaster(year) {
            const a = year % 4, b = year % 7, c = year % 19, d = (19 * c + 15) % 30;
            const e = (2 * a + 4 * b - d + 34) % 7, dayOfMonth = d + e + 113;
            const month = Math.floor(dayOfMonth / 31), day = (dayOfMonth % 31) + 1;
            const orthodoxEasterJulian = new Date(Date.UTC(year, month - 1, day));
            orthodoxEasterJulian.setUTCDate(orthodoxEasterJulian.getUTCDate() + 13);
            return orthodoxEasterJulian;
        }

        static jdToGregorian(jd) {
            const J = Math.floor(jd + 0.5), j = J + 32044, g = Math.floor(j / 146097), dg = j % 146097;
            const c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4), dc = dg - c * 36524;
            const b = Math.floor(dc / 1461), db = dc % 1461, a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4), da = db - a * 365;
            const y = g * 400 + c * 100 + b * 4 + a, m = Math.floor((da * 5 + 308) / 153) - 2, d = da - Math.floor((m + 4) * 153 / 5) + 122;
            const year = y - 4800 + Math.floor((m + 2) / 12), month = (m + 2) % 12 + 1, day = d + 1;
            return new Date(Date.UTC(year, month - 1, day));
        }
    }

    class HebrewCalendarSystem {
        static isLeapYear(year) { return ((year * 7 + 1) % 19) < 7; }
        static getYearLength(year) { return this.hebrewToJd(year + 1, 7, 1) - this.hebrewToJd(year, 7, 1); }
        static hebrewToJd(year, month, day) {
            const HEBREW_EPOCH = 347995.5;
            const months = Math.floor((235 * year - 234) / 19), parts = 12084 + 13753 * months;
            let days = months * 29 + Math.floor(parts / 25920), dayOfWeek = days % 7;
            if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) { days++; }
            if (dayOfWeek === 0 && this.isLeapYear(year) && months > 6) { days++; }
            if (dayOfWeek === 1 && !this.isLeapYear(year - 1) && months > 5) { days++; }
            let jd = HEBREW_EPOCH + days;
            const isLeap = this.isLeapYear(year);
            const getMonthDays = (y, m) => {
                 if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
                 if (m === 12 && !this.isLeapYear(y)) return 29;
                 if (m === 8 || m === 9) {
                     const yearLen = this.getYearLength(y);
                     const longHeshvan = yearLen % 10 === 5;
                     const shortKislev = yearLen % 10 === 3;
                     if (m === 8 && !longHeshvan) return 29;
                     if (m === 9 && shortKislev) return 29;
                 }
                 return 30;
            };
            if (month < 7) {
                for (let m = 7; m <= (isLeap ? 13 : 12); m++) jd += getMonthDays(year, m);
                for (let m = 1; m < month; m++) jd += getMonthDays(year, m);
            } else { for (let m = 7; m < month; m++) jd += getMonthDays(year, m); }
            jd += day; return jd;
        }
        static convertToGregorian(hYear, hMonth, hDay) { return CalendarUtils.jdToGregorian(this.hebrewToJd(hYear, hMonth, hDay)); }
    }

    class IslamicCalendarSystem {
        static islamicToJd(year, month, day) {
            const ISLAMIC_EPOCH = 1948439.5;
            return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + ISLAMIC_EPOCH - 1;
        }
        static convertToGregorian(iYear, iMonth, iDay) { return CalendarUtils.jdToGregorian(this.islamicToJd(iYear, iMonth, iDay)); }
        static findDateInGregorianYear(gYear, iMonth, iDay) {
            let hYear = Math.round((gYear - 622) * 1.0307);
            for (let i = -1; i <= 2; i++) {
                let gDate = this.convertToGregorian(hYear + i, iMonth, iDay);
                if (gDate.getUTCFullYear() === gYear) { return gDate; }
            }
            return null;
        }
    }

    class PersianCalendarSystem {
        // Konvertiert ein Jalali-Datum (jY, jM, jD) in ein gregorianisches Date-Objekt
        static jalaliToGregorian(jY, jM, jD) {
            let jy = jY - 979;
            let jm = jM - 1;
            let jd = jD - 1;

            let j_day_no = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4);
            for (let i = 0; i < jm; ++i) j_day_no += (i < 6) ? 31 : 30;

            let j_np = j_day_no + jd;
            let g_day_no = j_np + 79;

            let gy = 1600 + 400 * parseInt(g_day_no / 146097);
            g_day_no = g_day_no % 146097;

            let leap = true;
            if (g_day_no >= 36525) {
                g_day_no--;
                gy += 100 * parseInt(g_day_no / 36524);
                g_day_no = g_day_no % 36524;

                if (g_day_no >= 365) {
                    g_day_no++;
                } else {
                    leap = false;
                }
            }

            gy += 4 * parseInt(g_day_no / 1461);
            g_day_no %= 1461;

            if (g_day_no >= 366) {
                leap = false;
                g_day_no--;
                gy += parseInt(g_day_no / 365);
                g_day_no = g_day_no % 365;
            }

            let i;
            const days = [31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            
            for (i = 0; i < 12; i++) {
                if (g_day_no < days[i]) break;
                g_day_no -= days[i];
            }
            
            return new Date(Date.UTC(gy, i, g_day_no + 1));
        }

        // Hilfsmethode: Findet ein persisches Datum im gegebenen gregorianischen Jahr
        static findDateInGregorianYear(gYear, pMonth, pDay) {
            // Das persische Jahr beginnt im MÃ¤rz.
            // Wenn wir z.B. Yalda (Monat 9) im Jahr 2025 suchen, ist das persisches Jahr 1404.
            // Wenn wir Nowruz (Monat 1) im Jahr 2025 suchen, ist das persisches Jahr 1404.
            
            // NÃ¤herung: Gregorianisches Jahr - 621 = Persisches Jahr
            let pYearBase = gYear - 621;
            
            // Wir prÃ¼fen pYearBase und pYearBase - 1, um sicherzugehen
            for (let y = pYearBase - 1; y <= pYearBase + 1; y++) {
                let date = this.jalaliToGregorian(y, pMonth, pDay);
                if (date.getUTCFullYear() === gYear) {
                    return date;
                }
            }
            return null;
        }
    }
window.ChronosBridge = {
    Utils: CalendarUtils,
    Hebrew: HebrewCalendarSystem,
    Islamic: IslamicCalendarSystem,
    Persian: PersianCalendarSystem
};
