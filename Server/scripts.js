let allOfTheDom = [
                "servername",
                "serverip",
                "query_port",
                "game_port",
                "status",
                "name",
                "version",
                "players",
                "queue",
                "max_players",
                "time",
                "first_person",
                "map",
                "day_time_acceleration",
                "night_time_acceleration",
                "password",
                "battleye",
                "vac",
                "dlc_enabled",
                "modcount",
                "filesize",
                "ModData",
                "day_acceleration",
                "night_acceleration"
            ];

const NightRef = {
    namalsk: 14.765,
    chernarus: 14.765,
    chernarusplus: 14.765,
    epochs: 12.035,
    deerilse: 11.68
};


let ServerData = document.getElementById("ServerData");
let ip = document.getElementById("ip");
let port = document.getElementById("port");
let lookup = document.getElementById("lookup");
let loading = document.getElementById("loading");
let statusicon = document.getElementById("statusicon");

function updateHtml(element, text){
    let DomObj = document.getElementById(element);
    if (DomObj !== undefined && DomObj !== null){
        if (text === true){
            DomObj.innerHTML = "Yes";
        } else if (text === false){
            DomObj.innerHTML = "No";
        } else {
            DomObj.innerHTML = text;
        }
    }
}

function Clear(){
    for(domele of allOfTheDom){
        updateHtml(domele, "&nbsp;")
    }
    loading.style.display="none";
    lookup.style.display="inline-block";
    ServerData.style.display = "none";
}
function ValidateIPaddress(ipaddress) 
{
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
    {
        return (true)
    }
    return (false)
}

function ValidatePort(port) 
{
    if (/[0-9]{1,7}/.test(port))
    {
        return (true)
    }
    return (false)
}
async function LookUpServer(){
    ip.style.animation = null;
    port.style.animation = null;
    loading.style.display="inline-block";
    lookup.style.display="none";
    let theIp = ip.value;
    let thePort = port.value;
    if (thePort == ""){
        thePort = "27016";
    }
    if (theIp != "" && ValidateIPaddress(theIp) && ValidatePort(thePort)){
        try{
            let data = await fetch("https://api.daemonforge.dev/server/" +theIp+"/"+thePort+"/full" ) .then( response => response.json() );
            Clear();
            console.log(data);
            if (data.status !== undefined){
                ServerData.style.display="block";
                if (data.status == "online"){
                    statusicon.style.color = "green";
                    updateHtml("servername", data.name);
                    updateHtml("serverip", data.ip);
                    updateHtml("modcount", "Mods Count: " + data.mods.length);
                    let NiceModsDownloadSize = bytesToSize(data.ModsDownloadSize);
                    updateHtml("filesize", "Total Mods Size: " + NiceModsDownloadSize);
                    if (NightRef[data.map.toLowerCase()] !== undefined){
                        let NightHours = NightRef[data.map.toLowerCase()];
                        let DayTimeHours = 24 - NightRef[data.map];
                        let dayAcceleration = Math.round(DayTimeHours / data.day_time_acceleration * 100) / 100;
                        let nightAcceleration = Math.round(NightHours / data.day_time_acceleration / data.night_time_acceleration * 100) / 100;
                        let dayhr = Math.floor(dayAcceleration);
                        let daymin = Math.floor(((dayAcceleration) % 1) * 60);
                        let nighthr = Math.floor(nightAcceleration);
                        let nightmin = Math.floor(((nightAcceleration) % 1) * 60);
                        updateHtml("day_acceleration", `Aprox.: ${dayhr}hr ${daymin}min<sup><a href="#timeinfo">1</a></sup>` );
                        updateHtml("night_acceleration", `Aprox.:  ${nighthr}hr ${nightmin}min<sup><a href="#timeinfo">1</a></sup>`);
                    }

                } else {
                    statusicon.style.color = "red";
                    updateHtml("servername", "Server Not Found Or Offline");
                    updateHtml("serverip", data.ip);
                    updateHtml("query_port", data.query_port);
                    return;
                }
                theKeys = Object.keys(data);
                for (key of theKeys){
                    updateHtml(key, data[key]);
                }
                let contents = "";
                let i = 0;
                for(mod of data.mods){
                    i++;
                    //console.log(mod)
                    let description = ParseMarkup(mod.description);
                    
                    let niceSize = bytesToSize(mod.size);
                    
                    var DateCreated = new Date(mod.created * 1000);
                    var LastUpdated = new Date(mod.updated * 1000);
                    contents+= `<details style="width: 98%; margin: 2px;"> 
                    <summary>${mod.name}</summary> 
                    <img class="modimage" src="${mod.image_url}"/>
                    <table style="1px solid #dbdbdb">
                        <tr>
                            <td>Creator</td>
                            <td colspan="2" id="creator${i}" >${mod.creator}</td>
                        </tr>
                        <tr>
                            <td>Mod Id</td>
                            <td colspan="2" >${mod.id}</td>
                        </tr>
                        <tr>
                          <td>File Size</td>
                          <td colspan="2" >${niceSize}</td>
                        </tr>
                        <tr>
                          <td>Created</td>
                          <td colspan="2" >${FormatTheDate(DateCreated)}</td>
                        </tr>
                        <tr>
                          <td>Last Updated</td>
                          <td colspan="2" >${FormatTheDate(LastUpdated)}</td>
                        </tr>
                        <tr>
                          <td>Subscriptions</td>
                          <td colspan="2" >${mod.subscriptions}</td>
                        </tr>
                    </table>
                    <p>
                        ${description}
                    </p>
                </details>
                `
                let creatorid = "creator"+i;
                fetch(`https://api.daemonforge.dev/user/${mod.creator}`).then( userresponse => userresponse.json().then( userdata => updateCreator(creatorid, userdata) ).catch(e=>console.log(e))).catch( e => console.log(e))

                }
                updateHtml("ModData", contents);
                loading.style.display="none";
                lookup.style.display="inline-block";
            } else {
                throw("Invaild Reponse from server")
            }
        } catch (error) {
            console.log(error);
            loading.style.display="none";
            lookup.style.display="inline-block";
            dialog.showModal();
            DialogText.innerHTML = "An Error has occured<br /><code>" + error + "</code>";
        }

    } else {
        
		ip.offsetWidth;
		ip.style.animation = "border-pulsate 4s";
		Clear();
        return;

    }

}



