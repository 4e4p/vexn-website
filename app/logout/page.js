'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
export default function Logout(){useEffect(()=>{supabase.auth.signOut().then(()=>{location.href='/'})},[]);return <div className="box">Signing out…</div>}
