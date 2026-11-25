import { createClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export const metadata={title:'Explore · nyz.lol',description:'Discover people on nyz.lol'}
const CATS=['gaming','music','creator','art','developer','other']
const PER=24
export default async function Explore({searchParams}){
  const q=String(searchParams.q||'').replace(/[%,()*\\]/g,'').trim().slice(0,30)
  const sort=searchParams.sort==='new'?'new':'views'
  const cat=CATS.includes(searchParams.cat)?searchParams.cat:''
  const page=Math.max(1,parseInt(searchParams.page)||1)
  let rows=[],more=false,err=false
  try{
    const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://placeholder.supabase.co',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'placeholder-key')
    let qb=sb.from('profiles').select('username,display_name,avatar_url,bio,views,created_at').eq('hidden',false).eq('private',false).filter('fx->>explore','eq','true')
    if(cat)qb=qb.filter('fx->>cat','eq',cat)
    if(q)qb=qb.or('username.ilike.*'+q+'*,display_name.ilike.*'+q+'*')
    const r=await qb.order(sort==='new'?'created_at':'views',{ascending:false}).range((page-1)*PER,page*PER)
    if(r.error)throw r.error
    rows=r.data||[];more=rows.length>PER;rows=rows.slice(0,PER)
  }catch(e){err=true}
  const href=n=>'/explore?'+new URLSearchParams({q,cat,sort,page:String(n)}).toString()
  return(<div className="legal" style={{maxWidth:980}}><a href="/">← nyz.lol</a><h1>Explore</h1><p>Pages from people who chose to be listed.</p>
    <form method="get" className="xf" role="search"><input name="q" defaultValue={q} placeholder="Search by name…" aria-label="Search"/>
      <select name="cat" defaultValue={cat} aria-label="Category"><option value="">All categories</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
      <select name="sort" defaultValue={sort} aria-label="Sort"><option value="views">Most viewed</option><option value="new">Newest</option></select>
      <button className="btn">Search</button></form>
    {err&&<p>Could not load profiles right now. Please try again later.</p>}
    {!err&&rows.length===0&&<p>{q||cat?'No profiles match your search.':'No one is listed yet. Turn on “List on Explore” in the Style tab of your dashboard.'}</p>}
    {rows.length>0&&<div className="xp">{rows.map(x=><a key={x.username} href={'/'+x.username} className="xc"><span className="xa">{x.avatar_url?<img src={x.avatar_url} alt="" loading="lazy"/>:x.username[0]}</span><span className="xt"><b>{x.display_name||x.username}</b><small>@{x.username} · {(x.views||0).toLocaleString('en-US')} views</small>{x.bio&&<small className="xb">{x.bio}</small>}</span></a>)}</div>}
    {(page>1||more)&&<div className="xpg">{page>1&&<a className="btn ghost" href={href(page-1)}>← Previous</a>}<span>Page {page}</span>{more&&<a className="btn ghost" href={href(page+1)}>Next →</a>}</div>}</div>)
}
