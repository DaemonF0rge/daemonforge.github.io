let element = document.getElementById("steamname");
let id = document.getElementById("id");
let idlabel = document.getElementById("idlabel");
let DbCheck = document.getElementById("DbCheck");
let clear = document.getElementById("clear");
let loading = document.getElementById("loading");
let copyText = document.getElementById("copyText");
let SteamAvatar = document.getElementById("SteamAvatar");
let plink = document.getElementById("plink");
	
function GetSteamId(){
	element.style.animation = null;
	if (element.value != "" && element.value.length > 1){
		plink.style.display = "none";
		id.value = "";
		loading.style.display = "inline-block";
		clear.style.display = "none";
		SteamAvatar.style.display = "none";
		copyText.style.display = "none";
		//console.log("GetSteamID: " + element.value);
		fetch("https://daemonforge.dev/steamid/api/?name=" + element.value)
		.then(res => {
			return res.json();
		})
		.then(data => {
			//console.log(data);
			id.style.display = "inline-block";
			//console.log(data);
			if (data.error !== undefined){
				
				id.value = data.error;
				copyText.style.display = "none";
			} 
			if (data.steamid !== undefined){
				plink.style.display = "inline";
				id.value = data.steamid;
				DbCheck.href = data.profileurl;
				copyText.style.display = "inline-block";
				console.log("GUID:" + GenerateGUID(data.steamid));
			}
			if (data.avatarmedium !== undefined){
				SteamAvatar.src = data.avatarmedium;
				SteamAvatar.style.display = "inline-block";
			}
			idlabel.style.display = "block";
			clear.style.display = "inline";
			loading.style.display = "none";
		});
	} else{
		element.offsetWidth;
		element.style.animation = "border-pulsate 4s";
		Clear();
	}
}

function Clear(){
	element.value = "";
	id.value = "";
	copyText.style.display = "none";
	plink.style.display = "none";
	//id.style.display = "none";
	//idlabel.style.display = "none";
	clear.style.display = "none";
	SteamAvatar.style.display = "none";
 }
 
function CopyId() {

  /* Select the text field */
  id.select();
  id.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

}

element.addEventListener("keydown", function(event) {
  element.style.animation = null;
  if (event.keyCode === 13) {
    GetSteamId();
  }
});

function GenerateGUID(theId){
    
    let hash = CryptoJS.SHA256(theId);
    var text = hash.toString(CryptoJS.enc.Base64);
    return text.replace('+', '-').replace('/', '_');
    
}

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
if (urlParams.has("openid.identity")){
	let sid = urlParams.get("openid.identity");
	console.log(sid);
	let idurl = new URL(sid);
	let theID = idurl.pathname;
	theID.replace('/', '')
	theID.replace('openid', '')
	console.log(theID);
}