import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProfileCard from '../../components/ProfileCard'
export const dynamic='force-dynamic'
export async function generateMetadata({params}){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key')
  const {data}=await sb.from('profiles').select('username,display_name,bio,avatar_url,banner_url,hidden,private,theme,c2').eq('username',params.username.toLowerCase()).maybeSingle()
  if(!data||data.hidden||data.private)return{title:'Not found · nyz.lol'}
  const t=(data.display_name||data.username)+' (@'+data.username+') · nyz.lol',img=data.banner_url||data.avatar_url,d=data.bio||'Check out this page on nyz.lol',col=data.c2||({crimson:'#E0364F',gold:'#E6C27A',steel:'#B4C2D1',emerald:'#3FBF8F',violet:'#9C7BFF',ocean:'#35B6E8',rose:'#FF8FB1',mono:'#BDBDBD'}[data.theme]||'#E0364F')
  return{title:t,description:d,alternates:{canonical:'/'+data.username},other:{'theme-color':col},openGraph:{title:t,description:d,url:'/'+data.username,siteName:'nyz.lol',images:img?[img]:[],type:'profile'},twitter:{card:img?'summary_large_image':'summary',title:t,description:d,images:img?[img]:[]}}
}

export default async function Page({params}){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const u=params.username.toLowerCase()
  const {data}=await sb.from('profiles').select('username,display_name,bio,avatar_url,theme,music_url,discord_id,links,views,c1,c2,bg_url,opacity,blur,shape,font,fx,location,badges,name_fx,cur,hidden,plan,banner_url,private').eq('username',u).maybeSingle()
  if(!data||data.hidden||data.private)notFound()
  const st=await sb.from('site_settings').select('maintenance,maintenance_msg').eq('id',1).maybeSingle()
  if(st.data&&st.data.maintenance)return(<div className="box"><h1>Back soon</h1><p style={{color:'var(--mute)'}}>{st.data.maintenance_msg||'We are doing maintenance. Please check back shortly.'}</p></div>)
  const bdf=await sb.from('badges').select('name,icon,color,description')
  return <ProfileCard p={{...data,badgeDefs:bdf.data||[]}}/>
}
