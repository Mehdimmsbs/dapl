export const CALENDARS={gregorian:'gregory',jalali:'persian',hijri:'islamic-umalqura'};
export const isoToday='2026-09-11';
const opts={timeZone:'UTC'};
function dt(iso){const [y,m,d]=iso.split('-').map(Number);return new Date(Date.UTC(y,m-1,d,12))}
export function isoDate(d){return d.toISOString().slice(0,10)}
export function addDays(iso,n){const d=dt(iso);d.setUTCDate(d.getUTCDate()+n);return isoDate(d)}
export function formatDate(iso,calendar,lang='fa',short=false){return new Intl.DateTimeFormat(lang==='fa'?'fa-IR':lang==='ar'?'ar-SA':'en-US',{...opts,calendar:CALENDARS[calendar]||'gregory',year:'numeric',month:short?'short':'long',day:'numeric'}).format(dt(iso))}
export function formatWeekday(iso,lang){return new Intl.DateTimeFormat(lang==='fa'?'fa-IR':lang==='ar'?'ar-SA':'en-US',{...opts,weekday:'long'}).format(dt(iso))}
// Calendar parts are parsed using en-US so fa/ar localized digits do not become NaN.
export function calendarParts(iso,calendar,lang='en'){const parts=new Intl.DateTimeFormat('en-US',{...opts,calendar:CALENDARS[calendar]||'gregory',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(dt(iso));return Object.fromEntries(parts.filter(x=>x.type==='year'||x.type==='month'||x.type==='day').map(x=>[x.type,Number(x.value)]))}
export function monthDates(anchor,calendar){const p=calendarParts(anchor,calendar,'en');let start=addDays(anchor,-45),end=addDays(anchor,45),out=[];for(let cur=start;cur<=end;cur=addDays(cur,1)){const x=calendarParts(cur,calendar,'en');if(x.year===p.year&&x.month===p.month)out.push(cur)}return out}
export function monthTitle(anchor,calendar,lang){return new Intl.DateTimeFormat(lang==='fa'?'fa-IR':lang==='ar'?'ar-SA':'en-US',{...opts,calendar:CALENDARS[calendar],year:'numeric',month:'long'}).format(dt(anchor))}
export function weekdayIndex(iso){return dt(iso).getUTCDay()}
export function calendarDayKey(iso,calendar){const p=calendarParts(iso,calendar,'en');return `${p.year}-${p.month}-${p.day}`}
