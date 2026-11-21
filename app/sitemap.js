import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export default async function sitemap(){
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://vexn-website.vercel.app'
  let rows=[]
  try{const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key');const r=await sb.from('profiles').select('username').eq('hidden',false).limit(5000);rows=r.data||[]}catch(e){}
  return [{url:base},{url:base+'/privacy'},{url:base+'/terms'},...rows.map(r=>({url:base+'/'+r.username}))]
}
