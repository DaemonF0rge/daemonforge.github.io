addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {

const { searchParams } = new URL(request.url)
  let name = searchParams.get('name')
  //console.log(request);
  let response = await fetch("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key="+ STEAMKEY +"&vanityurl=" + name);
  let data = await response.json();
  //console.log(data);
  if (data.response.steamid !== undefined){
    let steaminfo = await fetch("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+ STEAMKEY +"&steamids="+data.response.steamid);
    let steamdata = await steaminfo.json();
    //console.log(steamdata.response.players[0]);
    return new Response(JSON.stringify(steamdata.response.players[0], null, 0), {status: 200, headers: {"content-type": "application/json;charset=UTF-8"}})
  } else {
    let theerror = { "error": "No Steam Profile Match." }
      return new Response(JSON.stringify(theerror, null, 0), {status: 200, headers: {"content-type": "application/json;charset=UTF-8"}})
  }
}

