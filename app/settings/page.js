'use client';
import {useEffect} from 'react';
export default function SettingsRedirect(){useEffect(()=>{location.replace('/?settings=1')},[]);return <div style={{padding:30,textAlign:'center'}}>Opening settings…</div>}
