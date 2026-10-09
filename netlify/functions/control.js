import { accessToken, json } from "./_common.js";

export default async (req) => {
  try {
    const url=new URL(req.url);
    const device=url.searchParams.get("device");
    const action=url.searchParams.get("action");
    if(!device || !action) return json(400,{error:"missing_device_or_action"});

    const token=await accessToken(device);
    if(!token) return json(401,{error:"device_not_authorized"});

    let method, endpoint;
    if(action==="play"){ method="PUT"; endpoint="https://api.spotify.com/v1/me/player/play"; }
    else if(action==="pause"){ method="PUT"; endpoint="https://api.spotify.com/v1/me/player/pause"; }
    else if(action==="next"){ method="POST"; endpoint="https://api.spotify.com/v1/me/player/next"; }
    else if(action==="previous"){ method="POST"; endpoint="https://api.spotify.com/v1/me/player/previous"; }
    else return json(400,{error:"unsupported_action"});

    const r=await fetch(endpoint,{method,headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok && r.status!==204){
      return json(r.status,{error:"spotify_control_error",detail:await r.text()});
    }

    return json(200,{ok:true,action});
  } catch(e){
    return json(500,{error:"server_error",detail:String(e.message || e)});
  }
};
