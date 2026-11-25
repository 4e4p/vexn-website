import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
const RES=['login','dashboard','api','admin','landing','privacy','terms','signin','signup','claim','demo','about','contact','faq','help','logout','features','pricing','sample','explore','reset-password','_next']
export async function GET(req){
  const u=(new URL(req.url).searchParams.get('u')||'').toLowerCase()
  const h={headers:{'Cache-Control':'no-store'}}
  if(!/^(?=.*[a-z0-9])[a-z0-9_]{1,20}$/.test(u))return Response.json({ok:false,msg:'Use 1-20 letters, numbers or _'},h)
  if(RES.includes(u))return Response.json({ok:false,msg:'That name is reserved'},h)
  try{
    const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key')
    const r=await sb.from('profiles').select('id',{count:'exact',head:true}).eq('username',u)
    if(r.error)throw r.error
    return Response.json(r.count>0?{ok:false,msg:'That name is taken'}:{ok:true,msg:'Available ✓'},h)
  }catch(e){return Response.json({ok:false,msg:'Could not check right now'},h)}
}
