'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
const RESERVED=['login','dashboard','api','admin','landing','privacy','terms','signin','signup','claim','demo','about','contact','faq','help','logout','features','pricing','sample','explore','reset-password']
const nice=m=>/invalid login/i.test(m)?'Wrong email or password.':/already registered|already been registered/i.test(m)?'An account with this email already exists. Try signing in.':/email not confirmed/i.test(m)?'Please confirm your email first. Check your inbox.':/rate limit|too many/i.test(m)?'Too many attempts. Please wait a few minutes.':/password/i.test(m)?m:'Something went wrong. Please try again.'
export default function Login(){
  const [mode,setMode]=useState('signup'),[name,setName]=useState(''),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[note,setNote]=useState(null),[avail,setAvail]=useState(''),[sent,setSent]=useState(false)
  const up=mode==='signup'
  const oauth=p=>supabase.auth.signInWithOAuth({provider:p,options:{redirectTo:location.origin+'/dashboard'}})
  async function check(v){
    const u=v.toLowerCase();setName(v)
    if(!u){setAvail('');return}
    if(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(u)||RESERVED.includes(u)){setAvail('Use 1-20 letters, numbers or _');return}
    const r=await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('username',u)
    setAvail(r.count>0?'That username is taken':'Available ✓')
  }
  async function submit(e){
    e.preventDefault();setNote(null)
    const u=name.toLowerCase()
    if(up&&(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(u)||RESERVED.includes(u)))return setNote({t:'err',m:'Choose a username with 1-20 letters, numbers or _.'})
    if(up&&avail.includes('taken'))return setNote({t:'err',m:'That username is taken. Try another.'})
    if(!/^\S+@\S+\.\S+$/.test(email))return setNote({t:'err',m:'Enter a valid email address.'})
    if(pw.length<8)return setNote({t:'err',m:'Your password must be at least 8 characters.'})
    setBusy(true)
    try{
      if(up){
        const r=await supabase.auth.signUp({email,password:pw,options:{data:{username:u},emailRedirectTo:location.origin+'/dashboard'}})
        if(r.error)setNote({t:'err',m:nice(r.error.message)})
        else if(r.data.session)location.href='/dashboard'
        else setSent(true)
      }else{
        const r=await supabase.auth.signInWithPassword({email,password:pw})
        if(r.error)setNote({t:'err',m:nice(r.error.message)});else location.href='/dashboard'
      }
    }catch(x){setNote({t:'err',m:'Could not reach the server. Check your connection.'})}
    setBusy(false)
  }
  async function resend(){
    const r=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:location.origin+'/dashboard'}})
    setNote(r.error?{t:'err',m:nice(r.error.message)}:{t:'ok',m:'Sent again. Check your inbox and spam folder.'})
  }
  async function forgot(){
    if(!/^\S+@\S+\.\S+$/.test(email))return setNote({t:'err',m:'Type your email above first.'})
    const r=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/reset-password'})
    setNote(r.error?{t:'err',m:nice(r.error.message)}:{t:'ok',m:'If that email has an account, a reset link is on its way.'})
  }
  useEffect(()=>{const u=new URLSearchParams(location.search).get('u');if(u)check(u)},[])
  if(sent)return(<div className="au"><div className="au-card">
    <svg className="au-logo" width="48" height="48" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B3153A"/><stop offset="1" stopColor="#FF4D63"/></linearGradient></defs><rect width="160" height="160" rx="46" fill="url(#lg)"/><path d="M44 118 V44 L116 118 V44" fill="none" stroke="#fff" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <h1>Check your email</h1>
    <p className="au-sub">We sent a confirmation link to <b>{email}</b>. Open it and you will land in your dashboard.</p>
    {note&&<div className={'au-note '+note.t} role="status">{note.m}</div>}
    <button className="btn wide au-go" onClick={()=>{setSent(false);setMode('signin');setNote(null)}}>I confirmed, sign in</button>
    <p className="au-foot"><button type="button" className="au-link" onClick={resend}>Resend email</button> · <button type="button" className="au-link" onClick={()=>{setSent(false);setNote(null)}}>Change email</button></p>
  </div></div>)
  return(<div className="au"><div className="au-card">
    <svg className="au-logo" width="48" height="48" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B3153A"/><stop offset="1" stopColor="#FF4D63"/></linearGradient></defs><rect width="160" height="160" rx="46" fill="url(#lg)"/><path d="M44 118 V44 L116 118 V44" fill="none" stroke="#fff" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <h1>{up?'Create an account':'Welcome back'}</h1>
    <p className="au-sub">{up?'Claim your link on nyz.lol':'Sign in to your nyz.lol account'}</p>
    <form onSubmit={submit} noValidate>
      {up&&<><div className="au-row"><label htmlFor="un">Username</label><span>{name.length}/20</span></div>
        <input id="un" className="au-in" maxLength={20} value={name} onChange={e=>check(e.target.value)} placeholder="Username" autoComplete="username"/>
        <small className={'au-h'+(avail.includes('✓')?' ok':'')}>{avail}</small></>}
      <label htmlFor="em">Email</label><input id="em" type="email" className="au-in" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoComplete="email"/>
      <label htmlFor="pw">Password</label>
      <div className="au-pw"><input id="pw" type={show?'text':'password'} className="au-in" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" autoComplete={up?'new-password':'current-password'}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?'🙈':'👁'}</button></div>
      {!up&&<button type="button" className="au-link" onClick={forgot}>Forgot password?</button>}
      {note&&<div className={'au-note '+note.t} role="status">{note.m}</div>}
      <button className="btn wide au-go" type="submit" disabled={busy}>{busy?'Please wait…':up?'Create account':'Sign in'}</button>
    </form>
    <div className="au-or"><span>OR CONTINUE WITH</span></div>
    <button className="au-dc" onClick={()=>oauth('discord')}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg><span>Discord</span></button>
    <button className="au-gg" onClick={()=>oauth('google')}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 01-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0012 24z"/><path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 014.9 12c0-.79.14-1.56.37-2.28V6.61H1.27A12 12 0 000 12c0 1.94.46 3.77 1.27 5.39l4-3.11z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 001.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"/></svg><span>Google</span></button>
    <p className="au-foot">{up?'Already have an account? ':'New here? '}<button type="button" className="au-link" onClick={()=>{setMode(up?'signin':'signup');setNote(null)}}>{up?'Sign in':'Create account'}</button></p>
    <p className="au-fine">By continuing you agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
  </div></div>)
}
