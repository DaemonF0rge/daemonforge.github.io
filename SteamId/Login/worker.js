addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.has("openid.identity")) {
	  let sid = searchParams.get("openid.identity");
	  let idurl = new URL(sid);
	  let theID = idurl.pathname;
	  theID = theID.replace(/\//g, '');
	  theID = theID.replace(/[a-zA-Z]/g, '');
	  if (theID.length == 17) {
        let info = await fetch("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + STEAMKEY + "&steamids="+theID);
        let data = await info.json();
        if (data.response.players.length == 1) {
          let steamdata = data.response.players[0];
          if (steamdata.steamid !== undefined){
            let url = "https://daemonforge.dev/SteamId/?SteamId="+ theID +"&Avatar=" + steamdata.avatarmedium + "&Name=" + steamdata.personaname + "&country="+ steamdata.loccountrycode + "&Profile="+ steamdata.profileurl;
            return new Response('<html><head><title>Success</title></head><body style="background: #202b38; color: #dbdbdb;"><h1>Success</h1><script>window.location = "' + url + '"', {status: 302, headers: {"Content-Type": "text/html; charset=UTF-8", "Location": url}});
          } else {
            let errorMessage = "https://daemonforge.dev/SteamId/?error="+steamdata.error;
            return new Response('<html><head><title>Error</title></head><body style="background: #202b38; color: #dbdbdb;"><h1>Error</h1><p>' + data.error  + '</p><script>window.location = "https://daemonforge.dev/SteamId/?error=' + steamdata.error +'";</script>', {status: 302, headers: {"Location": errorMessage, "Content-Type": "text/html; charset=UTF-8"}});
          }
        } else {
          return new Response('<html><head><title>Error</title></head><body style="background: #202b38; color: #dbdbdb;"><h1>Error</h1><p>Invaild Response</p><script>window.location = "https://daemonforge.dev/SteamId/?error=Invaild+Response";</script>', {status: 302, headers: {"Location": "https://daemonforge.dev/SteamId/?error=Invaild+Response", "Content-Type": "text/html; charset=UTF-8"}});
        }
    } else {
      return new Response('<html><head><title>Error</title></head><body style="background: #202b38; color: #dbdbdb;"><h1>Error</h1><p>Invaild Response</p><script>window.location = "https://daemonforge.dev/SteamId/?error=Invaild+Response";</script>', {status: 302, headers: {"Location": "https://daemonforge.dev/SteamId/?error=Invaild+Response", "Content-Type": "text/html; charset=UTF-8"}});
    } 
  } else {
      return new Response('<html><head><title>Error</title></head><body style="background: #202b38; color: #dbdbdb;"><h1>Error</h1><p>Invaild Response</p><script>window.location = "https://daemonforge.dev/SteamId/?error=Invaild+Response";</script>', {status: 302, headers: {"Location": "https://daemonforge.dev/SteamId/?error=Invaild+Response", "Content-Type": "text/html; charset=UTF-8"}});
  }
}