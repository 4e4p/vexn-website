import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProfileCard from '../../components/ProfileCard'
export const dynamic='force-dynamic'
export async function generateMetadata({params}){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key')
  const {data}=await sb.from('profiles').select('username,display_name,bio,avatar_url,banner_url,hidden').eq('username',params.username.toLowerCase()).maybeSingle()
  if(!data||data.hidden)return{title:'Not found · nyz.lol'}
  const t=(data.display_name||data.username)+' (@'+data.username+') · nyz.lol',img=data.banner_url||data.avatar_url,d=data.bio||'Check out this page on nyz.lol'
  return{title:t,description:d,openGraph:{title:t,description:d,images:img?[img]:[],type:'profile'},twitter:{card:img?'summary_large_image':'summary',title:t,description:d,images:img?[img]:[]}}
}

export default async function Page({params}){
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const u=params.username.toLowerCase()
  const {data}=await sb.from('profiles').select('username,display_name,bio,avatar_url,theme,music_url,discord_id,links,views,c1,c2,bg_url,opacity,blur,shape,font,fx,location,badges,name_fx,cur,hidden,plan,banner_url').eq('username',u).maybeSingle()
  if(!data||data.hidden)notFound()
  return <ProfileCard p={data}/>
}
