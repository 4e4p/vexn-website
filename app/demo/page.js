'use client'
import { useState } from 'react'
import ProfileCard from '../../components/ProfileCard'
const S={username:'yourname',display_name:'Your Name',bio:'designer · gamer · night owl',location:'Egypt',views:1284,badges:['Verified','OG'],links:[{label:'Instagram',url:'https://instagram.com'},{label:'TikTok',url:'https://tiktok.com'},{label:'YouTube',url:'https://youtube.com'},{label:'Discord',url:'https://discord.com'}]}
export default function Demo(){
  const [t,setT]=useState('crimson')
  return(<div style={{height:'100vh'}}><ProfileCard p={{...S,theme:t}} preview/>
    <div className="demo-bar">{['crimson','gold','steel','emerald','violet','ocean','rose','mono'].map(k=><button key={k} className={t===k?'on':''} onClick={()=>setT(k)}>{k}</button>)}<a className="btn" href="/login">Claim your link</a></div></div>)
}
