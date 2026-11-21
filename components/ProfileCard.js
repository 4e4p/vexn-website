'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
const T={crimson:['#8E1230','#E0364F'],gold:['#9C7020','#E6C27A'],steel:['#4A5766','#B4C2D1'],emerald:['#0B5B43','#3FBF8F'],violet:['#4B2BA8','#9C7BFF'],ocean:['#0B4F8A','#35B6E8'],rose:['#9D2B5B','#FF8FB1'],mono:['#2B2B2B','#BDBDBD']}
const IC={discord:'💬',instagram:'📸',tiktok:'🎵',youtube:'▶️',twitter:'𝕏',x:'𝕏',github:'💻',twitch:'🎮',spotify:'🎧',snapchat:'👻',telegram:'✈️'}
const icon=u=>{const k=Object.keys(IC).find(k=>(u||'').toLowerCase().includes(k));return k?IC[k]:'🔗'}
const safe=u=>/^https?:\/\//i.test(u)?u:'#'
const FONTS={syne:'Syne,Manrope,sans-serif',manrope:'Manrope,sans-serif',mono:'ui-monospace,Menlo,monospace',serif:'Georgia,serif'}
const BI={verified:['✓','#3b82f6'],premium:['★','#e0a82e'],og:['◆','#8b5cf6'],staff:['⚑','#ef4444'],creator:['✦','#ec4899'],partner:['♥','#10b981']}
const RAD={circle:'50%',rounded:'26%',square:'10px'}
const CUR={crosshair:'crosshair',dot:'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'><circle cx=\'8\' cy=\'8\' r=\'5\' fill=\'white\' stroke=\'black\'/></svg>") 8 8, auto',ring:'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\'><circle cx=\'14\' cy=\'14\' r=\'10\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'/></svg>") 14 14, auto'}
export default function ProfileCard({p,preview}){
  const [on,setOn]=useState(!!preview),[d,setD]=useState(null),[views,setViews]=useState(p.views||0),[play,setPlay]=useState(false),[pr,setPr]=useState(0),[typed,setTyped]=useState('')
  const [cp,setCp]=useState(false),[dots,setDots]=useState([]),a=useRef(null),fx=Object.assign({tilt:true,glow:true,type:true,aurora:true,parts:true,views:true,center:false,links:'grid',enter:'click to enter',presence:true},p.fx||{})
  const [c1,c2]=p.c1&&p.c2?[p.c1,p.c2]:(T[p.theme]||T.crimson)
  useEffect(()=>{if(preview)return;const k='v_'+p.username;if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');supabase.rpc('increment_views',{u:p.username}).then(()=>setViews(v=>v+1))}},[p.username,preview])
  useEffect(()=>{
    if(!p.discord_id)return
    const f=()=>fetch('https://api.lanyard.rest/v1/users/'+encodeURIComponent(p.discord_id)).then(r=>r.json()).then(j=>j.success?setD(j.data):setD(null)).catch(()=>{})
    f();const t=setInterval(f,30000);return()=>clearInterval(t)
  },[p.discord_id])
  useEffect(()=>{if(!on)return;const t=p.bio||'';if(!fx.type||preview){setTyped(t);return}let i=0;const h=setInterval(()=>{i++;setTyped(t.slice(0,i));if(i>=t.length)clearInterval(h)},45);return()=>clearInterval(h)},[on,p.bio,fx.type,preview])
  useEffect(()=>{setDots([...Array(22)].map(()=>({l:Math.random()*100,s:3+Math.random()*7,d:9+Math.random()*12,dl:Math.random()*20,r:Math.random()<.5?'50%':'2px'})))},[])
  async function report(){const r=prompt('What is wrong with this page?');if(!r||r.trim().length<3)return;const x=await supabase.from('reports').insert({username:p.username,reason:r.trim().slice(0,500)});alert(x.error?'Could not send the report.':'Thanks, we will review it.')}
  function enter(){setOn(true);if(a.current)a.current.play().then(()=>setPlay(true)).catch(()=>{})}
  function toggle(){const x=a.current;if(!x)return;if(x.paused){x.play();setPlay(true)}else{x.pause();setPlay(false)}}
  const du=d&&d.discord_user,game=d&&d.activities&&d.activities.find(x=>x.type===0)
  const col={online:'#3DDC84',idle:'#F5B942',dnd:'#E0364F',offline:'#6b6b6b'}[(d&&d.discord_status)||'offline']
  const av=p.avatar_url?<img src={p.avatar_url} alt=""/>:<div>{(p.username||'?')[0]}</div>
  const tilt=e=>{if(!fx.tilt)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5,s=e.currentTarget.style;s.setProperty('--ry',x*16+'deg');s.setProperty('--rx',-y*16+'deg');s.setProperty('--gx',(x+.5)*100+'%');s.setProperty('--gy',(y+.5)*100+'%')}
  const flat=e=>{e.currentTarget.style.setProperty('--ry','0deg');e.currentTarget.style.setProperty('--rx','0deg')}
  const isVid=/\.(mp4|webm)(\?|$)/i.test(p.bg_url||''),bg=p.bg_url&&!isVid&&/^https?:\/\//i.test(p.bg_url)?{backgroundImage:'url("'+p.bg_url.replace(/"/g,'%22')+'")',backgroundSize:'cover',backgroundPosition:'center'}:{}
  const bd=(p.plan==='premium'&&!(p.badges||[]).includes('Premium')?['Premium']:[]).concat(p.badges||[])
  const bn=p.banner_url&&/^https?:\/\//i.test(p.banner_url)?{backgroundImage:'url("'+p.banner_url.replace(/"/g,'%22')+'")'}:{}
  const gl=fx.glow?'0 30px 80px -30px '+c1:'none',cs={background:'rgba(14,10,22,'+((p.opacity==null?62:p.opacity)/100)+')',backdropFilter:'blur('+(p.blur==null?22:p.blur)+'px)',WebkitBackdropFilter:'blur('+(p.blur==null?22:p.blur)+'px)',boxShadow:gl}
  return(<div className={'pg'+(preview?' pv':'')} style={Object.assign({'--c1':c1,'--c2':c2,'--rad':RAD[p.shape]||'50%',cursor:CUR[p.cur]},bg)} onMouseMove={tilt} onMouseLeave={flat}>
    {isVid&&<video className="pg-vid" src={p.bg_url} autoPlay muted loop playsInline/>}{p.bg_url&&<div className="pg-dim"/>}
    {fx.aurora&&<><div className="aur a1"/><div className="aur a2"/></>}
    <div className="pf-dots">{(fx.parts?dots:[]).map((o,i)=><i key={i} style={{left:o.l+'%',width:o.s,height:o.s,borderRadius:o.r,animationDuration:o.d+'s',animationDelay:'-'+o.dl+'s'}}/>)}</div>
    {!on&&<div className="pg-enter" onClick={enter}>{p.avatar_url&&<img src={p.avatar_url} alt=""/>}<span>{fx.enter||'click to enter'}</span></div>}
    {p.music_url&&!preview&&<audio ref={a} src={safe(p.music_url)} loop onTimeUpdate={e=>setPr(e.target.currentTime/(e.target.duration||1)*100)}/>}
    {p.music_url&&!preview&&<button className="pf-snd" onClick={toggle} aria-label="Sound">{play?'🔊':'🔇'}</button>}
    <div className="pf-wrap" key={on?'on':'off'}>
      <div className="pf-card" style={cs}>
        <div className="pf-ban" style={bn}/>
        <div className="pf-body">
          <div className={'pf-head'+(fx.center?' ctr':'')}><div className="pg-ring" data-g={fx.glow?1:0}>{av}</div>
            <div className="pf-id"><h1 className={'nf-'+(p.name_fx||'none')} style={{fontFamily:FONTS[p.font]||FONTS.syne}}>{p.display_name||p.username}<span className="pf-bd">{bd.map((b,i)=>{const m=BI[b.toLowerCase()]||[b[0].toUpperCase(),'#6b7280'];return <i key={i} title={b} style={{background:m[1]}}>{m[0]}</i>})}</span></h1>
              <div className="pf-meta">{fx.views&&<span>👁 {views.toLocaleString('en-US')}</span>}{p.location&&<span>📍 {p.location}</span>}<span>@{p.username}</span></div></div></div>
          <p className="pf-bio">{typed}</p>
          <div className={'pf-links l-'+fx.links}>{(p.links||[]).filter(l=>l.url).map((l,i)=><a className="pf-lk" key={i} style={{'--i':i}} href={safe(l.url)} target="_blank" rel="noopener noreferrer" onClick={()=>{if(!preview)supabase.rpc('track_click',{u:p.username,k:l.label||l.url}).then(()=>{})}}><span className="pf-ic">{icon(l.url)}</span><span>{l.label||l.url}</span></a>)}</div>
        </div></div>
      {d&&fx.presence&&<div className="pf-disc" style={bn}><div className="pf-dov"/><div className="pf-di">{du&&du.avatar&&<img src={'https://cdn.discordapp.com/avatars/'+du.id+'/'+du.avatar+'.png?size=64'} alt=""/>}<div><b>{du?(du.global_name||du.username):'Discord'}</b><small>{game?'Playing '+game.name:d.discord_status}</small></div><i style={{background:col}}/></div><em>DISCORD</em></div>}
      <div className="pf-foot">{!preview&&<button className="pf-share" onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText(location.origin+'/'+p.username);setCp(true);setTimeout(()=>setCp(false),1600)}}>{cp?'Link copied ✓':'🔗 Copy link'}</button>}<div>nyz.lol · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>{!preview&&<> · <button className="pf-rep" onClick={report}>Report</button></>}</div></div>
    </div></div>)
}
