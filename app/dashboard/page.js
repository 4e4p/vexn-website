'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ProfileCard from '../../components/ProfileCard'
const RESERVED=['login','dashboard','api','admin','landing','privacy','terms','signin','signup','claim','demo','about','contact','faq','help','logout','features','pricing','sample','explore']
const TABS=[['Overview','📊'],['Profile','👤'],['Links','🔗'],['Style','🎨'],['Media','🎵']]
const PRE={crimson:['#8E1230','#E0364F'],gold:['#9C7020','#E6C27A'],steel:['#4A5766','#B4C2D1'],emerald:['#0B5B43','#3FBF8F'],violet:['#4B2BA8','#9C7BFF'],ocean:['#0B4F8A','#35B6E8'],rose:['#9D2B5B','#FF8FB1'],mono:['#2B2B2B','#BDBDBD']}
const QUICK=[['Instagram','https://instagram.com/'],['TikTok','https://tiktok.com/@'],['YouTube','https://youtube.com/@'],['Discord','https://discord.gg/'],['X','https://x.com/'],['GitHub','https://github.com/'],['Twitch','https://twitch.tv/'],['Spotify','https://open.spotify.com/']]
const FXD={tilt:true,glow:true,type:true,aurora:true,parts:true,views:true,center:false,links:'grid',enter:'click to enter',presence:true,vol:70,auto:true,title:'',artist:'',bpos:50,explore:false,dim:50,az:100,ax:50,ay:50,bposx:50,bw:1,bc:'',br:22,cat:''}
const TPL=[
{n:'Midnight',d:{theme:'crimson',opacity:62,blur:22,shape:'circle',font:'syne',name_fx:'none',cur:'default',fx:{links:'grid',center:false,glow:true,aurora:true,parts:true,tilt:true,bw:1,bc:'',br:22}}},
{n:'Neon Glass',d:{theme:'violet',opacity:35,blur:30,shape:'rounded',font:'syne',name_fx:'glow',cur:'default',fx:{links:'list',center:true,glow:true,aurora:true,parts:true,tilt:true,bw:1,bc:'',br:30}}},
{n:'Minimal Mono',d:{theme:'mono',opacity:80,blur:10,shape:'circle',font:'manrope',name_fx:'none',cur:'default',fx:{links:'list',center:true,glow:false,aurora:false,parts:false,tilt:false,bw:1,bc:'',br:14}}},
{n:'Gamer',d:{theme:'emerald',opacity:55,blur:16,shape:'square',font:'mono',name_fx:'glitch',cur:'crosshair',fx:{links:'grid',center:false,glow:true,aurora:true,parts:true,tilt:true,bw:2,bc:'',br:8}}},
{n:'Sunset',d:{theme:'rose',opacity:50,blur:24,shape:'circle',font:'serif',name_fx:'gradient',cur:'default',fx:{links:'grid',center:true,glow:true,aurora:true,parts:true,tilt:true,bw:1,bc:'',br:28}}},
{n:'Ocean Calm',d:{theme:'ocean',opacity:60,blur:20,shape:'rounded',font:'manrope',name_fx:'sparkle',cur:'default',fx:{links:'icons',center:true,glow:true,aurora:true,parts:false,tilt:true,bw:1,bc:'',br:24}}}]
const EDIT=['display_name','bio','avatar_url','banner_url','theme','music_url','discord_id','links','c1','c2','bg_url','opacity','blur','shape','font','fx','location','cur','name_fx','private']
const pick=o=>{const r={};EDIT.forEach(k=>{r[k]=o[k]===undefined?null:o[k]});r.links=r.links||[];r.fx=r.fx||{};return r}
const AUDIO=/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i
export default function Dashboard(){
  const [user,setUser]=useState(null),[p,setP]=useState(null),[orig,setOrig]=useState(''),[name,setName]=useState(''),[msg,setMsg]=useState(''),[ready,setReady]=useState(false),[tab,setTab]=useState('Overview'),[drag,setDrag]=useState(null),[saving,setSaving]=useState(false),[range,setRange]=useState(30),[full,setFull]=useState(false),[dc,setDc]=useState(null),[nu,setNu]=useState(''),[avail,setAvail]=useState(''),[evs,setEvs]=useState([])
  const dirty=!!p&&JSON.stringify(pick(p))!==orig
  useEffect(()=>{
    const {data}=supabase.auth.onAuthStateChange(async(ev,s)=>{
      if(ev==='SIGNED_OUT'||(ev==='INITIAL_SESSION'&&!s)){location.href='/login';return}
      if(ev==='INITIAL_SESSION'){setUser(s.user);const r=await supabase.from('profiles').select('*').eq('id',s.user.id).maybeSingle();if(r.error)setMsg(r.error.message);if(!r.data){const m=s.user.user_metadata||{},un=(m.username||'').toLowerCase();if(un&&/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(un)&&!RESERVED.includes(un)){const ins=await supabase.from('profiles').insert({id:s.user.id,username:un,display_name:m.full_name||un,avatar_url:m.avatar_url||null}).select().single();if(ins.data){r.data=ins.data}else{setName(un);setMsg(ins.error&&ins.error.code==='23505'?'That username was taken. Pick another.':'Could not claim your username. Pick one below.')}}}
      setP(r.data);setOrig(r.data?JSON.stringify(pick(r.data)):'');setReady(true)}
    })
    return()=>data.subscription.unsubscribe()
  },[])
  useEffect(()=>{if(!dirty)return;const h=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',h);return()=>window.removeEventListener('beforeunload',h)},[dirty])
  useEffect(()=>{if(!msg)return;const t=setTimeout(()=>setMsg(''),4000);return()=>clearTimeout(t)},[msg])
  useEffect(()=>{if(!p||!p.username)return;supabase.from('events').select('kind,label,created_at').eq('username',p.username).gte('created_at',new Date(Date.now()-90*864e5).toISOString()).order('created_at',{ascending:false}).limit(2000).then(r=>{if(!r.error)setEvs(r.data||[])})},[p&&p.username])
  const hr=useRef({past:[],future:[],cur:null,base:null,t:null,skip:false,latest:null}),act=useRef({}),[hv,setHv]=useState(0),[auto,setAuto]=useState(false),[qr,setQr]=useState(''),[dz,setDz]=useState('')
  useEffect(()=>{try{setAuto(localStorage.getItem('nyz_auto')==='1')}catch(e){}},[])
  useEffect(()=>{
    if(!p)return
    const s=JSON.stringify(pick(p)),h=hr.current
    if(h.cur===null||h.skip){h.cur=s;h.skip=false;return}
    if(s===h.cur)return
    if(h.base===null)h.base=h.cur
    h.latest=s;clearTimeout(h.t)
    h.t=setTimeout(()=>{h.past.push(h.base);if(h.past.length>50)h.past.shift();h.future=[];h.cur=h.latest;h.base=null;h.t=null;setHv(v=>v+1)},500)
  },[p])
  useEffect(()=>{if(!auto||!dirty||saving)return;const t=setTimeout(()=>{if(act.current.save)act.current.save()},2500);return()=>clearTimeout(t)},[auto,dirty,p])
  useEffect(()=>{const k=e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey){if(act.current.redo)act.current.redo()}else{if(act.current.undo)act.current.undo()}}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[])
  async function check(v){const u=v.toLowerCase();setName(v);if(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(u)||RESERVED.includes(u)){setAvail(u?'Use 1-20 letters, numbers or _':'');return}const r=await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('username',u);setAvail(r.count>0?'Taken':'Available ✓')}
  async function claim(){
    const u=name.toLowerCase()
    if(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(u)||RESERVED.includes(u))return setMsg('Use 1-20 letters, numbers or _ (that name is not allowed)')
    const m=user.user_metadata||{}
    const r=await supabase.from('profiles').insert({id:user.id,username:u,display_name:m.full_name||u,avatar_url:m.avatar_url||null}).select().single()
    if(r.error)return setMsg(r.error.code==='23505'?'That username is taken':r.error.message)
    setP(r.data);setOrig(JSON.stringify(pick(r.data)));setMsg('')
  }
  async function save(){
    const b=pick(p)
    for(const k of ['avatar_url','banner_url','bg_url','music_url']){if(b[k]&&!/^https?:\/\//i.test(b[k]))return setMsg('That link must start with https://')}
    if(b.music_url&&!AUDIO.test(b.music_url))return setMsg('Music must be a direct audio file (.mp3, .wav, .ogg, .m4a, .aac)')
    for(const l of b.links){if((l.url&&!/^https?:\/\//i.test(l.url))||(l.thumb&&!/^https?:\/\//i.test(l.thumb)))return setMsg('Link and thumbnail URLs must start with https://')}
    setSaving(true)
    const r=await supabase.from('profiles').update(b).eq('id',user.id)
    setSaving(false)
    if(r.error)return setMsg('Could not save: '+r.error.message)
    setOrig(JSON.stringify(b));setMsg('Saved ✓')
  }
  async function up(file,kind,field){
    if(!file)return
    if(file.size>(kind==='audio'?15e6:kind==='bg'?30e6:kind==='banner'?10e6:5e6))return setMsg('File too large')
    setMsg('Uploading…')
    const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')
    const path=user.id+'/'+kind+'-'+Date.now()+'.'+ext
    const r=await supabase.storage.from('media').upload(path,file,{upsert:true})
    if(r.error)return setMsg(r.error.message)
    set(field,supabase.storage.from('media').getPublicUrl(path).data.publicUrl);setMsg('Uploaded ✓ Now press Save')
  }
  async function rename(){
    if(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(nu)||RESERVED.includes(nu))return setMsg('Use 1-20 letters, numbers or _ (that name is not allowed)')
    const r=await supabase.rpc('change_username',{new_name:nu})
    if(r.error)return setMsg(r.error.code==='23505'?'That username is taken':r.error.message)
    if(!r.data)return setMsg('Not allowed: the name is reserved or you changed it in the last 14 days')
    setP(o=>({...o,username:r.data}));setNu('');setMsg('Username changed ✓')
  }
  async function testDc(){
    if(!p.discord_id)return setMsg('Enter your Discord user ID first')
    try{const j=await (await fetch('https://api.lanyard.rest/v1/users/'+encodeURIComponent(p.discord_id))).json();setDc(j.success?j.data:null);setMsg(j.success?'Discord connected ✓ ('+j.data.discord_status+')':'Not found. Join discord.gg/lanyard first, then try again.')}catch(e){setMsg('Could not reach Lanyard')}
  }
  if(!ready)return <div className="box">Loading…</div>
  if(!p)return(<div className="box"><h1>Claim your link</h1><label>nyz.lol/</label><input value={name} onChange={e=>check(e.target.value)} placeholder="yourname"/><small style={{color:'var(--mute)'}}>{avail}</small>
    <button className="btn wide" onClick={claim}>Claim it</button><div className="msg">{msg}</div></div>)
  const set=(k,v)=>setP(o=>({...o,[k]:v})),links=p.links||[]
  const fx=Object.assign({},FXD,p.fx||{}),setFx=(k,v)=>set('fx',{...fx,[k]:v})
  const setLink=(i,k,v)=>set('links',links.map((l,j)=>j===i?{...l,[k]:v}:l))
  const dup=i=>{const a=[...links];a.splice(i+1,0,{...links[i]});set('links',a)}
  const mv=(i,d)=>{const a=[...links],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];set('links',a)}
  const drop=i=>{if(drag===null||drag===i)return;const a=[...links],m=a.splice(drag,1)[0];a.splice(i,0,m);set('links',a);setDrag(null)}
  const reset=()=>setP(o=>({...o,...JSON.parse(orig)}))
  const apply=js=>{hr.current.skip=true;hr.current.cur=js;setP(o=>({...o,...JSON.parse(js)}))}
  const flush=()=>{const h=hr.current;if(h.t){clearTimeout(h.t);h.t=null}if(h.base!==null){h.past.push(h.base);h.future=[];h.cur=h.latest;h.base=null}}
  const undo=()=>{flush();const h=hr.current;if(!h.past.length)return;const prev=h.past.pop();h.future.push(h.cur);apply(prev);setHv(v=>v+1)}
  const redo=()=>{flush();const h=hr.current;if(!h.future.length)return;const nx=h.future.pop();h.past.push(h.cur);apply(nx);setHv(v=>v+1)}
  const toggleAuto=()=>{const v=!auto;setAuto(v);try{localStorage.setItem('nyz_auto',v?'1':'0')}catch(e){}}
  act.current={undo,redo,save}
  async function makeQr(){try{const QR=(await import('qrcode')).default;setQr(await QR.toDataURL(location.origin+'/'+p.username,{margin:2,width:512,color:{dark:'#0A0A0C',light:'#FFFFFF'}}))}catch(e){setMsg('Could not create the QR code')}}
  async function delAcc(){const r=await supabase.rpc('delete_my_account');if(r.error)return setMsg('Could not delete your account: '+r.error.message);await supabase.auth.signOut();location.href='/'}
  const resetStyle=()=>setP(o=>({...o,theme:'crimson',c1:null,c2:null,bg_url:null,opacity:62,blur:22,shape:'circle',font:'syne',cur:'default',name_fx:'none',fx:{...fx,tilt:true,glow:true,type:true,aurora:true,parts:true,views:true,center:false,links:'grid',enter:'click to enter',presence:true,bpos:50,bw:1,bc:'',br:22,dim:50}}))
  const dsum=(a,b)=>{let t=0;for(let i=a;i<b;i++){const dt=new Date(Date.now()-i*864e5).toISOString().slice(0,10);t+=(p.daily||{})[dt]||0}return t}
  const cur=dsum(0,range),prev=dsum(range,range*2),chg=prev?Math.round((cur-prev)/prev*100):null
  const series=[...Array(range)].map((_,i)=>{const dt=new Date(Date.now()-(range-1-i)*864e5).toISOString().slice(0,10);return [dt.slice(5),(p.daily||{})[dt]||0]}),smx=Math.max(1,...series.map(x=>x[1]))
  const ser2=[...Array(range)].map((_,i)=>{const dt=new Date(Date.now()-(range-1-i)*864e5).toISOString().slice(0,10);return [dt.slice(5),evs.filter(x=>x.kind==='click'&&(x.created_at||'').slice(0,10)===dt).length]}),smx2=Math.max(1,...ser2.map(x=>x[1])),ctot=ser2.reduce((a,x)=>a+x[1],0)
  const ago=t=>{const m=Math.round((Date.now()-new Date(t).getTime())/6e4);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'}
  const applyTpl=t=>setP(o=>({...o,c1:null,c2:null,...t.d,fx:{...fx,...t.d.fx}}))
  const days7=[...Array(7)].map((_,i)=>{const dt=new Date(Date.now()-(6-i)*864e5).toISOString().slice(0,10);return [dt.slice(5),(p.daily||{})[dt]||0]}),mx=Math.max(1,...days7.map(x=>x[1]))
  const base=PRE[p.theme]||PRE.crimson
  const ck=l=>(p.clicks||{})[l.label||l.url]||0
  const clk=Object.values(p.clicks||{}).reduce((a,b)=>a+b,0),top=Object.entries(p.clicks||{}).sort((a,b)=>b[1]-a[1]).slice(0,5),hr=new Date().getHours(),greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening'
  const chk=[['Avatar',!!p.avatar_url,'Profile'],['Banner',!!p.banner_url,'Profile'],['Bio',!!p.bio,'Profile'],['Links',links.length>0,'Links'],['Music',!!p.music_url,'Media'],['Discord',!!p.discord_id,'Media']],pct=Math.round(chk.filter(c=>c[1]).length/chk.length*100)
  const copy=()=>{if(navigator.clipboard)navigator.clipboard.writeText(location.origin+'/'+p.username);setMsg('Link copied ✓')}
  const File=(label,kind,field)=><><label>{label}</label><div className="ad-f"><input value={p[field]||''} onChange={e=>set(field,e.target.value)} placeholder="https://..."/><button className="ad-b" onClick={()=>set(field,'')}>Remove</button></div><input type="file" onChange={e=>up(e.target.files[0],kind,field)} accept={kind==='audio'?'audio/*':kind==='bg'?'image/*,video/mp4,video/webm':'image/*'}/></>
  return(<div className="dash"><aside className="dn"><div className="dn-logo">nyz<i>.lol</i></div>{TABS.map(t=><button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}><span className="ic">{t[1]}</span>{t[0]}</button>)}<a href="/help">❔ Help</a><div className="dn-user"><b>{p.display_name||p.username}</b>@{p.username}<button onClick={()=>supabase.auth.signOut()}>Sign out</button></div></aside><div className="dmain">
    <h1>{tab}</h1><p><a href={'/'+p.username} style={{color:'var(--c2)'}}>nyz.lol/{p.username}</a> · {p.views} views</p>
    {tab==='Overview'&&<>
      <p style={{color:'var(--mute)',margin:'0 0 4px'}}>{greet}, {p.display_name||p.username}</p>
      <div className="chips">{[7,30,90].map(n=><button key={n} className={range===n?'on':''} onClick={()=>setRange(n)}>{n} days</button>)}</div>
      <div className="ov-cards">{[['Views ('+range+'d)',cur.toLocaleString('en-US'),chg===null?'No earlier data yet':(chg>=0?'↑ ':'↓ ')+Math.abs(chg)+'% vs previous '+range+' days'],['Link clicks',clk,'all time'],['Links',links.length,links.filter(l=>l.off).length+' hidden'],['All-time views',(parseInt(p.views)||0).toLocaleString('en-US'),'']].map(c=><div key={c[0]}><b>{c[1]}</b>{c[0]}<small>{c[2]}</small></div>)}</div>
      <label>Profile completion: {pct}%</label><div className="prog"><i style={{width:pct+'%'}}/></div>
      <div className="chips">{chk.map(c=><button key={c[0]} className={c[1]?'on':''} onClick={()=>setTab(c[2])}>{c[1]?'✓ ':'+ '}{c[0]}</button>)}</div>
      <label>Views per day</label>{cur===0?<small style={{color:'var(--mute)'}}>No views in this period yet. Share your link to get started.</small>:<div className="bars big">{series.map((x,i)=><div key={i} title={x[0]+': '+x[1]+' views'}><b>{x[1]}</b><i style={{height:(x[1]/smx*100)+'%'}}/><small>{i%Math.ceil(range/7)===0?x[0]:''}</small></div>)}</div>}
      <small style={{color:'var(--mute)'}}>Daily history starts from the day tracking was added.</small>
      <label>Clicks per day</label>{ctot===0?<small style={{color:'var(--mute)'}}>No tracked clicks in this period yet.</small>:<div className="bars big">{ser2.map((x,i)=><div key={i} title={x[0]+': '+x[1]+' clicks'}><b>{x[1]}</b><i style={{height:(x[1]/smx2*100)+'%'}}/><small>{i%Math.ceil(range/7)===0?x[0]:''}</small></div>)}</div>}
      <label>Recent activity</label>{evs.length===0?<small style={{color:'var(--mute)'}}>Nothing yet. Visits and clicks will appear here.</small>:evs.slice(0,8).map((x,i)=><div className="row2" key={i}><span>{x.kind==='view'?'👁 Someone viewed your page':'🔗 Link clicked: '+(x.label||'')}</span><small>{ago(x.created_at)}</small></div>)}
      <label>Top links</label>{top.length?top.map(x=><div className="row2" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>):<small style={{color:'var(--mute)'}}>No clicks yet</small>}
      <div className="row" style={{marginTop:16}}><a className="btn" href={'/'+p.username}>View my page</a><button className="btn ghost" onClick={copy}>Copy link</button><button className="btn ghost" onClick={makeQr}>QR code</button></div></>}
    {tab==='Profile'&&<>
      <label>Display name <span className="cnt">{(p.display_name||'').length}/40</span></label><input maxLength={40} value={p.display_name||''} onChange={e=>set('display_name',e.target.value)}/>
      <label>Location <span className="cnt">{(p.location||'').length}/40</span></label><input maxLength={40} value={p.location||''} onChange={e=>set('location',e.target.value)} placeholder="City, Country"/>
      <label>Bio <span className="cnt">{(p.bio||'').length}/300</span></label><textarea rows={3} maxLength={300} value={p.bio||''} onChange={e=>set('bio',e.target.value)}/>
      {File('Avatar image','avatar','avatar_url')}
      {File('Banner image (top of your card)','banner','banner_url')}
      <label>Banner position up/down: {fx.bpos}%</label><input type="range" min="0" max="100" value={fx.bpos} onChange={e=>setFx('bpos',+e.target.value)}/><label>Banner position left/right: {fx.bposx}%</label><input type="range" min="0" max="100" value={fx.bposx} onChange={e=>setFx('bposx',+e.target.value)}/>
      <label>Avatar zoom: {fx.az}%</label><input type="range" min="100" max="300" value={fx.az} onChange={e=>setFx('az',+e.target.value)}/><label>Avatar focus left/right: {fx.ax}%</label><input type="range" min="0" max="100" value={fx.ax} onChange={e=>setFx('ax',+e.target.value)}/><label>Avatar focus up/down: {fx.ay}%</label><input type="range" min="0" max="100" value={fx.ay} onChange={e=>setFx('ay',+e.target.value)}/>
      <label>Your link: nyz.lol/{p.username}</label><div className="ad-f"><input value={nu} onChange={e=>setNu(e.target.value.toLowerCase())} placeholder="new username" maxLength={20}/><button className="ad-b" onClick={rename}>Change</button></div><small style={{color:'var(--mute)'}}>You can change it once every 14 days.</small>
      <label>Visibility</label><div className="chips"><button className={p.private?'on':''} onClick={()=>set('private',!p.private)}>{p.private?'🔒 Private (nobody can open it)':'🌐 Public'}</button></div>
      <label style={{color:'var(--c2)'}}>Danger zone: delete my account</label><small style={{color:'var(--mute)'}}>This permanently deletes your page, links and profile data. It cannot be undone.</small><div className="ad-f"><input placeholder="Type DELETE to confirm" value={dz} onChange={e=>setDz(e.target.value)}/><button className="ad-b" disabled={dz!=='DELETE'} onClick={delAcc}>Delete</button></div></>}
    {tab==='Links'&&<>
      <label>Quick add</label><div className="chips">{QUICK.map(q=><button key={q[0]} onClick={()=>set('links',[...links,{label:q[0],url:q[1]}])}>+ {q[0]}</button>)}</div>
      <label>Your links (drag ⠿ or use arrows)</label>
      {links.length===0&&<small style={{color:'var(--mute)'}}>No links yet. Use Quick add above.</small>}
      {links.map((l,i)=>(<div className="lrow" key={i} draggable onDragStart={()=>setDrag(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(i)}>
        <span className="grip">⠿</span>
        <div className="lbody"><div className="row"><input placeholder="Label" value={l.label} onChange={e=>setLink(i,'label',e.target.value)}/><input placeholder="https://" value={l.url} onChange={e=>setLink(i,'url',e.target.value)}/></div>
          <input placeholder="Description (optional)" maxLength={60} value={l.desc||''} onChange={e=>setLink(i,'desc',e.target.value)}/>
          <div className="row"><input placeholder="Group (e.g. Socials)" maxLength={24} value={l.group||''} onChange={e=>setLink(i,'group',e.target.value)}/><input placeholder="Icon emoji" maxLength={2} value={l.icon||''} onChange={e=>setLink(i,'icon',e.target.value)}/></div>
          <input placeholder="Thumbnail image URL (optional)" value={l.thumb||''} onChange={e=>setLink(i,'thumb',e.target.value)}/>
          <div className="row"><div style={{flex:1}}><small>Show from</small><input type="datetime-local" value={l.start||''} onChange={e=>setLink(i,'start',e.target.value)}/></div><div style={{flex:1}}><small>Hide after</small><input type="datetime-local" value={l.end||''} onChange={e=>setLink(i,'end',e.target.value)}/></div></div></div>
        <div className="lact"><button className={'ad-b'+(l.off?'':' on')} onClick={()=>setLink(i,'off',!l.off)}>{l.off?'Hidden':'Visible'}</button><button className="ad-b" onClick={()=>setLink(i,'same',!l.same)}>{l.same?'Same tab':'New tab'}</button><span className="lc">{ck(l)} clicks</span><div><button className="ad-b" onClick={()=>mv(i,-1)}>↑</button> <button className="ad-b" onClick={()=>mv(i,1)}>↓</button> <button className="ad-b" title="Duplicate" onClick={()=>dup(i)}>⧉</button> <button className="ad-b" onClick={()=>set('links',links.filter((_,j)=>j!==i))}>✕</button></div></div></div>))}
      <button className="btn ghost wide" onClick={()=>set('links',[...links,{label:'',url:''}])}>+ Custom link</button></>}
    {tab==='Style'&&<>
      <label>Templates (tap to apply; Reset undoes it before you save)</label><div className="chips">{TPL.map(t=><button key={t.n} onClick={()=>applyTpl(t)}>{t.n}</button>)}</div>
      <label>Color presets</label><div className="chips">{Object.keys(PRE).map(k=><button key={k} className={p.theme===k&&!p.c1?'on':''} onClick={()=>setP(o=>({...o,theme:k,c1:null,c2:null}))}>{k}</button>)}</div>
      <label>Custom colors: {p.c1||base[0]} → {p.c2||base[1]}</label><div className="row"><input type="color" value={p.c1||base[0]} onChange={e=>set('c1',e.target.value)}/><input type="color" value={p.c2||base[1]} onChange={e=>set('c2',e.target.value)}/></div>
      {File('Background image or video (mp4, webm)','bg','bg_url')}
      <label>Background dimming: {fx.dim}%</label><input type="range" min="0" max="90" value={fx.dim} onChange={e=>setFx('dim',+e.target.value)}/>
      <label>Card opacity: {p.opacity==null?62:p.opacity}%</label><input type="range" min="20" max="95" value={p.opacity==null?62:p.opacity} onChange={e=>set('opacity',+e.target.value)}/>
      <label>Card blur: {p.blur==null?22:p.blur}px</label><input type="range" min="0" max="40" value={p.blur==null?22:p.blur} onChange={e=>set('blur',+e.target.value)}/>
      <label>Card border width: {fx.bw}px</label><input type="range" min="0" max="6" value={fx.bw} onChange={e=>setFx('bw',+e.target.value)}/>
      <label>Card corner radius: {fx.br}px</label><input type="range" min="0" max="40" value={fx.br} onChange={e=>setFx('br',+e.target.value)}/>
      <label>Border color</label><div className="ad-f"><input type="color" value={fx.bc||'#ffffff'} onChange={e=>setFx('bc',e.target.value)}/><button className="ad-b" onClick={()=>setFx('bc','')}>Use default</button></div>
      <label>Avatar shape</label><select value={p.shape||'circle'} onChange={e=>set('shape',e.target.value)}><option>circle</option><option>rounded</option><option>square</option></select>
      <label>Name font</label><select value={p.font||'syne'} onChange={e=>set('font',e.target.value)}><option>syne</option><option>manrope</option><option>mono</option><option>serif</option></select>
      <label>Name effect</label><select value={p.name_fx||'none'} onChange={e=>set('name_fx',e.target.value)}><option>none</option><option>glow</option><option>gradient</option><option>sparkle</option><option>glitch</option></select>
      <label>Cursor</label><select value={p.cur||'default'} onChange={e=>set('cur',e.target.value)}><option>default</option><option>crosshair</option><option>dot</option><option>ring</option></select>
      <label>Links layout</label><select value={fx.links} onChange={e=>setFx('links',e.target.value)}><option>grid</option><option>list</option><option>icons</option></select>
      <label>Enter screen text</label><input maxLength={30} value={fx.enter} onChange={e=>setFx('enter',e.target.value)}/>
      <label>Explore category (used when you list your page)</label><select value={fx.cat||''} onChange={e=>setFx('cat',e.target.value)}><option value="">None</option><option>gaming</option><option>music</option><option>creator</option><option>art</option><option>developer</option><option>other</option></select>
      <label>Effects (✓ = on)</label><div className="chips">{[['tilt','3D tilt'],['glow','Glow'],['type','Typewriter bio'],['aurora','Animated background'],['parts','Floating particles'],['views','Show views'],['presence','Discord card'],['center','Center header'],['explore','List on Explore']].map(f=><button key={f[0]} className={fx[f[0]]?'on':''} onClick={()=>setFx(f[0],!fx[f[0]])}>{fx[f[0]]?'✓ ':''}{f[1]}</button>)}</div>
      <button className="btn ghost wide" onClick={resetStyle}>Reset style to default</button></>}
    {tab==='Media'&&<>
      {File('Music (mp3, wav, ogg, m4a)','audio','music_url')}
      {p.music_url&&<audio controls preload="none" src={p.music_url} style={{width:'100%',marginTop:8}}/>}
      <label>Song title</label><input maxLength={50} value={fx.title} onChange={e=>setFx('title',e.target.value)}/>
      <label>Artist</label><input maxLength={50} value={fx.artist} onChange={e=>setFx('artist',e.target.value)}/>
      <label>Volume: {fx.vol}%</label><input type="range" min="0" max="100" value={fx.vol} onChange={e=>setFx('vol',+e.target.value)}/>
      <div className="chips" style={{marginTop:12}}><button className={fx.auto?'on':''} onClick={()=>setFx('auto',!fx.auto)}>{fx.auto?'✓ ':''}Start music when visitors enter</button></div>
      <label>Discord user ID (join discord.gg/lanyard for live status)</label><div className="ad-f"><input value={p.discord_id||''} onChange={e=>set('discord_id',e.target.value)}/><button className="ad-b" onClick={testDc}>Test</button></div>
      {dc&&<div className="dcp">{dc.discord_user&&dc.discord_user.avatar&&<img src={'https://cdn.discordapp.com/avatars/'+dc.discord_user.id+'/'+dc.discord_user.avatar+'.png?size=64'} alt=""/>}<div><b>{dc.discord_user?(dc.discord_user.global_name||dc.discord_user.username):'Discord'}</b><small>{dc.discord_status}{(dc.activities||[]).find(x=>x.type===0)?' · Playing '+dc.activities.find(x=>x.type===0).name:''}</small></div></div>}</>}
    {qr&&<div className="modal" role="dialog" aria-modal="true" aria-label="QR code" onClick={()=>setQr('')}><div className="modal-c" onClick={e=>e.stopPropagation()}><img src={qr} alt={'QR code for nyz.lol/'+p.username} width="256" height="256"/><p>nyz.lol/{p.username}</p><div className="row"><a className="btn" href={qr} download={'nyz-'+p.username+'-qr.png'}>Download PNG</a><button className="btn ghost" onClick={()=>setQr('')}>Close</button></div></div></div>}
    {msg&&<div className={'toast '+(/✓/.test(msg)?'ok':/…$/.test(msg)?'info':'err')} role="status"><span>{/✓/.test(msg)?'✓':/…$/.test(msg)?'⏳':'⚠'}</span><span>{msg}</span><button onClick={()=>setMsg('')} aria-label="Dismiss">✕</button></div>}
    <div className="sbar"><button className="ad-b" disabled={!hr.current.past.length} onClick={undo} title="Undo (Ctrl+Z)" aria-label="Undo">↶</button><button className="ad-b" disabled={!hr.current.future.length} onClick={redo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷</button>{saving?<span>Saving…</span>:dirty?<span>Unsaved changes</span>:<span style={{color:'var(--mute)'}}>All changes saved</span>}<button className={'ad-b'+(auto?' on':'')} onClick={toggleAuto} title="Save automatically after you stop editing">{auto?'✓ ':''}Autosave</button>{dirty&&<button className="btn ghost" onClick={reset}>Reset</button>}<button className="btn" disabled={!dirty||saving} onClick={()=>save()}>{saving?'Saving…':'Save changes'}</button></div>
  </div><div className={'dprev'+(full?' full':'')}><button className="pv-b" onClick={()=>setFull(!full)}>{full?'✕ Close':'⤢ Fullscreen'}</button><div className="phone"><ProfileCard p={p} preview/></div></div></div>)
}
