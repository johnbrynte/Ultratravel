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
    this.password = "";
    this.loggedin = false;
    this.recentTravels = [];
}

UserData.prototype = {
    addTravel : function (travel) {
        this.recentTravels.push(travel);
    },

    getTravels : function () {
        return this.recentTravels;
    }
}

function attemptLogin() {
    ultratravelUserData = new UserData();
    ultratravelUserData.loggedin = true;
    ultratravelUserData.username = $('#login_username').val();
    ultratravelUserData.password = $('#login_password').val();
    if (ultratravelUserData.username === '' || ultratravelUserData.password === '') {
        alert('Var vänlig fyll i användarnamn och lösenord.');
        return;
    }

    $('#login_popup').remove();
    $('#login').append('<div id="login_menu">' +
            '<input id="saveUser" type="button" value="Spara" />' +
            '<input id="forgetUser" type="button" value="Glöm" />' +
            '</div>');
    $('#login_menu input').hide();

    $('#login').append('<p><b>Inloggad som: </b>' + ultratravelUserData.username + '</p>');
}


function saveDataLocal() {
    localStorage.ultratravelUserData = ultratravelUserData;
}

function loadDataLocal() {
    if (localStorage.ultratravelUserData) {
	    ultratravelUserData = localStorage.ultratravelUserData;
    }
}


function saveDataCookie() {
    alert("Din webblösare stöder inte inloggning. Var vänlig uppgradera din webbläsare.");
}
