import { accessToken, json } from "./_common.js";

export default async (req) => {
  try {
    const url=new URL(req.url);
    const device=url.searchParams.get("device");
    if(!device) return json(400,{error:"missing_device"});

    const token=await accessToken(device);
    if(!token) return json(401,{error:"device_not_authorized"});

    const r=await fetch("https://api.spotify.com/v1/me/player/currently-playing",{
      headers:{Authorization:`Bearer ${token}`}
    });

    if(r.status===204) return new Response(null,{status:204});
    if(!r.ok) return json(r.status,{error:"spotify_error",detail:await r.text()});

    const data=await r.json();
    if(!data.item) return new Response(null,{status:204});

    const artwork=data.item.album?.images?.[0]?.url || "";

    return json(200,{
      title:data.item.name || "",
      artist:(data.item.artists || []).map(a=>a.name).join(", "),
      album:data.item.album?.name || "",
      artwork,
      trackId:data.item.id || "",
      progressMs:data.progress_ms || 0,
      durationMs:data.item.duration_ms || 1,
      isPlaying:!!data.is_playing
    });
  } catch (e) {
    return json(500,{error:"server_error",detail:String(e.message || e)});
  }
};
