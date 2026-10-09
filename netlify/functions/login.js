import crypto from "crypto";
import { config, stateStore } from "./_common.js";

export default async (req) => {
  const url=new URL(req.url);
  const device=url.searchParams.get("device");
  if(!device || device.length<12) return new Response("DEVICE_KEY too short",{status:400});

  const {clientId,redirectUri}=config();
  const state=crypto.randomBytes(24).toString("hex");
  await stateStore().setJSON(state,{device,createdAt:Date.now()});

  const auth=new URL("https://accounts.spotify.com/authorize");
  auth.searchParams.set("response_type","code");
  auth.searchParams.set("client_id",clientId);
  auth.searchParams.set("scope","user-read-currently-playing user-read-playback-state user-modify-playback-state");
  auth.searchParams.set("redirect_uri",redirectUri);
  auth.searchParams.set("state",state);

  return Response.redirect(auth.toString(),302);
};
