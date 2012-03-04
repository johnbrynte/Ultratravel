/**
 * login.js 
 * @author Anton Erholt
 * 
 * Contains functions for manipulating userData and login.
 */


/**
 * @class UserData
 * Describes user data and settings.
 */
function UserData() {
    this.username = "";
    password = "";
    loggedin = false;
    recentTravels = [];
}



function saveDataLocal() {
    localStorage.ultratravelUserData = ultratravelUserData;
}

function loadDataLocal() {
    if (localStorage.ultratravelUserData) {
	ultratravelUserData = localStorage.ultratravelUserData;
    }
}

function writeLoginInfo() {
    $('#login').append('<p><b>Logged in as:</b> '+ultratravelUserData.username+'</p>');
}

function saveDataCookie() {
    alert("Din webblösare stöder inte inloggning. Var vänlig uppgradera din webbläsare.");
}

