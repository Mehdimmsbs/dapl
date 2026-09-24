'use client';
import {useEffect,useState} from 'react';

export default function PWARegister(){
 const [prompt,setPrompt]=useState(null);
 const [installed,setInstalled]=useState(false);
 useEffect(()=>{
   if(process.env.NODE_ENV==='production' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
   const handler=e=>{e.preventDefault();setPrompt(e)};
   const done=()=>{setInstalled(true);setPrompt(null)};
   window.addEventListener('beforeinstallprompt',handler);
   window.addEventListener('appinstalled',done);
   return ()=>{window.removeEventListener('beforeinstallprompt',handler);window.removeEventListener('appinstalled',done)};
 },[]);
 if(!prompt||installed)return null;
 return <button className="pwaInstall" onClick={async()=>{const e=prompt;setPrompt(null);try{await e.prompt();await e.userChoice}catch{}}}>📲 نصب برنامه</button>;
}
