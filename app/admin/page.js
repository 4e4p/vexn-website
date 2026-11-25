'use client'
import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
const PRESET=['Verified','Premium','OG','Staff','Creator','Partner']
const cl=r=>Object.values(r.clicks||{}).reduce((x,y)=>x+y,0)
const nv=r=>parseInt(r.views)||0
const day=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10)
const N=n=>(n||0).toLocaleString('en-US')
const Chart=({t,data})=>{const mx=Math.max(1,...data.map(x=>x[1]));return(<div><label>{t}</label><div className="bars">{data.map(x=><div key={x[0]}><b>{x[1]}</b><i style={{height:(x[1]/mx*100)+'%'}}/><small>{x[0]}</small></div>)}</div></div>)}
export default function Admin(){
  const [ok,setOk]=useState(null),[rows,setRows]=useState([]),[mail,setMail]=useState({}),[reps,setReps]=useState([]),[logs,setLogs]=useState([]),[q,setQ]=useState(''),[sort,setSort]=useState('views'),[filt,setFilt]=useState('all'),[open,setOpen]=useState(null),[toast,setToast]=useState(''),[err,setErr]=useState(''),[loading,setLoading]=useState(true),[lf,setLf]=useState('all'),[lq,setLq]=useState(''),[site,setSite]=useState({announcement:'',announce_on:false,maintenance:false,maintenance_msg:''}),[fb,setFb]=useState([]),[ev,setEv]=useState([]),[bdefs,setBdefs]=useState([]),[nb,setNb]=useState({name:'',icon:'',color:'#6b7280',description:''})
  const say=m=>{setToast(m);setTimeout(()=>setToast(''),2500)}
  async function load(){
    const r=await supabase.from('profiles').select('id,username,display_name,bio,avatar_url,bg_url,music_url,views,badges,hidden,locked,plan,clicks,daily,created_at').limit(1000)
    if(r.error){setErr(r.error.message);setLoading(false);return}
    setRows(r.data||[])
    const m=await supabase.rpc('admin_users');const mm={};(m.data||[]).forEach(u=>{mm[u.id]=u});setMail(mm)
    const q2=await supabase.from('reports').select('*').order('created_at',{ascending:false}).limit(50);setReps(q2.data||[])
    const q3=await supabase.from('audit_log').select('*').order('created_at',{ascending:false}).limit(100);setLogs(q3.data||[])
    const s1=await supabase.from('site_settings').select('*').eq('id',1).maybeSingle();if(s1.data)setSite(s1.data)
    const f1=await supabase.from('feedback').select('*').order('created_at',{ascending:false}).limit(50);setFb(f1.data||[])
    const b1=await supabase.from('badges').select('*').order('id');setBdefs(b1.data||[])
    const e1=await supabase.from('events').select('kind,created_at').gte('created_at',new Date(Date.now()-14*864e5).toISOString()).limit(20000);setEv(e1.data||[])
    setLoading(false)
  }
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
  const logIt=async(action,target,detail)=>{await supabase.from('audit_log').insert({action,target,detail:detail||''})}
  async function save(r){
    const x=await supabase.rpc('admin_update',{uid:r.id,p:{views:parseInt(r.views)||0,badges:r.badges||[],hidden:!!r.hidden,locked:!!r.locked,plan:r.plan||'free',username:r.username,display_name:r.display_name||'',bio:r.bio||'',avatar_url:r.avatar_url||'',bg_url:r.bg_url||'',music_url:r.music_url||'',clicks:r.clicks||{}}})
    say(x.error?x.error.message:'Saved '+r.username);if(!x.error)logIt('update',r.username,'views='+r.views+' plan='+(r.plan||'free')+' hidden='+!!r.hidden+' locked='+!!r.locked)
  }
  async function ban(r){const un=r.hidden&&r.locked;let why='';if(!un){why=prompt('Reason for the ban (saved to the audit log):');if(why===null)return}else if(!confirm('Unban '+r.username+'?'))return;const x=await supabase.rpc('admin_update',{uid:r.id,p:{hidden:!un,locked:!un}});if(x.error)return say(x.error.message);upd(r.id,'hidden',!un);upd(r.id,'locked',!un);logIt(un?'unban':'ban',r.username,why)}
  async function quickHide(r){const h=!r.hidden;if(!confirm((h?'Hide ':'Unhide ')+r.username+'?'))return;const x=await supabase.rpc('admin_update',{uid:r.id,p:{hidden:h}});if(x.error)return say(x.error.message);upd(r.id,'hidden',h);logIt(h?'hide':'unhide',r.username)}
  async function del(r){const t=prompt('This permanently deletes the ACCOUNT and page of '+r.username+'. Type the username to confirm:');if(t!==r.username)return;const x=await supabase.rpc('admin_delete_user',{uid:r.id});if(!x.error&&!x.data)return say('Not allowed (you cannot delete yourself).');if(x.error)say(x.error.message);else{setRows(rs=>rs.filter(y=>y.id!==r.id));logIt('delete',r.username)}}
  async function saveSite(){if(site.maintenance&&!confirm('Maintenance mode will replace every public profile with a notice. Continue?'))return;const r=await supabase.from('site_settings').update({announcement:site.announcement||'',announce_on:!!site.announce_on,maintenance:!!site.maintenance,maintenance_msg:site.maintenance_msg||''}).eq('id',1);say(r.error?r.error.message:'Platform settings saved');if(!r.error)logIt('settings','site','banner='+!!site.announce_on+' maintenance='+!!site.maintenance)}
  async function dismissFb(x){await supabase.from('feedback').delete().eq('id',x.id);setFb(a=>a.filter(y=>y.id!==x.id))}
  async function dismiss(x){await supabase.from('reports').delete().eq('id',x.id);setReps(rs=>rs.filter(y=>y.id!==x.id))}
  async function hideRep(x){const u=rows.find(r=>r.username===x.username);if(!u)return say('User not found');const e=await supabase.rpc('admin_update',{uid:u.id,p:{hidden:true}});if(e.error)return say(e.error.message);upd(u.id,'hidden',true);logIt('hide',x.username,x.reason)}
  if(ok===null)return <div className="box">Loading…</div>
  if(!ok)return <div className="box"><h1>Not allowed</h1><p>This page is for the owner only.</p></div>
  const sum=f=>rows.reduce((a,r)=>a+f(r),0),act=Object.values(mail).filter(u=>u.last_login&&new Date(u.last_login)>Date.now()-7*864e5).length
  const stats=[['Users',rows.length],['Active 7d',act],['New today',rows.filter(r=>(r.created_at||'').slice(0,10)===day(0)).length],['Views',sum(nv)],['Clicks',sum(cl)],['Premium',rows.filter(r=>r.plan==='premium').length],['Hidden',rows.filter(r=>r.hidden).length]]
  const d14=[...Array(14)].map((_,i)=>day(13-i))
  const regs=d14.map(d=>[d.slice(5),rows.filter(r=>(r.created_at||'').slice(0,10)===d).length]),vws=d14.map(d=>[d.slice(5),sum(r=>(r.daily&&r.daily[d])||0)])
  const cks=d14.map(d=>[d.slice(5),ev.filter(x=>x.kind==='click'&&(x.created_at||'').slice(0,10)===d).length])
  const topP=[...rows].sort((a,b)=>nv(b)-nv(a)).slice(0,5)
  const F={all:()=>true,premium:r=>r.plan==='premium',hidden:r=>r.hidden,locked:r=>r.locked,badged:r=>(r.badges||[]).length>0}
  const S={views:(a,b)=>nv(b)-nv(a),clicks:(a,b)=>cl(b)-cl(a),new:(a,b)=>(b.created_at||'').localeCompare(a.created_at||''),name:(a,b)=>a.username.localeCompare(b.username)}
  const list=rows.filter(r=>F[filt](r)&&((r.username||'')+' '+(r.display_name||'')+' '+((mail[r.id]||{}).email||'')).toLowerCase().includes(q.toLowerCase())).sort(S[sort])
  const bn=bdefs.length?bdefs.map(b=>b.name):PRESET
  async function saveBadge(){const n=(nb.name||'').trim();if(!n)return say('Badge name is required');const x=await supabase.from('badges').upsert({name:n,icon:(nb.icon||'').slice(0,2),color:nb.color||'#6b7280',description:(nb.description||'').slice(0,100)},{onConflict:'name'});if(x.error)return say(x.error.message);logIt('badge-save',n);setNb({name:'',icon:'',color:'#6b7280',description:''});load()}
  async function delBadge(b){if(!confirm('Delete badge '+b.name+'? It will stop showing on profiles.'))return;const x=await supabase.from('badges').delete().eq('id',b.id);if(x.error)return say(x.error.message);logIt('badge-delete',b.name);setBdefs(a=>a.filter(y=>y.id!==b.id))}
  const csv=(name,head,data)=>{const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';const t=[head.map(q).join(',')].concat(data.map(r=>r.map(q).join(','))).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()}
  const exportUsers=()=>csv('nyz-users.csv',['username','email','plan','views','clicks','joined','last_login','status'],rows.map(r=>{const m=mail[r.id]||{};return [r.username,m.email,r.plan||'free',nv(r),cl(r),(r.created_at||'').slice(0,10),m.last_login||'',r.hidden&&r.locked?'banned':r.hidden?'hidden':r.locked?'locked':'active']}))
  const exportViews=()=>csv('nyz-views-14d.csv',['date','views','new_users'],d14.map((d,i)=>[d,vws[i][1],regs[i][1]]))
  return(<div className="ad"><div className="ad-top"><h1>Owner panel</h1><span className="ad-pill">OWNER</span></div>
    {err&&<div className="msg">Could not load users: {err}</div>}
    <div className="ad-stats">{stats.map(s=><div key={s[0]}><b>{N(s[1])}</b>{s[0]}</div>)}</div>
    <div className="ad-two"><Chart t="New users, 14 days" data={regs}/><Chart t="Profile views, 14 days" data={vws}/><Chart t="Link clicks, 14 days" data={cks}/></div>
    <label>Most viewed profiles</label>{topP.map(r=><div className="row2" key={r.id}><span>/{r.username}</span><b>{N(nv(r))}</b></div>)}
    {reps.length>0&&<div className="ad-rep"><h3>Reports ({reps.length})</h3>{reps.map(x=><div className="row2" key={x.id}><span><b>/{x.username}</b> {x.reason}</span><span><a href={'/'+x.username} target="_blank" rel="noopener noreferrer">Open</a> <button className="ad-b" onClick={()=>hideRep(x)}>Hide user</button> <button className="ad-b" onClick={()=>dismiss(x)}>Dismiss</button></span></div>)}</div>}
    <h2 style={{margin:'26px 0 8px'}}>Platform</h2>
    <div className="ad-rep" style={{borderColor:'var(--line)'}}>
      <label>Announcement banner (shown on every page)</label><textarea rows={2} maxLength={200} value={site.announcement||''} onChange={e=>setSite({...site,announcement:e.target.value})}/>
      <div className="chips"><button className={site.announce_on?'on':''} onClick={()=>setSite({...site,announce_on:!site.announce_on})}>{site.announce_on?'✓ Banner on':'Banner off'}</button><button className={site.maintenance?'on':''} onClick={()=>setSite({...site,maintenance:!site.maintenance})}>{site.maintenance?'✓ Maintenance mode on':'Maintenance mode off'}</button></div>
      <label>Maintenance message</label><input maxLength={200} value={site.maintenance_msg||''} onChange={e=>setSite({...site,maintenance_msg:e.target.value})}/>
      <div className="row"><button className="btn" onClick={saveSite}>Save platform settings</button></div></div>
    {fb.length>0&&<div className="ad-rep"><h3>Feedback and bug reports ({fb.length})</h3>{fb.map(x=><div className="row2" key={x.id}><span><b>{x.kind}</b> {x.message}{x.contact?' · '+x.contact:''}</span><button className="ad-b" onClick={()=>dismissFb(x)}>Done</button></div>)}</div>}
    <h2 style={{margin:'26px 0 8px'}}>Badges</h2>
    <div className="ad-rep" style={{borderColor:'var(--line)'}}>
      <div className="chips">{bdefs.length===0&&<small>No badges yet. Run the badges SQL first.</small>}{bdefs.map(b=><span key={b.id} className="bdg2" title={b.description} style={{background:b.color}}>{b.icon} {b.name}<button onClick={()=>setNb({name:b.name,icon:b.icon||'',color:b.color||'#6b7280',description:b.description||''})} aria-label={'Edit '+b.name}>✎</button><button onClick={()=>delBadge(b)} aria-label={'Delete '+b.name}>✕</button></span>)}</div>
      <label>Create or edit a badge</label>
      <div className="row"><input placeholder="Name" maxLength={24} value={nb.name} onChange={e=>setNb({...nb,name:e.target.value})}/><input placeholder="Icon (1-2 chars)" maxLength={2} value={nb.icon} onChange={e=>setNb({...nb,icon:e.target.value})}/></div>
      <div className="ad-f" style={{marginTop:8}}><input type="color" style={{width:70}} value={nb.color} onChange={e=>setNb({...nb,color:e.target.value})}/><input placeholder="Description" maxLength={100} value={nb.description} onChange={e=>setNb({...nb,description:e.target.value})}/></div>
      <div className="row"><button className="btn" onClick={saveBadge}>Save badge</button></div></div>
    <h2 style={{margin:'26px 0 8px'}}>Users</h2>
    <div className="ad-chips" style={{marginTop:0}}><button onClick={exportUsers}>⬇ Export users CSV</button><button onClick={exportViews}>⬇ Export 14-day stats CSV</button></div>
    <div className="ad-bar"><input placeholder="Search name, username or email…" value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="views">Most views</option><option value="clicks">Most clicks</option><option value="new">Newest</option><option value="name">A to Z</option></select></div>
    <div className="ad-chips">{Object.keys(F).map(f=><button key={f} className={filt===f?'on':''} onClick={()=>setFilt(f)}>{f}</button>)}</div>
    <div className="ad-tw"><table className="ad-t"><thead><tr><th>User</th><th>Email</th><th>Plan</th><th>Views</th><th>Clicks</th><th>Joined</th><th>Last login</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {loading&&<tr><td colSpan={9}>Loading users…</td></tr>}
      {!loading&&list.length===0&&<tr><td colSpan={9}>No users match.</td></tr>}
      {list.map(r=>{const m=mail[r.id]||{};return(<Fragment key={r.id}>
        <tr className={r.hidden?'hid':''}>
          <td><div className="ad-u"><div className="ad-av">{r.avatar_url?<img src={r.avatar_url} alt=""/>:(r.username||'?')[0]}</div><div><b>{r.display_name||r.username}</b><small>@{r.username}</small></div></div></td>
          <td>{m.email||'—'}</td>
          <td>{r.plan==='premium'?'Premium':'Free'}<div>{(r.badges||[]).map(b=><i key={b} className="bdg">{b}</i>)}</div></td>
          <td>{N(nv(r))}</td><td>{cl(r)}</td><td>{(r.created_at||'').slice(0,10)}</td><td>{m.last_login?new Date(m.last_login).toLocaleDateString():'Never'}</td>
          <td><span className={'st '+(r.hidden?'bad':r.locked?'warn':'ok')}>{r.hidden&&r.locked?'Banned':r.hidden?'Hidden':r.locked?'Locked':'Active'}</span></td>
          <td className="ac-a"><button title="Edit" onClick={()=>setOpen(open===r.id?null:r.id)}>✎</button><button title={r.hidden?'Unhide':'Hide'} onClick={()=>quickHide(r)}>{r.hidden?'👁':'🚫'}</button><button title={r.hidden&&r.locked?'Unban':'Ban'} onClick={()=>ban(r)}>🔨</button><button title="Delete" onClick={()=>del(r)}>🗑</button></td></tr>
        {open===r.id&&<tr><td colSpan={9}><div className="ad-p">
          <h3>Numbers</h3>
          <div><label>Views (set any number)</label><input type="number" value={r.views} onChange={e=>upd(r.id,'views',e.target.value)}/></div>
          <div><label>Link clicks: {cl(r)}</label><button className="ad-b" onClick={()=>upd(r.id,'clicks',{})}>Reset clicks</button></div>
          <h3>Badges and plan</h3>
          <div className="w ad-chips">{[...new Set([...bn,...(r.badges||[])])].map(b=>{const has=(r.badges||[]).includes(b);return <button key={b} className={has?'on':''} onClick={()=>upd(r.id,'badges',has?r.badges.filter(x=>x!==b):[...(r.badges||[]),b])}>{b}</button>})}</div>
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
        </div></td></tr>}
      </Fragment>)})}
    </tbody></table></div>
    <details className="ad-rep" style={{borderColor:'var(--line)'}}><summary>Audit log ({logs.length})</summary><div className="ad-bar" style={{margin:'8px 0'}}><select value={lf} onChange={e=>setLf(e.target.value)}>{['all','update','hide','unhide','ban','unban','delete'].map(a=><option key={a}>{a}</option>)}</select><input placeholder="Filter by username…" value={lq} onChange={e=>setLq(e.target.value)}/></div>{logs.filter(x=>(lf==='all'||x.action===lf)&&(x.target||'').includes(lq.toLowerCase())).map(x=><div className="row2" key={x.id}><span><b>{x.action}</b> /{x.target} {x.detail}</span><small>{new Date(x.created_at).toLocaleString()}</small></div>)}</details>
    {toast&&<div className="ad-toast">{toast}</div>}</div>)
}
