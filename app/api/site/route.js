import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export async function GET(){
  try{
    const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key')
    const r=await sb.from('site_settings').select('announcement,announce_on,maintenance,maintenance_msg').eq('id',1).maybeSingle()
    return Response.json(r.data||{},{headers:{'Cache-Control':'public, s-maxage=60'}})
  }catch(e){return Response.json({})}
}
