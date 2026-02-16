[bookmark-app-aryan.vercel.app](https://bookmark-app-aryan.vercel.app)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## Deploy on Vercel

This Next.js app is deployed on vercel use  [Book Mark app](https://bookmark-app-aryan.vercel.app/) .

## Issues faced with deployment

### Supabase url config Issue
Problem: I had deployed the page to vercel but the issue is when i login using google it redirects to http://localhost:3000/?code=324f2f55-1c8d-4ec8-9778-a7000b43465e
which is utterly wrong... what  i did to correct this in the vercel production is:

Fix: The code uses location.origin, which should correctly use the production URL, but the issue was in the supabase url config where I had to add the vercel deployment url with the wildcard... which fixed the issue.

### Missing Auth Callback Route (404)
Problem: After clicking "Login with Google", the app redirected to /auth/callback which didn't exist, gives a 404 error.
Fix: Created app/auth/callback/route.ts  to handle the OAuth code exchange.

### Next.js Cookie Handling Erroe(TypeError)
Problem: The auth callback crashed with TypeError: cookieStore.get is not a function.
fix: In Next.js version15, cookies() is an asynchronous function, but we were treating it as synchronous. I updated code to "await cookies()" before using it.

### Real-time Updates Not Working (TIMED_OUT)
Problem: New bookmarks were not appearing instantly, and the console showed TIMED_OUT or WebSocket is closed.
Fix: React Strict Mode (in dev) was creating multiple conflicting WebSocket connections for the same channel name "schema-db-changes", causing Supabase to drop them.
Updated BookmarkManager.tsx to use a unique channel name per session (bookmarks-${user.id}-${Math.random()}), preventing conflicts during re-renders.


