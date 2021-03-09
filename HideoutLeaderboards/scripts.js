let table = document.getElementById("table");
let error = document.getElementById("error");
let id = document.getElementById("steamid");
let Leaderboards = document.getElementById("Leaderboards");
let lbData = document.getElementById("lbData");
let data = [];
Papa.parse("https://daemonforge.dev/HideoutLeaderboards/data.csv", {
            download: true,
            worker: true,
            header: true,
            dynamicTyping: true,
	        complete: function(results) {
                data = results.data;
                Sort('Exp');
            }
        });
async function LoadData(guid){
    let obj = data.find(o => o['GUID'] === guid);
                console.log(obj)
                if (obj === null || obj === undefined){
                    id.style.animation = null;
                    id.offsetWidth;
                    id.style.animation = "border-pulsate 4s";
                    table.style.display = "none";
                    error.innerHTML = "ID Not Found in the database";

                } else {
                    for (const [key, value] of Object.entries(obj)) {
                        updateHtml(key, value)
                    }
                    //console.log(obj)
                    error.style.display = "none";
                    table.style.display = "block";
                } 
}
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

function GenerateGUID(theId){
    
    let hash = CryptoJS.SHA256(theId);
    var text = hash.toString(CryptoJS.enc.Base64);
    return text.replace(/[+]/g, '-').replace(/[\/]/g, '_')
    
}

async function Search(){
    if (id.value === undefined || id.value.length !== 17){
        id.style.animation = null;
		id.offsetWidth;
		id.style.animation = "border-pulsate 4s";
    } else {
        let guid = GenerateGUID(id.value)
        LoadData(guid)
    }

}

function dynamicSort(property) {
    var sortOrder = -1;
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


function Sort(property){
    data.sort(dynamicSort(property))
    //console.log(data);
    let i = 1;
    lbData.innerHTML = "";
    for (const obj of data) {
        lbData.innerHTML += `
            <tr>
                <td>${i}</td>
                <td>${obj.PlayerName}</td>
                <td>${obj.Exp}</td>
                <td>${obj.PLAYER_KILL}</td>
                <td>${obj.Total_Deaths}</td>
                <td>${Math.round(obj.KDR * 1000) / 1000}</td>
                <td><div class="tooltip">${Math.round(obj.Accuracy * 10000) / 100}%
                <span class="tooltiptext tooltip-right">Fired: ${obj.SHOTS_FIRED}<br />Hit: ${obj.SHOTS_HIT}</span>
              </div></td>
                <td>${obj.HEADSHOT}</td>
            </tr>
            `;
        if (i++ >= 100){
            break;
        }
    }
}

