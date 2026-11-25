const CONTACT='YOUR_EMAIL_HERE'
export const metadata={title:'Privacy Policy · nyz.lol'}
export default function Page(){return(<div className="legal"><a href="/" style={{color:'var(--c2)'}}>← nyz.lol</a><h1>Privacy Policy</h1><p><small>Last updated: November 21, 2026</small></p><h2>What we collect</h2><ul><li>When you sign up or sign in: your email address, and your username and avatar if you use Discord or Google. Passwords are stored only in hashed form by our authentication provider (Supabase).</li><li>What you add to your page: name, bio, links, images, music and your Discord user ID.</li><li>Anonymous counts: page views and link clicks.</li></ul>
<h2>How it is used</h2><p>To run your page and show it to visitors. Your profile page is public by design: anyone with the link can see what you put on it. We do not sell your data.</p>
<h2>Who else handles data</h2><ul><li>Supabase stores accounts, profiles and uploads.</li><li>Vercel hosts the website.</li><li>If you add a Discord ID, visitors load your status from the Lanyard service.</li></ul>
<h2>Your choices</h2><p>You can edit or remove content on your page any time. You can delete your account from your dashboard (Profile tab, Danger zone). This removes your page, links and profile data. Files you uploaded may take longer to be removed from storage. You can also contact us at {CONTACT}.</p>
<h2>Children</h2><p>nyz.lol is not for children under 13.</p>
<h2>Contact</h2><p>{CONTACT}</p></div>)}
