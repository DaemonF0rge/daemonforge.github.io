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
                "night_acceleration",
                "rawdata",
                "rawRequest"
            ];

const NightRef = {
    namalsk: 15.90, //Same as chenarus but since the init.c by default reset the months to winter i rounded closered to january averages 
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
            let data = await fetch("https://api.daemonforge.dev/server/" +theIp+"/"+thePort+"/full", {
                method: 'GET',
                mode: 'no-cors'
            } ) .then( response => response.json() );
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
                let newMods = [];
                for(mod of data.mods){
                    i++;
                    //console.log(mod)
                    let description = ParseMarkup(mod.description);
                    
                    let niceSize = bytesToSize(mod.size);
                    
                    var DateCreated = new Date(mod.created * 1000);
                    var LastUpdated = new Date(mod.updated * 1000);
                    contents+= `
                    <details style="width: 98%; margin: 2px;"> 
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
                        <article>
                            ${description}
                        </article>
                    </details>
                    `;
                    newMods.push({id: mod.id, name: mod.name});
                    let creatorid = "creator"+i;
                    fetch(`https://api.daemonforge.dev/user/${mod.creator}`, {
                        method: 'GET',
                        mode: 'no-cors'
                    }).then( userresponse => userresponse.json().then( userdata => updateCreator(creatorid, userdata) ).catch(e=>console.log(e))).catch( e => console.log(e))

                }
                data.mods = newMods; //Just to remove extra bloat from the resonses and to not encourch un nessasary use of /full
                delete data.ModsDownloadSize;
                updateHtml("ModData", contents);
                let str = JSON.stringify(data, null, 2);
                
                updateHtml("rawdata", syntaxHighlight(str));
                updateHtml("rawRequest", "https://api.daemonforge.dev/server/" +theIp+"/"+thePort);
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

function ParseMarkup(intext) {
    intext = intext.replace(/</g, '&lt;');

        intext = intext.replace(/\[[Ii][Mm][Gg]\]((.|\r\n)*)\[\/[Ii][Mm][Gg]\]/g,function(x){
            x = x.replace(/\[[Ii][Mm][Gg]\]/g,function(x){
                return x.replace(/\[[Ii][Mm][Gg]\]/g,"<img src=\"")
            });
            x = x.replace(/\[[\/][Ii][Mm][Gg]\]/g,function(x){return x.replace(/\[\/[Ii][Mm][Gg]\]/g,"\" />")});
            return x
        });

            intext = intext.replace(/[\[][Tt][Aa][Bb][Ll][Ee][\]]((.|\r\n)*)[\[][\/][Tt][Aa][Bb][Ll][Ee][\]]/gm,  function(x){ 
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
        intext = intext.replace(/\[[Cc][Oo][Dd][Ee]\]((.|\r\n)*)\[\/[Cc][Oo][Dd][Ee]\]/g,function(x){
            x = x.replace(/(\r\n)}/g, "\n");
            x = x.replace(/(\t)}/g, " &nbsp; &nbsp;&nbsp;");
            x = x.replace(/[ ]{2}/g, " &nbsp;");
            return x.replace(/\[[\/]{0,1}[Cc][Oo][Dd][Ee]{1}\]/g,function(x){
                return x.replace("[","<").replace(/[Cc][Oo][Dd][Ee]\]/g,"code>")
            });
        });
        intext = intext.replace(/\[[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]((.|\r\n)*)\[\/[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]/g, function(x){
            x = x.replace("\[[Ss][Pp][Oo][Ii][Ll][Ee][Rr]\]","<span class=\"spoiler\">")
            return x.replace(/\[[\/][Ss][Pp][Oo][Ii][Ll][Ee][Rr]{1}\]/g, "</span>");
        });
        
        intext = intext.replace(/\[[hH][1-5]\]((.|\r\n)*)\[[\/][hH][1-5]\]/g,function(x){
            return x.replace(/\[[\/]{0,1}[hH][1-5]\]/g,function(x){
                return x.replace("[","<").replace("]",">").replace("5","6").replace("4","6").replace("3","5").replace("2","4").replace("1","3")
            });
        });
        intext = intext.replace(/\[[bB]\]((.|\r\n)*)\[[\/][bB]\]/g,function(x){
            return x.replace(/\[[\/]{0,1}[bB]\]/g, function(x){
                return x.replace("[","<").replace(/[bB]\]/g,"strong>")
            });
        });
        intext = intext.replace(/\[[iI]\]((.|\r\n)*)\[[\/][iI]\]/g,function(x){
            return x.replace(/\[[\/]{0,1}[iI]\]/g,function(x){
                return x.replace("[","<").replace(/[iI]\]/g,"em>")
            });
        });
        intext = intext.replace(/\[[Uu]{1}\]((.|\r\n)*)\[[\/][Uu]\]/g,function(x){
            return x.replace(/\[[\/]{0,1}[Uu]\]/g,function(x){
                return x.replace("[","<").replace(/[Uu]\]/g,"u>")
            });
        });
        intext = intext.replace(/\[[hH][rR]\][ ]{0,3}\[\/[hH][rR]\]/g, "<hr />");
        
        intext = intext.replace(/\[[Ss][Tt][Rr][Ii][Kk][Ke]\]((.|\r\n)*)\[\/[Ss][Tt][Rr][Ii][Kk][Ke]\]/g,function(x){
            return x.replace(/\[\/{0,1}[Ss][Tt][Rr][Ii][Kk][Ke]\]/g,function(x){
                return x.replace("[","<").replace(/[Ss][Tt][Rr][Ii][Kk][Ke]\]/g,"strike>")
            });
        });
        intext = intext.replace(/\[[Uu][Rr][Ll]=(.)*\](.)*\[\/[Uu][Rr][Ll]\]/g, function(x){
            //console.log("Phase 1: " + x);
            x =  x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>");
            return x;
        });
            
        intext = intext.replace(/\[[Uu][Rr][Ll]=(.)*\](.)*\[\/[Uu][Rr][Ll]\]/g, function(x){
            //console.log("Phase 2: " + x);
            x =  x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>");
            return x;
        });

        intext = intext.replace(/\[[Uu][Rr][Ll]=(.)*\](.)*\[\/[Uu][Rr][Ll]\]/g, function(x){
            //console.log("Phase 3: " + x);
            x =  x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>");
            return x;
        });

        intext = intext.replace(/\[[Uu][Rr][Ll]=(.)*\](.|\r\n)*\[\/[Uu][Rr][Ll]\]/gm, function(x){
            //console.log("Phase 4: " + x);
            x =  x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>");
            return x;
        });

        intext = intext.replace(/\[[Uu][Rr][Ll]=(.)*\](.|\r\n)*\[\/[Uu][Rr][Ll]\]/gm, function(x){
            //console.log("Phase 5: " + x);
            x =  x.replace(/\[[Uu][Rr][Ll]=/, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[[\/][Uu][Rr][Ll]\]/, "</a>");
            return x;
        });

        intext = intext.replace(/(\r\n){3,5}/g, "\n<br />\n<br />");

        intext = intext.replace(/(\r\n){1,2}/g, "\n<br />");

        //console.log(intext);
        return intext;
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

    let year = date.getFullYear()
    let day = date.getDate()
    let dayoftheweek = days[date.getDay()]
    let month = months[date.getMonth()]
    let hr = date.getHours()
    let min = date.getMinutes()
    if (min < 10){
       min = "0"+min;
    }
    return `${dayoftheweek}, ${month} ${day}, ${year} &nbsp; ${hr}:${min}`
}

async function updateCreator(creatorElement, userdata){
    updateHtml(creatorElement, `<a href="${userdata.profileurl}"><author>${userdata.name}</author></a>`)

}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
