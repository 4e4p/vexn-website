'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ProfileCard from '../../components/ProfileCard'
const RESERVED=['login','dashboard','api','admin','landing','privacy','terms']
const TABS=['Profile','Links','Style','Media','Stats']
const PRE={crimson:['#8E1230','#E0364F'],gold:['#9C7020','#E6C27A'],steel:['#4A5766','#B4C2D1'],emerald:['#0B5B43','#3FBF8F'],violet:['#4B2BA8','#9C7BFF'],ocean:['#0B4F8A','#35B6E8'],rose:['#9D2B5B','#FF8FB1'],mono:['#2B2B2B','#BDBDBD']}
const QUICK=[['Instagram','https://instagram.com/'],['TikTok','https://tiktok.com/@'],['YouTube','https://youtube.com/@'],['Discord','https://discord.gg/'],['X','https://x.com/'],['GitHub','https://github.com/'],['Twitch','https://twitch.tv/'],['Spotify','https://open.spotify.com/']]
export default function Dashboard(){
  const [user,setUser]=useState(null),[p,setP]=useState(null),[name,setName]=useState(''),[msg,setMsg]=useState(''),[ready,setReady]=useState(false),[tab,setTab]=useState('Profile')
  useEffect(()=>{
    const {data}=supabase.auth.onAuthStateChange(async(ev,s)=>{
      if(ev==='SIGNED_OUT'||(ev==='INITIAL_SESSION'&&!s)){location.href='/login';return}
      if(ev==='INITIAL_SESSION'){setUser(s.user);const r=await supabase.from('profiles').select('*').eq('id',s.user.id).maybeSingle();setP(r.data);setReady(true)}
    })
    return()=>data.subscription.unsubscribe()
  },[])
  async function claim(){
    const u=name.toLowerCase()
    if(!/^[a-z0-9_]{3,20}$/.test(u)||RESERVED.includes(u))return setMsg('Use 3-20 letters, numbers or _ (that name is not allowed)')
    const m=user.user_metadata||{}
    const r=await supabase.from('profiles').insert({id:user.id,username:u,display_name:m.full_name||u,avatar_url:m.avatar_url||null}).select().single()
    if(r.error)return setMsg(r.error.code==='23505'?'That username is taken':r.error.message)
    setP(r.data);setMsg('')
  }
  async function save(){
    const {username,id,views,created_at,...rest}=p
    for(const k of ['avatar_url','banner_url','bg_url','music_url']){if(rest[k]&&!/^https?:\/\//i.test(rest[k]))return setMsg('That link must start with https://')}
    for(const l of (rest.links||[])){if(l.url&&!/^https?:\/\//i.test(l.url))return setMsg('Link URLs must start with https://')}
    const r=await supabase.from('profiles').update(rest).eq('id',user.id)
    setMsg(r.error?r.error.message:'Saved ✓')
  }
  if(!ready)return <div className="box">Loading…</div>
  if(!p)return(<div className="box"><h1>Claim your link</h1><label>nyz.lol/</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="yourname"/>
    <button className="btn wide" onClick={claim}>Claim it</button><div className="msg">{msg}</div></div>)
  const set=(k,v)=>setP(o=>({...o,[k]:v})),links=p.links||[]
  const fx=Object.assign({tilt:true,glow:true,type:true,aurora:true,parts:true,views:true,center:false,links:'grid',enter:'click to enter',presence:true},p.fx||{}),setFx=(k,v)=>set('fx',{...fx,[k]:v})
  async function up(file,kind,field){
    if(!file)return
    if(file.size>(kind==='audio'?15e6:kind==='banner'?10e6:kind==='bg'?30e6:5e6))return setMsg('File too large')
    setMsg('Uploading…')
    const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')
    const path=user.id+'/'+kind+'-'+Date.now()+'.'+ext
    const r=await supabase.storage.from('media').upload(path,file,{upsert:true})
    if(r.error)return setMsg(r.error.message)
    set(field,supabase.storage.from('media').getPublicUrl(path).data.publicUrl);setMsg('Uploaded ✓ Tap Save')
  }
  const days7=[...Array(7)].map((_,i)=>{const dt=new Date(Date.now()-(6-i)*864e5).toISOString().slice(0,10);return [dt.slice(5),(p.daily||{})[dt]||0]}),mx=Math.max(1,...days7.map(x=>x[1]))
  const mv=(i,d)=>{const a=[...links],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];set('links',a)}
  const setLink=(i,k,v)=>set('links',links.map((l,j)=>j===i?{...l,[k]:v}:l))
  const base=PRE[p.theme]||PRE.crimson
  return(<div className="dash"><div>
    <h1>Your page</h1><p><a href={'/'+p.username} style={{color:'var(--c2)'}}>nyz.lol/{p.username}</a> · {p.views} views</p>
    <div className="tabs">{TABS.map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='Profile'&&<>
      <label>Display name</label><input value={p.display_name||''} onChange={e=>set('display_name',e.target.value)}/>
      <label>Location</label><input value={p.location||''} onChange={e=>set('location',e.target.value)} placeholder="City, Country"/>
      <label>Bio</label><textarea rows={3} value={p.bio||''} onChange={e=>set('bio',e.target.value)}/>
      <label>Avatar image URL</label><input value={p.avatar_url||''} onChange={e=>set('avatar_url',e.target.value)}/><label>Or upload a photo</label><input type="file" accept="image/*" onChange={e=>up(e.target.files[0],'avatar','avatar_url')}/><label>Banner image (top of your card)</label><input value={p.banner_url||''} onChange={e=>set('banner_url',e.target.value)} placeholder="https://..."/><label>Or upload a banner</label><input type="file" accept="image/*" onChange={e=>up(e.target.files[0],'banner','banner_url')}/></>}
    {tab==='Links'&&<>
      <label>Quick add</label><div className="chips">{QUICK.map(q=><button key={q[0]} onClick={()=>set('links',[...links,{label:q[0],url:q[1]}])}>+ {q[0]}</button>)}</div>
      <label>Your links</label>
      {links.map((l,i)=>(<div className="row" key={i}><input placeholder="Label" value={l.label} onChange={e=>setLink(i,'label',e.target.value)}/><input placeholder="https://" value={l.url} onChange={e=>setLink(i,'url',e.target.value)}/><button className="btn ghost" onClick={()=>mv(i,-1)}>↑</button><button className="btn ghost" onClick={()=>mv(i,1)}>↓</button><button className="btn ghost" onClick={()=>set('links',links.filter((_,j)=>j!==i))}>✕</button></div>))}
      <button className="btn ghost wide" onClick={()=>set('links',[...links,{label:'',url:''}])}>+ Custom link</button></>}
    {tab==='Style'&&<>
      <label>Color presets</label><div className="chips">{Object.keys(PRE).map(k=><button key={k} className={p.theme===k&&!p.c1?'on':''} onClick={()=>setP(o=>({...o,theme:k,c1:null,c2:null}))}>{k}</button>)}</div>
      <label>Custom colors</label><div className="row"><input type="color" value={p.c1||base[0]} onChange={e=>set('c1',e.target.value)}/><input type="color" value={p.c2||base[1]} onChange={e=>set('c2',e.target.value)}/></div>
      <label>Background image URL (optional)</label><input value={p.bg_url||''} onChange={e=>set('bg_url',e.target.value)} placeholder="https://..."/><label>Or upload image / video (mp4, webm)</label><input type="file" accept="image/*,video/mp4,video/webm" onChange={e=>up(e.target.files[0],'bg','bg_url')}/>
      <label>Card opacity: {p.opacity==null?62:p.opacity}%</label><input type="range" min="20" max="95" value={p.opacity==null?62:p.opacity} onChange={e=>set('opacity',+e.target.value)}/>
      <label>Card blur: {p.blur==null?22:p.blur}px</label><input type="range" min="0" max="40" value={p.blur==null?22:p.blur} onChange={e=>set('blur',+e.target.value)}/>
      <label>Avatar shape</label><select value={p.shape||'circle'} onChange={e=>set('shape',e.target.value)}><option>circle</option><option>rounded</option><option>square</option></select>
      <label>Name font</label><select value={p.font||'syne'} onChange={e=>set('font',e.target.value)}><option>syne</option><option>manrope</option><option>mono</option><option>serif</option></select>
      <label>Name effect</label><select value={p.name_fx||'none'} onChange={e=>set('name_fx',e.target.value)}><option>none</option><option>glow</option><option>gradient</option><option>sparkle</option><option>glitch</option></select>
      <label>Cursor</label><select value={p.cur||'default'} onChange={e=>set('cur',e.target.value)}><option>default</option><option>crosshair</option><option>dot</option><option>ring</option></select>
      <label>Links layout</label><select value={fx.links} onChange={e=>setFx('links',e.target.value)}><option>grid</option><option>list</option><option>icons</option></select>
      <label>Enter screen text</label><input value={fx.enter} onChange={e=>setFx('enter',e.target.value)}/>
      <label>Effects</label><div className="chips">{[['tilt','3D tilt'],['glow','Glow'],['type','Typewriter bio'],['aurora','Animated background'],['parts','Floating particles'],['views','Show views'],['presence','Discord card'],['center','Center header']].map(f=><button key={f[0]} className={fx[f[0]]?'on':''} onClick={()=>setFx(f[0],!fx[f[0]])}>{f[1]}</button>)}</div></>}
    {tab==='Media'&&<>
      <label>Music (direct .mp3 link)</label><input value={p.music_url||''} onChange={e=>set('music_url',e.target.value)} placeholder="https://.../song.mp3"/><label>Or upload a song</label><input type="file" accept="audio/*" onChange={e=>up(e.target.files[0],'audio','music_url')}/>
      <label>Discord user ID (join discord.gg/lanyard for live status)</label><input value={p.discord_id||''} onChange={e=>set('discord_id',e.target.value)}/></>}
    {tab==='Stats'&&<><label>Total views</label><div className="stat">{p.views}</div><label>Visits, last 7 days</label><div className="bars">{days7.map(x=><div key={x[0]}><b>{x[1]}</b><i style={{height:(x[1]/mx*100)+'%'}}/><small>{x[0]}</small></div>)}</div><label>Link clicks</label>{Object.entries(p.clicks||{}).sort((a,b)=>b[1]-a[1]).map(x=><div className="row2" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</>}
    <button className="btn wide" onClick={save}>Save changes</button><div className="msg">{msg}</div>
    <button className="btn ghost" onClick={()=>supabase.auth.signOut()}>Sign out</button>
  </div><div className="dprev"><ProfileCard p={p} preview/></div></div>)
}
