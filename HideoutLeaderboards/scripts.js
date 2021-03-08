let table = document.getElementById("table");
let error = document.getElementById("error");
let id = document.getElementById("steamid");

async function LoadData(guid){
    return Papa.parse("https://daemonforge.dev/HideoutLeaderboards/data.csv", {
            download: true,
            worker: true,
	        complete: function(results) {
		        //console.log("Row:", results.data);
                let data = results.data;
                
                let obj = {};
                let row = data.find(o => o[0] === guid);
                if (row === null || row === undefined){
                    id.style.animation = null;
                    id.offsetWidth;
                    id.style.animation = "border-pulsate 4s";
                    table.style.display = "none";
                    error.innerHTML = "ID Not Found in the database";

                } else {
                    let header = data[0];

                    for (let i = 0; i < row.length; i++) {
                        updateHtml(header[i], row[i])
                        obj[header[i]] = row[i];
                    }
                    console.log(row)
                    error.style.display = "none";
                    table.style.display = "block";
                }
            }
        });
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