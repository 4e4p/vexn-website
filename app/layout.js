import './globals.css'
export const metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://vexn-website.vercel.app'),title:'nyz.lol',description:'One link for everything you are.',openGraph:{title:'nyz.lol',description:'One link for everything you are.'}}
export default function RootLayout({children}){return(<html lang="en"><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;600;800&display=swap"/></head><body>{children}</body></html>)}
