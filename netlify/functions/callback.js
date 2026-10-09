import { config, stateStore, saveTokens } from "./_common.js";

export default async (req) => {
  const url=new URL(req.url);
  const code=url.searchParams.get("code");
  const state=url.searchParams.get("state");
  const error=url.searchParams.get("error");

  if(error) return new Response(`Spotify authorization failed: ${error}`,{status:400});
  if(!code || !state) return new Response("Missing code/state",{status:400});

  const store=stateStore();
  const saved=await store.get(state,{type:"json"});
  if(!saved || !saved.device || Date.now()-saved.createdAt>600000){
    return new Response("Invalid or expired state",{status:400});
  }
  await store.delete(state);

  const {clientId,clientSecret,redirectUri}=config();
  const basic=Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body=new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:redirectUri});

  const r=await fetch("https://accounts.spotify.com/api/token",{
    method:"POST",
    headers:{Authorization:`Basic ${basic}`,"Content-Type":"application/x-www-form-urlencoded"},
    body
  });

  if(!r.ok) return new Response(`Token exchange failed: ${r.status} ${await r.text()}`,{status:500});

  const tokens=await r.json();
  await saveTokens(saved.device,{
    access_token:tokens.access_token,
    refresh_token:tokens.refresh_token,
    scope:tokens.scope,
    expires_at:Date.now()+tokens.expires_in*1000-60000
  });

  return new Response("<h1>MusicCharm bağlı ✓</h1><p>Bu sekmeyi kapatabilirsin.</p>",{
    headers:{"Content-Type":"text/html; charset=utf-8"}
  });
};
