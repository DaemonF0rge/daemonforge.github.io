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
                "rawRequest",
                "ServerDescription"
            ];

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);

const NightRef = {
    namalsk: 15.90, //Same as chenarus but since the init.c by default reset the months to winter i rounded closered to january averages 
    chernarus: 14.765,
    chernarusplus: 14.765,
    chernarusplusgloom: 14.765,
    enoch: 12.035,
    enochgloom: 12.035,
    deerilse: 11.68
};

const fetch_retry = async (url, options, n) => {
    try {
        return await fetch(url, options)
    } catch(err) {
        if (n === 1) throw err;
        return await fetch_retry(url, options, n - 1);
    }
};

const converter = new showdown.Converter({ extensions: ['icon'] });
 

let ServerData = document.getElementById("ServerData");
let ip = document.getElementById("ip");
let port = document.getElementById("port");
let lookup = document.getElementById("lookup");
let loading = document.getElementById("loading");
let statusicon = document.getElementById("statusicon");
let codeblock = document.getElementById("rawdata");
let ServerDescriptionRow = document.getElementById("ServerDescriptionRow");

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
    ServerDescriptionRow.style.display="none";
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
            let data = await fetch_retry("https://api.daemonforge.dev/server/" +theIp+"/"+thePort+"/full", {
                method: 'GET',
                mode: 'cors'
            }, 3 ) .then( response => response.json() );
            Clear();
            console.log(data);
            if (data.status !== undefined){
                ServerData.style.display="block";
                let AllDonations = `<input id="copyfrom" type="text" style="display: inline-block; width: 320px; height: 24px; font-size: 0.8em" value="https://daemonforge.dev/Server/?ip=${theIp}&port=${thePort}" /> <button id="copyText" style="display: inline-block; margin-left: 4px; padding: 8px;  font-size: 1em" type="button" onclick="CopyServerLink()" title="Copy" ><i class="fa fa-copy"></i></button>`;
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
                let ServerName = data.name.match(/([a-zA-Z0-9' ]{5,32})(\||-|:)/ui);
                console.log(data.name)
                if (ServerName){
                    ServerName = ServerName[0].match(/([a-zA-Z0-9' ]{5,32})/ui);
                    console.log(ServerName)
                    ServerName = ServerName[0]
                    //console.log(ServerName);
                } else {
                    ServerName = data.name;
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
                    if (mod.name !== "") {
                        ModName = mod.name;
                        ModName = ModName.replace(/[ _]/g, "");
                        if (ServerName !== undefined && ServerName !== null) {
                            ServerName = ServerName.replace(/[ _]/g, "");
                            ServerName = ServerName.toLowerCase();
                        }
                        ModName = ModName.replace(/(server)?(mod)?(pack)?/gi, "");
                        ModName = ModName.toLowerCase();
                        let TheServerDescription = "";
                        let TheServerTitle = "";
                        let toCheck = mod.description;
                        if (ServerName !== undefined && ServerName !== null && ServerName == ModName && urlParams.has("demo")){
                            TheServerDescription = toCheck.match(/\[code=description\]((.|\r\n)*)\[\/code\]/giu);
                            TheServerTitle = toCheck.match(/\[h[1-5](=title)\](.*)\[\/h[1-5]\]/giu);
                            if (TheServerDescription){
                                TheServerDescription = TheServerDescription[0].replace(/\[code=description\]/i, "").replace(/\[\/code\]/i, "");
                                //console.log(TheServerDescription)
                                TheServerDescription = TheServerDescription.replace(/</g, '&lt;');
                                TheServerDescription      = "Parsed Server Description<br /><hr />" + converter.makeHtml(TheServerDescription);
                                ServerDescriptionRow.style.display = null;
                                updateHtml("ServerDescription",TheServerDescription);
                            } else {
                                ServerDescriptionRow.style.display = null;
                                updateHtml("ServerDescription", "Parsed Server Description<br /><hr />" + ParseMarkup(mod.description));
                            }
                            if (TheServerTitle){
                                TheServerTitle = TheServerTitle[0].replace(/\[h[1-5]=title\]/i, "").replace(/\[\/h[1-5]\]/i, "");

                                TheServerTitle = TheServerTitle.replace(/</g, '&lt;');
                                updateHtml("servername", TheServerTitle);
                            }
                        }
                        let description = "";
                        let donationlink = "";
                        let donations = "";
                        let creatorid = "creator"+i;
                        if (mod.description !== undefined){
                            let parse = ParseMarkup(mod.description);
                            description = parse[0];
                            donationlink = parse[1];
                            
                            //console.log(donationlink)
                            if (donationlink !== undefined  && donationlink != null){
                                AllDonations = AllDonations + `<br> ${mod.name} by <span id="${creatorid}dl"> </span> - `;
                                donations = " ";
                                donationlink.forEach(element => {
                                    //console.log(element)
                                    let link;
                                    if (element.match(/https?:\/\//i)){
                                        link = element;
                                    } else {
                                        link = "https://" + element;
                                    }
                                    if (element.match(/paypal/i)){
                                        donations = donations + ` <a href="${link}" class="modheader"><i class="fab fa-paypal"></i></a>`;
                                        AllDonations = AllDonations + ` <a href="${link}" class="donateLink" style="color: #169BD7;"><i class="fab fa-paypal"></i></a>`;
                                    }
                                    if (element.match(/patreon/i)){
                                        donations = donations + ` <a href="${link}"class="modheader"><i class="fab fa-patreon"></i></a>`;
                                        AllDonations = AllDonations + ` <a href="${link}" class="donateLink" style="color: #E64413;"><i class="fab fa-patreon"></i></a>`;
                                    }
                                    if (element.match(/github/i)){
                                        donations = donations + ` <a href="${link}" class="modheader"><i class="fab fa-github"></i></a>`;
                                        AllDonations = AllDonations + ` <a href="${link}" class="donateLink" style="color: #fff;"><i class="fab fa-github"></i></a>`;
                                    }
                                });
                            }
                        }
                        //console.log(donations)
                        let niceSize = bytesToSize(mod.size);
                        var DateCreated = new Date(mod.created * 1000);
                        var LastUpdated = new Date(mod.updated * 1000);
                        contents+= `
                        <details style="width: 98%; margin: 2px;"> 
                            <summary style="font-size: 1.3em;">${mod.name}${donations}</summary>
                            <a style="text-align: center; margin: 12px; margin-bottom: 16px;" href="https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.id}" ><img class="modimage" src="${mod.image_url}"/></a>
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
                        fetch_retry(`https://api.daemonforge.dev/user/${mod.creator}`, {
                            method: 'GET',
                            mode: 'cors'
                        }, 3).then( userresponse => userresponse.json().then( userdata => {updateCreator(creatorid, userdata);updateCreator(creatorid+"dl", userdata)} ).catch(e=>console.log(e))).catch( e => console.log(e))
                    }
                }
                updateHtml("AllDonations", AllDonations);
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
            DialogText.innerHTML = "An Error has occured, try again. <br />If the issue persisit let me know via discord DaemonForge#5454 <br /><br /><code>" + error + "</code>";
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
    //console.log(intext)
    intext = intext.replace(/</g, '&lt;');
        for( let i = 0; i <= 8; i++ ){
            intext = intext.replace(/\[img\](.*)\[\/img\]/giu,function(x){
                x = x.replace(/\[img\]/i,"<img src=\"");
                x = x.replace(/\[\/img\]/i,"\" />");
                return x
            });

                intext = intext.replace(/\[table\](.|\r\n)*\[\/table\]/gmiu,  function(x){ 
                    //console.log("TableFound");
                    //console.log(x);
                    x = x.replace(/(\r\n)/g, "");
                    x = x.replace(/\[\/table\]/gi, "</table>");
                    x = x.replace(/\[table\]/gi,"<table style=\"margin: 3px 2%; width: 96%;\">")
                    x = x.replace(/\[\/?th\]/gi,function(x){
                            return x.replace("[","<").replace(/th\]/gi,"th>")
                    });
                    x = x.replace(/\[\/?td\]/gi,function(x){
                            return x.replace("[","<").replace(/td\]/gi,"td>")
                    });
                    x = x.replace(/\[\/?tr\]/gi,function(x){
                            return x.replace("[","<").replace(/tr\]/gi,"tr>")
                    });

                    //console.log(x);
                    return x;
            });

            intext = intext.replace(/\[list\](.|\r\n)*\[\/list\]/gmiu,  function(x){ 
                //console.log(x);
                x = x.replace(/\[\/list\]/gi, "</ul>");
                x = x.replace(/\[list\]/gi,"<ul>")
                x = x.replace(/\[\*\](.)*\r?\n/gi,function(x){
                        x = x.replace(/\[\*\]/i,"<li>")
                        return x.replace(/\r?\n/, "</li>\n");
                });
                x = x.replace(/\r\n\r\n/g, "<br />\n");
                x = x.replace(/\r\n/g, "\n");
                //console.log(x);
                return x;
            });

            intext = intext.replace(/\[olist\](.|\r?\n)*\[\/olist\]/gmiu,  function(x){ 
                //console.log(x)
                x = x.replace(/\[\/olist\]/i, "</ol>");
                x = x.replace(/\[olist\]/i,"<ol>")
                x = x.replace(/\[\*\](.)*\r?\n/gi,function(x){
                        x = x.replace(/\[\*\]/i,"<li>")
                        return x.replace(/\r?\n/, "</li>\n");
                });
                x = x.replace(/\r\n/g, "\n");
                //console.log(x);
                return x;
            });
            intext = intext.replace(/\[code(=description)?\]((.|\r\n)*)\[\/code\]/giu,function(x){
                x = x.replace(/(\r\n)}/g, "\n");
                x = x.replace(/(\t)}/g, " &nbsp; &nbsp;&nbsp;");
                x = x.replace(/[ ]{2}/g, " &nbsp;");
                return x.replace(/\[\/?code(=description)?\]/gi,function(x){
                    return x.replace("[","<").replace(/code(=description)?\]/gi,"code>")
                });
            });
            
            intext = intext.replace(/\[quote=?([a-zA-Z0-9]{0,32})\]((.|\r?\n)*)\[\/quote\]/gmiu, function(x){
                x = x.replace(/\[quote=?([a-zA-Z0-9]{0,32})\]/i,"<blockquote>")
                return x.replace(/\[\/quote\]/i, "</blockquote>");
            });

            intext = intext.replace(/\[spoiler\]((.|\r\n)*)\[\/spoiler\]/giu, function(x){
                x = x.replace("\[spoiler\]","<span class=\"spoiler\">")
                return x.replace(/\[\/spoiler\]/g, "</span>");
            });
            
            
            intext = intext.replace(/\[h[1-5](=title)?\](.|\r?\n)*\[\/h[1-5]\]/giu,function(x){
                return x.replace(/\[[\/]{0,1}[hH][1-5](=title)?\]/gi,function(x){
                    return x.replace("[","<").replace(/(=title)?\]/,">").replace("5","6").replace("4","6").replace("3","5").replace("2","4").replace("1","3")
                });
            });
            intext = intext.replace(/\[b\](.|\r\n)*\[\/b\]/giu,function(x){
                return x.replace(/\[\/?b\]/gi, function(x){
                    return x.replace("[","<").replace(/b\]/gi,"strong>")
                });
            });
            intext = intext.replace(/\[i\](.|\r\n)*\[\/i\]/giu,function(x){
                return x.replace(/\[\/?i\]/gi,function(x){
                    return x.replace("[","<").replace(/i\]/gi,"em>")
                });
            });
            intext = intext.replace(/\[u\](.|\r\n)*\[\/u\]/giu,function(x){
                return x.replace(/\[\/?u\]/gi,function(x){
                    return x.replace("[","<").replace(/u\]/gi,"u>")
                });
            });
            intext = intext.replace(/\[hr\][ ]{0,3}\[\/hr\]/giu, "<hr />");
            
            intext = intext.replace(/\[strike\]((.|\r\n)*)\[\/strike\]/giu,function(x){
                return x.replace(/\[\/?strike\]/gi,function(x){
                    return x.replace("[","<").replace(/strike\]/gi,"strike>")
                });
            });
            intext = intext.replace(/\[url=(.)*\](.)*\[\/url\]/giu, function(x){
                //console.log("Phase 1: " + x);
                x =  x.replace(/\[url=/i, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
                x = x.replace(/\]/, "\" >");
                x =  x.replace(/\[\/url\]/i, "</a>");
                return x;
            });
        }

        intext = intext.replace(/\[url=(.)*\](.|\r\n)*\[\/url\]/gmiu, function(x){
            //console.log("Phase 4: " + x);
            x =  x.replace(/\[url=/i, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[\/url\]/i, "</a>");
            return x;
        });

        intext = intext.replace(/\[url=(.)*\](.|\r\n)*\[\/url\]/gmiu, function(x){
            //console.log("Phase 5: " + x);
            x =  x.replace(/\[url=/i, "<a style=\"display: inline;\" target=\"_blank\" href=\"")
            x = x.replace(/\]/, "\" >");
            x =  x.replace(/\[\/url\]/i, "</a>");
            return x;
        });


        intext = intext.replace(/(\r\n){3,5}/g, "\n<br />\n<br />");

        intext = intext.replace(/(\r\n){1,2}/g, "\n<br />");

        let donationlinks = intext.match(/(https?:\/\/)?(www\.)?((paypal\.((com)|(me))\/pools\/[a-z])|(paypal\.me)|(patreon\.com)|(github\.com\/sponsors))(\/[a-zA-Z0-9]{2,64})/gi)
        //console.log(intext);
        var result;
        if (donationlinks !== undefined && donationlinks !== null ){
            result = [];
            donationlinks.forEach(function(item) {
                if(result.indexOf(item) < 0) {
                    result.push(item);
                }
            });
        }
        return [intext, result];
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

function CopyServerLink(){

  /* Select the text field */
  document.getElementById("copyfrom").select();
  document.getElementById("copyfrom").setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

}



if (urlParams.has("ip")){
    if(urlParams.has("port")){

        port.value = urlParams.get("port");
    }
    ip.value = urlParams.get("ip");
    setTimeout(LookUpServer, 1000);
}