function CloseDialog(){
	dialog.close();
}

function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    let size = Math.round(bytes / Math.pow(1024, i) * 10, 2) / 10
    return  size + ' ' + sizes[i];
 }

function ParseMarkup(text) {
           text = text.replace(/\[[Uu][Rr][Ll]=(.*)\]((.|\n)*)\[\/[Uu][Rr][Ll]\]/gm, function(x){
               return x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"").replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>").replace(/\]/, "\" >")
            });

           text = text.replace(/[\[][Tt][Aa][Bb][Ll][Ee][\]]((.|\r\n)*)[\[][\/][Tt][Aa][Bb][Ll][Ee][\]]/gm,  function(x){ 
                   //console.log("TableFound");
                   //console.log(x);
                   x = x.replace(/(\r\n)/g, "");
                   x = x.replace(/\[\/[Tt][Aa][Bb][Ll][Ee]\]/g, "</table>");
                   x = x.replace(/\[[Tt][Aa][Bb][Ll][Ee]\]/g,"<table style=\"margin: 3px 2%; width: 96%;\">")
                   x = x.replace(/\[\/{0,1}[Tt][Hh]\]/g,function(x){
                          return x.replace("[","<").replace(/[Tt][Hh]\]/g,"td>")
                   });
                   x = x.replace(/\[\/{0,1}[Tt][Dd]\]/g,function(x){
                          return x.replace("[","<").replace(/[Tt][Dd]\]/g,"td>")
                   });
                   x = x.replace(/\[[\/]{0,1}[Tt][Rr]\]/g,function(x){
                          return x.replace("[","<").replace(/[Tt][Rr]\]/g,"tr>")
                   });

                   //console.log(x);
                   return x;
        });
        text = text.replace(/\[[Cc][Oo][Dd][Ee]\]((.|\r\n)*)\[\/[Cc][Oo][Dd][Ee]\]/g,function(x){
            x = x.replace(/(\r\n)}/g, "\n");
            x = x.replace(/(\t)}/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
            x = x.replace(/[ ]/g, "&nbsp;");
            return x.replace(/\[[\/]{0,1}[Cc][Oo][Dd][Ee]{1}\]/g,function(x){
                return x.replace("[","<").replace(/[Cc][Oo][Dd][Ee]\]/g,"code>")
            });
        });
        text = text.replace(/\[[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]((.|\r\n)*)\[\/[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]/g,function(x){
            x = x.replace("\[[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]","<span class=\"spoiler\">")
            return x.replace(/\[[\/][Ss][Pp][Oo][Ii][Ll][Ee][Rr]{1}\]/g, "</span>");
        });
        text = text.replace(/(\r\n){3,5}/g, "\n<br />\n<br />");
        text = text.replace(/(\r\n)/g, "\n<br />");
        
        text = text.replace(/\[[hH]{1}[1-6]\]((.|\r\n)*)\[[\/][hH]{1}[1-5]\]/g,function(x){return x.replace(/\[[\/]{0,1}[hH]{1}[1-5]\]/g,function(x){return x.replace("[","<").replace("]",">").replace("5","6").replace("4","6").replace("3","5").replace("2","4").replace("1","3")});});
        text = text.replace(/\[[\/]{0,1}[bB]{1}\]/g, function(x){return x.replace("[","<").replace(/[bB]\]/g,"strong>")});
        text = text.replace(/\[[\/]{0,1}[iI]{1}\]/g,function(x){return x.replace("[","<").replace(/[iI]\]/g,"em>")});
        text = text.replace(/\[[\/]{0,1}[Uu]{1}\]/g,function(x){return x.replace("[","<").replace(/[Uu]\]/g,"u>")});
        text = text.replace(/\[[hH][rR]\][ ]{0,1}\[\/[hH][rR]\]/g, "<hr />");
        text = text.replace(/\[[Ii][Mm][Gg]\]((.|\r\n)*)\[[\/][Ii][Mm][Gg]\]/g,function(x){
            x = x.replace(/\[[Ii][Mm][Gg]\]/g,function(x){
                return x.replace(/\[[Ii][Mm][Gg]\]/g,"<img src=\"")
            });
            x = x.replace(/\[[\/][Ii][Mm][Gg]\]/g,function(x){return x.replace(/\[[\/][Ii][Mm][Gg]\]/g,"\" />")});
            return x
        });
        
        text = text.replace(/\[[\/]{0,1}[Ss][Tt][Rr][Ii][Kk][Ke]\]/g,function(x){return x.replace("[","<").replace(/[Ss][Tt][Rr][Ii][Kk][Ke]\]/g,"strike>")});
        return text;
}

function FormatTheDate(date){
    const days = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ]
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]

    const year = date.getFullYear()
    const day = date.getDate()
    const dayoftheweek = days[date.getDay()]
    const month = months[date.getMonth()]
    const hr = date.getHours()
    const min = date.getMinutes()
    return `${dayoftheweek} ${month} ${day}, ${year} -  ${hr}:${min}`
}

async function updateCreator(creatorElement, userdata){
    updateHtml(creatorElement, `<a href="${userdata.profileurl}"><author>${userdata.name}</author></a>`)

}