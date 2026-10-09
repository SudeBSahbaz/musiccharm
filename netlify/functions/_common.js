import { getStore } from "@netlify/blobs";

export function config(){
  const clientId=Netlify.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret=Netlify.env.get("SPOTIFY_CLIENT_SECRET");
  const siteUrl=Netlify.env.get("SITE_URL");
  if(!clientId||!clientSecret||!siteUrl) throw new Error("Missing Spotify/Netlify environment variables");
  const clean=siteUrl.replace(/\/$/,"");
  return {clientId,clientSecret,siteUrl:clean,redirectUri:clean+"/.netlify/functions/callback"};
}

export function tokenStore(){
  return getStore({name:"musiccharm-tokens",consistency:"strong"});
}

export function stateStore(){
  return getStore({name:"musiccharm-states",consistency:"strong"});
}

export async function getTokens(device){
  return await tokenStore().get(device,{type:"json"});
}

export async function saveTokens(device,tokens){
  await tokenStore().setJSON(device,tokens);
}

export async function accessToken(device){
  let tokens=await getTokens(device);
  if(!tokens) return null;

  if(!tokens.expires_at || Date.now()>=tokens.expires_at){
    const {clientId,clientSecret}=config();
    const basic=Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const body=new URLSearchParams({grant_type:"refresh_token",refresh_token:tokens.refresh_token});
    const r=await fetch("https://accounts.spotify.com/api/token",{
      method:"POST",
      headers:{Authorization:`Basic ${basic}`,"Content-Type":"application/x-www-form-urlencoded"},
      body
    });
    if(!r.ok) throw new Error(`Spotify refresh failed: ${r.status} ${await r.text()}`);
    const fresh=await r.json();
    tokens={...tokens,access_token:fresh.access_token,refresh_token:fresh.refresh_token||tokens.refresh_token,expires_at:Date.now()+fresh.expires_in*1000-60000};
    await saveTokens(device,tokens);
  }

  return tokens.access_token;
}

export function json(status,obj){
  return new Response(JSON.stringify(obj),{
    status,
    headers:{"Content-Type":"application/json","Cache-Control":"no-store"}
  });
}
