import sharp from "sharp";

export default async (req) => {
  try {
    const url=new URL(req.url);
    const remote=url.searchParams.get("url");
    if(!remote) return new Response("Missing url",{status:400});

    const parsed=new URL(remote);
    if(parsed.protocol!=="https:" || !parsed.hostname.endsWith("scdn.co")){
      return new Response("Artwork host not allowed",{status:403});
    }

    const source=await fetch(remote);
    if(!source.ok) return new Response("Artwork fetch failed",{status:502});

    const input=Buffer.from(await source.arrayBuffer());
    const output=await sharp(input)
      .resize(110,110,{fit:"cover"})
      .jpeg({quality:82,progressive:false,chromaSubsampling:"4:2:0"})
      .toBuffer();

    return new Response(output,{
      status:200,
      headers:{"Content-Type":"image/jpeg","Cache-Control":"public, max-age=3600"}
    });
  } catch(e){
    return new Response(String(e.message || e),{status:500});
  }
};
