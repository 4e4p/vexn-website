'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function Reset(){
  const [ready,setReady]=useState(false),[pw,setPw]=useState(''),[note,setNote]=useState(null),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const {data}=supabase.auth.onAuthStateChange((ev,s)=>{if(ev==='PASSWORD_RECOVERY'||(ev==='INITIAL_SESSION'&&s))setReady(true)})
    return()=>data.subscription.unsubscribe()
  },[])
  async function save(e){
    e.preventDefault()
    if(pw.length<8)return setNote({t:'err',m:'Your password must be at least 8 characters.'})
    setBusy(true)
    const r=await supabase.auth.updateUser({password:pw})
    setBusy(false)
    if(r.error)return setNote({t:'err',m:'Could not update the password. The link may have expired.'})
    setNote({t:'ok',m:'Password updated ✓ Redirecting…'});setTimeout(()=>{location.href='/dashboard'},1200)
  }
  return(<div className="au"><div className="au-card"><h1>Set a new password</h1>
    {!ready?<p className="au-sub">Open this page from the link in your reset email.</p>:
    <form onSubmit={save}><label htmlFor="np">New password</label><input id="np" type="password" className="au-in" value={pw} onChange={e=>setPw(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters"/>
      {note&&<div className={'au-note '+note.t} role="status">{note.m}</div>}
      <button className="btn wide au-go" disabled={busy}>{busy?'Saving…':'Update password'}</button></form>}
    <p className="au-foot"><a href="/login" className="au-link">Back to sign in</a></p></div></div>)
}
