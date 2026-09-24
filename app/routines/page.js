'use client';

import {useEffect,useMemo,useState} from 'react';
import {KEY,SETTINGS,seed,defaultSettings} from '../data';
import {tr,translations} from '../../lib/i18n';

const ROUTINES='personal-daily-planner-routines-v8';
const days=['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];
const empty={id:null,title:'',description:'',priority:'normal',scheduleType:'day',startTime:'',endTime:'',unit:'دقیقه',enabled:true,days:[...days]};
const suggestions=['ورزش','مطالعه','صبحانه','ناهار','شام','نظافت منزل','پیاده‌روی','مدیتیشن','نوشیدن آب','بررسی ایمیل','برنامه‌ریزی روز','یادگیری زبان'];

function readJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event('pdp-storage'));}catch{}}

export default function Routines(){
 const [settings,setSettings]=useState(defaultSettings);
 const [routines,setRoutines]=useState([]);
 const [filter,setFilter]=useState('all');
 const [editing,setEditing]=useState(null);
 const [dark,setDark]=useState(false);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [hydrated,setHydrated]=useState(false);

 useEffect(()=>{
   setSettings({...defaultSettings,...readJSON(SETTINGS,{})});
   setRoutines(readJSON(ROUTINES,[]));
   setDark(readJSON('pdp-dark',false)===true || localStorage.getItem('pdp-dark')==='1');
   setHydrated(true);
 },[]);
 useEffect(()=>{if(hydrated)writeJSON(ROUTINES,routines)},[routines,hydrated]);
 useEffect(()=>{document.documentElement.lang=settings.language;document.documentElement.dir=translations[settings.language].dir;document.documentElement.classList.toggle('dark',dark);document.documentElement.classList.remove('font-small','font-medium','font-large');document.documentElement.classList.add(`font-${settings.fontSize||'medium'}`);if(hydrated)localStorage.setItem('pdp-dark',dark?'1':'0')},[settings.language,dark,hydrated]);

 const t=k=>tr(settings.language,k);
 const visible=useMemo(()=>filter==='all'?routines:routines.filter(r=>(r.days||[]).includes(filter)),[routines,filter]);

 function openNew(){setEditing({...empty,id:null,days:[...days]})}
 function saveRoutine(form){
   const clean={
     ...form,
     id:form.id || Date.now(),
     title:String(form.title||'').trim(),
     description:String(form.description||'').trim(),
     days:Array.isArray(form.days)&&form.days.length?form.days:[...days],
     startTime:form.scheduleType==='time'?form.startTime:'',
     endTime:form.scheduleType==='time'?form.endTime:''
   };
   if(!clean.title || !clean.days.length)return;
   setRoutines(prev=>form.id?prev.map(r=>String(r.id)===String(form.id)?clean:r):[...prev,clean]);
   setEditing(null);
 }
 function deleteRoutine(id){
   if(!window.confirm(t('confirmDeleteRoutine')))return;
   setRoutines(prev=>prev.filter(r=>String(r.id)!==String(id)));
 }
 function toggleRoutine(id){setRoutines(prev=>prev.map(r=>String(r.id)===String(id)?{...r,enabled:!r.enabled}:r))}
 function applyToday(){
   const now=new Date();
   const iso=now.toISOString().slice(0,10);
   const weekday=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][now.getDay()];
   const db=readJSON(KEY,seed);
   const additions=routines
     .filter(r=>r.enabled&&(r.days||[]).includes(weekday))
     .filter(r=>!db.tasks.some(task=>task.date===iso&&String(task.routineId)===String(r.id)))
     .map((r,i)=>({
       id:Date.now()+i,title:r.title,description:r.description||'',date:iso,priority:r.priority,
       scheduleType:r.scheduleType,startTime:r.scheduleType==='time'?r.startTime:'',endTime:r.scheduleType==='time'?r.endTime:'',
       completed:false,activityUnit:r.unit,activityValue:0,prerequisites:[],source:'routine',routineId:r.id
     }));
   if(!additions.length){window.alert(t('routineNothing'));return}
   writeJSON(KEY,{...db,tasks:[...db.tasks,...additions]});
   window.alert(t('routineApplied',{n:additions.length}));
 }
 return <div className="appShell">
   <aside className="sidebar"><div className="brand"><div className="brandMark">✓</div><div className="brandText"><b>روزمن</b><span>{t('planner')}</span></div><button className="collapseBtn" onClick={()=>document.body.classList.toggle('sidebarCollapsed')}>«</button></div>
   <nav className="nav"><a href="/">⌂ <span>{t('today')}</span></a><a href="/calendar">▦ <span>{t('calendar')}</span></a><a href="/?new=1">＋ <span>{t('newTask')}</span></a><a className="active" href="/routines">↻ <span>{t('routines')}</span></a><a href="/?settings=1">⚙ <span>{t('settings')}</span></a></nav></aside>
   {mobileOpen&&<><div className="drawerBackdrop" onClick={()=>setMobileOpen(false)}/><aside className="mobileDrawer"><div className="brand"><div className="brandMark">✓</div><div className="brandText"><b>روزمن</b><span>{t('planner')}</span></div><button className="drawerClose" onClick={()=>setMobileOpen(false)}>×</button></div><nav className="nav"><a href="/">⌂ <span>{t('today')}</span></a><a href="/calendar">▦ <span>{t('calendar')}</span></a><a href="/?new=1">＋ <span>{t('newTask')}</span></a><a className="active" href="/routines">↻ <span>{t('routines')}</span></a><a href="/?settings=1">⚙ <span>{t('settings')}</span></a></nav></aside></>}
   <div className="main"><header className="topbar"><div className="topLeft"><button className="mobileMenu" onClick={()=>setMobileOpen(true)}>☰</button><span className="crumb">{t('planner')} / {t('routines')}</span></div><button className="iconBtn" onClick={()=>setDark(v=>!v)}>{dark?'☀':'☾'}</button></header>
   <main className="content"><div className="hero"><div><div className="kicker">{t('routines')}</div><h1>{t('routineTitle')}</h1><p>{t('routineSub')}</p></div><div className="heroActions"><button className="ghost" onClick={applyToday}>↻ {t('applyToday')}</button><button className="primary" onClick={openNew}>＋ {t('newRoutine')}</button></div></div>
   <section className="card routinesPage"><div className="routineFilters"><button className={filter==='all'?'on':''} onClick={()=>setFilter('all')}>{t('allDays')}</button>{days.map(d=><button key={d} className={filter===d?'on':''} onClick={()=>setFilter(d)}>{t(d)}</button>)}</div>
   <div className="routineList">{visible.map(r=><div className={`routineItem ${r.enabled?'':'disabled'}`} key={r.id}>
     <div className="routineMain"><div className="routineIcon">↻</div><div><b>{r.title}</b><span>{r.scheduleType==='time'?`${r.startTime} – ${r.endTime}`:t('day')} · {(r.days||[]).map(d=>t(d)).join('، ')}</span>{r.description&&<small className="routineDesc">{r.description}</small>}</div></div>
     <div className="routineActions"><span className={`tag ${r.priority}`}>{r.priority==='essential'?t('essentialLabel'):r.priority==='important'?t('importantLabel'):t('normal')}</span><button type="button" className="miniBtn" onClick={()=>toggleRoutine(r.id)}>{r.enabled?'✓':'○'}</button><button type="button" className="miniBtn" onClick={()=>setEditing({...r})}>✎</button><button type="button" className="miniBtn dangerBtn" onClick={()=>deleteRoutine(r.id)}>×</button></div>
   </div>)}{!visible.length&&<div className="empty">{t('noRoutines')}</div>}</div></section></main><MobileNav lang={settings.language}/></div>
   {editing&&<RoutineModal key={`${editing.id??'new'}-${editing._open||0}`} lang={settings.language} routine={editing} onClose={()=>setEditing(null)} onSave={saveRoutine}/>}</div>
}

