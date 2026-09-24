export const KEY='personal-daily-planner-data-v5';
export const SETTINGS='personal-daily-planner-settings-v5';
export const seed={tasks:[
{id:1,title:'جلسه با مشتری',date:'2026-09-11',priority:'essential',scheduleType:'time',startTime:'10:00',endTime:'11:00',completed:false,activityUnit:'دقیقه',activityValue:0,description:'',prerequisites:[]},
{id:2,title:'تکمیل بخش اصلی پروژه',date:'2026-09-11',priority:'essential',scheduleType:'day',completed:false,activityUnit:'درصد',activityValue:0,description:'',prerequisites:[]},
{id:3,title:'مطالعه Next.js',date:'2026-09-11',priority:'important',scheduleType:'day',completed:true,activityUnit:'دقیقه',activityValue:45,description:'مطالعه Server Components',prerequisites:[]},
{id:4,title:'ورزش',date:'2026-09-11',priority:'normal',scheduleType:'time',startTime:'07:30',endTime:'08:15',completed:true,activityUnit:'دقیقه',activityValue:45,description:'',prerequisites:[]},
{id:5,title:'ارسال فاکتور',date:'2026-09-11',priority:'important',scheduleType:'day',completed:false,activityUnit:'مورد',activityValue:0,description:'',prerequisites:[2]},
{id:6,title:'صبحانه',date:'2026-09-11',priority:'normal',scheduleType:'time',startTime:'08:30',endTime:'09:00',completed:true,activityUnit:'مورد',activityValue:1,description:'',prerequisites:[]},
{id:7,title:'خرید تجهیزات',date:'2026-09-13',priority:'important',scheduleType:'day',completed:false,activityUnit:'مورد',activityValue:0,description:'',prerequisites:[]},
{id:8,title:'تماس با تأمین‌کننده',date:'2026-09-14',priority:'normal',scheduleType:'time',startTime:'11:00',endTime:'11:30',completed:false,activityUnit:'مورد',activityValue:0,description:'',prerequisites:[]}
]};
export const defaultSettings={language:'fa',calendar:'jalali',secondaryCalendar:'gregorian',firstDay:'saturday',hijriMethod:'ummalqura',fontSize:'small'};
