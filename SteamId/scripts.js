let element = document.getElementById("steamname");
let id = document.getElementById("id");
let idlabel = document.getElementById("idlabel");
let DbCheck = document.getElementById("DbCheck");
let clear = document.getElementById("clear");
let loading = document.getElementById("loading");
let copyText = document.getElementById("copyText");
let SteamAvatar = document.getElementById("SteamAvatar");
let plink = document.getElementById("plink");
let MoreDetails = document.getElementById("MoreDetails");
let Theguid = document.getElementById("guid");
let CountryCode = document.getElementById("countrycode");
let CountryFlag = document.getElementById("countryflag");
let dialog = document.getElementById("dialog");
let DialogHeader = document.getElementById("DialogHeader");
let DialogText = document.getElementById("DialogText");
	
function GetSteamId(){
	element.style.animation = null;
	if (element.value != "" && element.value.length > 1){
		plink.style.display = "none";
		id.value = "";
		CountryCode.innerHTML = "";
		CountryFlag.className = "";
		Theguid.value = "";
		loading.style.display = "inline-block";
		clear.style.display = "none";
		SteamAvatar.style.display = "none";
		copyText.style.display = "none";
		//console.log("GetSteamID: " + element.value);
		fetch("https://daemonforge.dev/SteamId/api/?name=" + element.value)
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
				MoreDetails.style.display = "block";
				Theguid.value = GenerateGUID(data.steamid);
			}
			if (data.avatarmedium !== undefined){
				SteamAvatar.src = data.avatarmedium;
				SteamAvatar.style.display = "inline-block";
			}
			if (data.loccountrycode !== undefined){
				let cCode = data.loccountrycode;
				CountryCode.innerHTML = cCode.toUpperCase();
				CountryFlag.className = "flag-icon flag-icon-" + cCode.toLowerCase();
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
	MoreDetails.style.display = "none";
	CountryCode.innerHTML = "";
	CountryFlag.className = "";
	Theguid.value = "";
	
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

function LoginSteam(){
	let url = "https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=https://daemonforge.dev/SteamId/Login/&openid.realm=https://daemonforge.dev&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select";
	setTimeout(function(){window.location = url;}, 300);
}

function GenerateGUID(theId){
    
    let hash = CryptoJS.SHA256(theId);
    var text = hash.toString(CryptoJS.enc.Base64);
    return text.replace('+', '-').replace('/', '_');
    
}

function CloseDialog(){
	dialog.close();
}

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
if (urlParams.has("SteamId")){
	
	//console.log(data);
	id.style.display = "inline-block";
	//console.log(data);
	if (urlParams.has("SteamId")){
		let sid = urlParams.get("SteamId");
		plink.style.display = "inline";
		id.value = sid;
		DbCheck.href = "https://steamcommunity.com/id/"+ sid + "/";
		copyText.style.display = "inline-block";
		MoreDetails.style.display = "block";
		Theguid.value = GenerateGUID(sid);
	}
	if (urlParams.has("Avatar")){
		SteamAvatar.src = urlParams.get("Avatar");
		SteamAvatar.style.display = "inline-block";
	}
	if (urlParams.has("Name")){
		element.value = urlParams.get("Name");
		SteamAvatar.style.display = "inline-block";
	}
	if (urlParams.has("country")){
		let cCode = urlParams.get("country");
		CountryCode.innerHTML = cCode.toUpperCase();
		CountryFlag.className = "flag-icon flag-icon-" + cCode.toLowerCase();
	}
	idlabel.style.display = "block";
	clear.style.display = "inline";
	loading.style.display = "none";
}
if (urlParams.has("error")){
	dialog.showModal();
	DialogText.innerHTML = urlParams.get("error");
}