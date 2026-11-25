'use client'
import { useEffect, useState } from 'react'
export default function Banner(){
  const [s,setS]=useState(null),[hide,setHide]=useState(false)
  useEffect(()=>{fetch('/api/site').then(r=>r.json()).then(d=>{setS(d);try{const t=d.maintenance?d.maintenance_msg:d.announcement;if(t&&localStorage.getItem('anb')===t)setHide(true)}catch(e){}}).catch(()=>{})},[])
  if(!s||hide)return null
  const t=s.maintenance?(s.maintenance_msg||'We are doing maintenance. Some features may be unavailable.'):(s.announce_on?s.announcement:'')
  if(!t)return null
  return(<div className="anb" role="status"><span>{t}</span><button onClick={()=>{try{localStorage.setItem('anb',t)}catch(e){};setHide(true)}} aria-label="Dismiss">✕</button></div>)
}