function RoutineModal({lang,routine,onClose,onSave}){
 const t=k=>tr(lang,k);
 const [form,setForm]=useState(()=>({...empty,...routine,days:[...(routine.days||days)]}));
 function change(e){const {name,value,type,checked}=e.target;setForm(f=>({...f,[name]:type==='checkbox'?checked:value}))}
 function toggleDay(day){setForm(f=>({...f,days:f.days.includes(day)?f.days.filter(x=>x!==day):[...f.days,day]}))}
 function submit(e){e.preventDefault();onSave({...form,title:form.title.trim(),description:form.description.trim()})}
 return <div className="overlay" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}>
   <div className="modalHeader"><h2>{routine.id?t('editRoutine'):t('newRoutine')}</h2><button type="button" onClick={onClose}>×</button></div>
   <form className="form" onSubmit={submit}>
    <label>{t('title')}<input name="title" value={form.title} onChange={change} required autoFocus/><div className="suggestionChips">{suggestions.map(x=><button type="button" key={x} className="suggestionChip" onClick={()=>setForm(f=>({...f,title:x}))}>{x}</button>)}</div></label>
    <label>{t('routineDescription')}<textarea name="description" rows="3" value={form.description} onChange={change}/></label>
    <label>{t('priority')}<select name="priority" value={form.priority} onChange={change}><option value="normal">{t('normal')}</option><option value="important">{t('importantLabel')}</option><option value="essential">{t('essentialLabel')}</option></select></label>
    <label>{t('schedule')}<select name="scheduleType" value={form.scheduleType} onChange={change}><option value="day">{t('day')}</option><option value="time">{t('atTime')}</option></select></label>
    {form.scheduleType==='time'&&<div className="two"><label>{t('start')}<input name="startTime" type="time" value={form.startTime} onChange={change} required/></label><label>{t('end')}<input name="endTime" type="time" value={form.endTime} onChange={change} required/></label></div>}
    <label>{t('unit')}<select name="unit" value={form.unit} onChange={change}><option>دقیقه</option><option>ساعت</option><option>درصد</option><option>مورد</option><option>صفحه</option></select></label>
    <div className="weekPicker"><b>{t('routineDays')}</b>{days.map(d=><button type="button" key={d} className={`dayChoice ${form.days.includes(d)?'on':''}`} onClick={()=>toggleDay(d)}>{t(d)}</button>)}</div>
    <label className="switchRow"><span>{t('enabled')}</span><input name="enabled" type="checkbox" checked={form.enabled} onChange={change}/></label>
    <button className="primary" type="submit">{t('save')}</button>
   </form>
 </div></div>
}
function MobileNav({lang}){return <nav className="mobileNav"><a href="/">⌂<span>{tr(lang,'today')}</span></a><a href="/calendar">▦<span>{tr(lang,'calendar')}</span></a><a href="/?new=1" className="add">+<span>{tr(lang,'newTask')}</span></a><a className="active" href="/routines">↻<span>{tr(lang,'routines')}</span></a><a href="/?settings=1">⚙<span>{tr(lang,'settings')}</span></a></nav>}
