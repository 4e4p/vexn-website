'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
const PRESET=['Verified','Premium','OG','Staff','Creator','Partner']
const cl=r=>Object.values(r.clicks||{}).reduce((x,y)=>x+y,0)
export default function Admin(){
  const [ok,setOk]=useState(null),[rows,setRows]=useState([]),[q,setQ]=useState(''),[sort,setSort]=useState('views'),[filt,setFilt]=useState('all'),[open,setOpen]=useState(null),[toast,setToast]=useState(''),[reps,setReps]=useState([])
  const say=m=>{setToast(m);setTimeout(()=>setToast(''),2500)}
  async function load(){const r=await supabase.from('profiles').select('id,username,display_name,bio,avatar_url,bg_url,music_url,views,badges,hidden,locked,plan,clicks,created_at').limit(500);setRows(r.data||[]);const q2=await supabase.from('reports').select('*').order('created_at',{ascending:false}).limit(50);setReps(q2.data||[])}
  useEffect(()=>{
    const {data}=supabase.auth.onAuthStateChange(async(ev,s)=>{
      if(ev==='INITIAL_SESSION'){
        if(!s){location.href='/login';return}
        const a=await supabase.from('admins').select('id').maybeSingle()
        if(a.data){setOk(true);load()}else setOk(false)
      }
    })
    return()=>data.subscription.unsubscribe()
  },[])
  const upd=(id,k,v)=>setRows(rs=>rs.map(r=>r.id===id?{...r,[k]:v}:r))
  async function save(r){
    const x=await supabase.rpc('admin_update',{uid:r.id,p:{views:parseInt(r.views)||0,badges:r.badges||[],hidden:!!r.hidden,locked:!!r.locked,plan:r.plan||'free',username:r.username,display_name:r.display_name||'',bio:r.bio||'',avatar_url:r.avatar_url||'',bg_url:r.bg_url||'',music_url:r.music_url||'',clicks:r.clicks||{}}})
    say(x.error?x.error.message:'Saved '+r.username)
  }
  async function del(r){if(!confirm('Delete '+r.username+'?'))return;const x=await supabase.rpc('admin_delete',{uid:r.id});if(x.error)say(x.error.message);else setRows(rs=>rs.filter(y=>y.id!==r.id))}
  async function dismiss(x){await supabase.from('reports').delete().eq('id',x.id);setReps(rs=>rs.filter(y=>y.id!==x.id))}
  async function hideRep(x){const u=rows.find(r=>r.username===x.username);if(!u)return say('User not found');const e=await supabase.rpc('admin_update',{uid:u.id,p:{hidden:true}});say(e.error?e.error.message:'Hidden '+x.username)}
  if(ok===null)return <div className="box">Loading…</div>
  if(!ok)return <div className="box"><h1>Not allowed</h1><p>This page is for the owner only.</p></div>
  const today=new Date().toISOString().slice(0,10)
  const sum=f=>rows.reduce((a,r)=>a+f(r),0)
  const stats=[['Users',rows.length],['Views',sum(r=>parseInt(r.views)||0)],['Clicks',sum(cl)],['New today',rows.filter(r=>(r.created_at||'').slice(0,10)===today).length],['Premium',rows.filter(r=>r.plan==='premium').length],['Hidden',rows.filter(r=>r.hidden).length]]
  const F={all:()=>true,premium:r=>r.plan==='premium',hidden:r=>r.hidden,locked:r=>r.locked,badged:r=>(r.badges||[]).length>0}
  const S={views:(a,b)=>(parseInt(b.views)||0)-(parseInt(a.views)||0),clicks:(a,b)=>cl(b)-cl(a),new:(a,b)=>(b.created_at||'').localeCompare(a.created_at||''),name:(a,b)=>a.username.localeCompare(b.username)}
  const list=rows.filter(r=>F[filt](r)&&(r.username+' '+(r.display_name||'')).toLowerCase().includes(q.toLowerCase())).sort(S[sort])
  return(<div className="ad"><div className="ad-top"><h1>Owner panel</h1><span className="ad-pill">OWNER</span></div>
    <div className="ad-stats">{stats.map(s=><div key={s[0]}><b>{s[1].toLocaleString('en-US')}</b>{s[0]}</div>)}</div>
    <div className="ad-bar"><input placeholder="Search users…" value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="views">Most views</option><option value="clicks">Most clicks</option><option value="new">Newest</option><option value="name">A to Z</option></select></div>
    <div className="ad-chips">{Object.keys(F).map(f=><button key={f} className={filt===f?'on':''} onClick={()=>setFilt(f)}>{f}</button>)}</div>
    {reps.length>0&&<div className="ad-rep"><h3>Reports ({reps.length})</h3>{reps.map(x=><div className="row2" key={x.id}><span><b>/{x.username}</b> {x.reason}</span><span><a href={'/'+x.username} target="_blank" rel="noopener noreferrer">Open</a> <button className="ad-b" onClick={()=>hideRep(x)}>Hide user</button> <button className="ad-b" onClick={()=>dismiss(x)}>Dismiss</button></span></div>)}</div>}
    {list.map(r=>(<div className={'ad-row'+(r.hidden?' hid':'')} key={r.id}>
      <div className="ad-h" onClick={()=>setOpen(open===r.id?null:r.id)}>
        <div className="ad-av">{r.avatar_url?<img src={r.avatar_url} alt=""/>:(r.username||'?')[0]}</div>
        <div className="ad-n"><b>{r.display_name||r.username}</b><small>/{r.username}{r.plan==='premium'?' · premium':''}{r.locked?' · locked':''}</small><div className="ad-bd">{(r.badges||[]).map(b=><i key={b}>{b}</i>)}</div></div>
        <div className="ad-m"><div><b>{(parseInt(r.views)||0).toLocaleString('en-US')}</b>views</div><div><b>{cl(r)}</b>clicks</div></div>
      </div>
      {open===r.id&&<div className="ad-p">
        <h3>Numbers</h3>
        <div><label>Views (set any number)</label><input type="number" value={r.views} onChange={e=>upd(r.id,'views',e.target.value)}/></div>
        <div><label>Link clicks: {cl(r)}</label><button className="ad-b" onClick={()=>upd(r.id,'clicks',{})}>Reset clicks</button></div>
        <h3>Badges and plan</h3>
        <div className="w ad-chips">{[...new Set([...PRESET,...(r.badges||[])])].map(b=>{const has=(r.badges||[]).includes(b);return <button key={b} className={has?'on':''} onClick={()=>upd(r.id,'badges',has?r.badges.filter(x=>x!==b):[...(r.badges||[]),b])}>{b}</button>})}</div>
        <div className="w"><input placeholder="Custom badge, press Enter" onKeyDown={e=>{if(e.key==='Enter'&&e.target.value.trim()){upd(r.id,'badges',[...(r.badges||[]),e.target.value.trim()]);e.target.value=''}}}/></div>
        <div className="w ad-chips">{['free','premium'].map(pl=><button key={pl} className={(r.plan||'free')===pl?'on':''} onClick={()=>upd(r.id,'plan',pl)}>{pl}</button>)}</div>
        <h3>Moderation</h3>
        <div className="w ad-chips"><button className={r.hidden?'on':''} onClick={()=>upd(r.id,'hidden',!r.hidden)}>{r.hidden?'Hidden (banned)':'Visible'}</button><button className={r.locked?'on':''} onClick={()=>upd(r.id,'locked',!r.locked)}>{r.locked?'Editing locked':'Editing allowed'}</button></div>
        <h3>Identity</h3>
        <div><label>Username</label><input value={r.username} onChange={e=>upd(r.id,'username',e.target.value.toLowerCase())}/></div>
        <div><label>Display name</label><input value={r.display_name||''} onChange={e=>upd(r.id,'display_name',e.target.value)}/></div>
        <h3>Content (clear anything bad)</h3>
        {[['bio','Bio'],['avatar_url','Avatar URL'],['bg_url','Background URL'],['music_url','Music URL']].map(f=><div key={f[0]}><label>{f[1]}</label><div className="ad-f"><input value={r[f[0]]||''} onChange={e=>upd(r.id,f[0],e.target.value)}/><button className="ad-b" onClick={()=>upd(r.id,f[0],'')}>Clear</button></div></div>)}
        <div className="ad-act"><button className="btn" onClick={()=>save(r)}>Save</button><button className="btn ghost" onClick={()=>del(r)}>Delete user</button></div>
      </div>}
    </div>))}
    {toast&&<div className="ad-toast">{toast}</div>}</div>)
}
