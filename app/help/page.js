'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
const DOCS=[
['How do I claim a username?','Sign in with Discord or Google, then pick a name (1-20 letters, numbers or _) on the dashboard.'],
['How do I change my username?','Profile tab, then "Your link". You can change it once every 14 days.'],
['How do I add links?','Links tab: use Quick add or Custom link. Drag the handle or use the arrows to reorder. You can group, schedule, hide and duplicate links.'],
['How do I show my Discord status?','Join discord.gg/lanyard, paste your Discord user ID in the Media tab, press Test, then Save.'],
['How do I add music?','Media tab: upload an mp3, wav, ogg or m4a (up to 15 MB) or paste a direct audio link, then Save. Visitors press "click to enter" to start it.'],
['Why does it say Unsaved changes?','Nothing is saved until you press Save changes. Reset undoes edits since your last save.'],
['How do I make my page private?','Profile tab, then Visibility, then Private. Nobody can open a private page until you switch it back to Public.'],
['What are templates?','Style tab, then Templates, applies a ready-made look. Reset changes undoes it before you save.'],
['How are views and clicks counted?','One view per visitor every 30 minutes. Repeated clicks on the same link within 10 seconds are ignored.'],
['How do I get a badge?','Badges are given by the owner.'],
['How do I list my page on Explore?','Style tab, then Effects, then List on Explore.'],
['How do I report a page?','Use the Report link at the bottom of that page.'],
['How do I delete my account?','Dashboard, Profile tab, Danger zone at the bottom. It permanently deletes your page and data.'],
]
export default function Help(){
  const [q,setQ]=useState(''),[kind,setKind]=useState('bug'),[msg,setMsg]=useState(''),[contact,setContact]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false)
  const list=DOCS.filter(d=>(d[0]+' '+d[1]).toLowerCase().includes(q.toLowerCase()))
  async function send(){
    if(msg.trim().length<10)return setNote('Please write at least 10 characters.')
    setBusy(true)
    const r=await supabase.from('feedback').insert({kind,message:msg.trim().slice(0,1000),contact:contact.trim().slice(0,100)||null})
    setBusy(false)
    if(r.error)return setNote('Could not send right now. Please try again later.')
    setMsg('');setContact('');setNote('Thanks, we received your message ✓')
  }
  return(<div className="legal"><a href="/">← nyz.lol</a><h1>Help</h1>
    <input placeholder="Search help…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search help"/>
    {list.length===0&&<p>No results. Send us a message below.</p>}
    {list.map(d=><div key={d[0]}><h2>{d[0]}</h2><p>{d[1]}</p></div>)}
    <h2 style={{marginTop:36}}>Report a bug or send feedback</h2>
    <select value={kind} onChange={e=>setKind(e.target.value)}><option value="bug">Bug</option><option value="idea">Idea</option><option value="help">I need help</option></select>
    <label>Message</label><textarea rows={4} maxLength={1000} value={msg} onChange={e=>setMsg(e.target.value)}/>
    <label>Contact (optional)</label><input maxLength={100} value={contact} onChange={e=>setContact(e.target.value)} placeholder="Discord or email"/>
    <button className="btn wide" disabled={busy} onClick={send}>{busy?'Sending…':'Send'}</button><div className="msg">{note}</div></div>)
}
