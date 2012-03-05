/*jslint undef: true, browser: true, unparam: true, sloppy: true, white: true, newcap: true, plusplus: true, maxerr: 50, indent: 4 */

/**
 * Script.js
 * @author John Brynte Turesson
 * @author Anton Erholt
 */

var minimized = 35;
var maximized = 450;

var map;
var geocoder;
var line;
var markers = [];

var saveFunc;
var loadFunc;

var okColor = "#37d2ac";
var todoColor = "#ff8973";

var ultratravelUserData;

$(document).ready(function() {
    var today = new Date();
    var month = today.getMonth();
    var date = today.getDate();
    var todayString = today.getFullYear()+"/"+
        ((month<9)?"0"+(month+1):month+1)+"/"+
        ((date<10)?"0"+date:date)+" 13:37";
    var sectionHeaders = $(".section > h1");

    // GOOGLE MAPZ
    var myOptions = {
        disableDefaultUI: true,
        scrollwheel: false,
        center: new google.maps.LatLng(50, 0),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{
            featureType: "all",
            stylers: [
                { hue: "#ffc890" },
                {  lightness: "25" }
            ]
        }]
    };
    
    $(".section").height(minimized);
    $("#booking .section:first-child").height(maximized);
    sectionHeaders.first().addClass("active_section");

    // set default section header color
    $(".section > h1").css("background",todoColor);

    sectionHeaders.click(function() {
        gotoSection($(".section").index($(this).parent())+1);
    });

    // CALENDAR
    document.forms[0].arrival.value = todayString;
    document.forms[0].departure.value = todayString;

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    geocoder = new google.maps.Geocoder();  

    // FORM
    $("#fromaddress").keypress(function(event) {
        if(event.which == 13) { // check if enter was pressed
            codeAddress(0, $(this).attr("value"));
        }
    });

      
    $("#toaddress").keypress(function(event) {
        if(event.which == 13) { // check if enter was pressed
            codeAddress(1, $(this).attr("value"));
        }
    });

    // If the text field in section 1 changed
    $("#toaddress").keyup(function(event) {
        sectionDestinationChange();
    });
    $("#fromaddress").keyup(function(event) {
        sectionDestinationChange();
    });

    // Set the focus to the "from" text field
    $("#fromaddress").focus();

    // LOGIN
    if (typeof(Storage)!=="undefined") {
        saveFunc = saveDataLocal;
        loadFunc = loadDataLocal;
    } else {
        saveFunc = saveDataCookie;
    }

    loadFunc();

    if (ultratravelUserData && ultratravelUserData.loggedin) {
        writeLoginInfo();
    } else {
        $('#login').append('<div id="login_popup">'
            + '<p>Anv&auml;ndarnamn: <input id="login_username" type="text" /></p>'
            + '<p>L&ouml;senord: <input id="login_password" type="password" /></p>'
            + '<input id="loginbutton" type="button" value="Logga in">'
            + '</div>');

        $('#loginbutton').click(function() {
            ultratravelUserData = new UserData();
            ultratravelUserData.loggedin = true;
            ultratravelUserData.username = $('#login_username').val();
            ultratravelUserData.password = $('#login_password').val();
            if (ultratravelUserData.username === '' || ultratravelUserData.password === '') { 
                alert('Var vänlig fyll i användarnamn och lösenord.');
                return;
            }

            $('#login_popup').remove();
            $('#login').append('<div id="login_menu">'
                    + '<input id="saveUser" type="button" value="Spara" />'
                    + '<input id="forgetUser" type="button" value="Glöm" />'
                    + '</div>');
              
            writeLoginInfo();
        });
    }
});


function codeAddress(index,address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (markers[index]) {
                markers[index].setMap(null);
            }

            markers[index] = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                animation: google.maps.Animation.BOUNCE
            });
            map.setCenter(results[0].geometry.location);

            if (markers[1] && markers[0]) {
            if (line)
                line.setMap(null);

            var p1 = markers[0].getPosition();
            var p2 = markers[1].getPosition();

            line = new google.maps.Polyline({
                map: map,
                path: new google.maps.MVCArray([ p1, p2 ]),
                strokeColor: okColor,
                geodesic: true
            });
            map.setCenter(google.maps.geometry.spherical.interpolate(p1,p2,0.5));
            }
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function gotoSection(number) {
    var $section = $(".section:nth-child("+number+")");
    if ($section.height() > minimized) { 
        return;
    }

    // if the flight section is selected
    if(number == 2)
        createFlights();

    $(".active_section").removeClass("active_section");
    $section.children(":first").addClass("active_section");

    var expand = {};
    expand["height"] = maximized;
    $section.animate(expand, 300, null);

    var collapse = {};
    collapse["height"] = minimized;
    $(".section").not($section).animate(collapse, 300, null);

    // Hide calendar
    $("#calendarDiv").css("display", "none");
}

function createFlights() {
    var $secondSection = $(".section:nth-child(2)");
    var from = $("#fromaddress").val();
    var to = $("#toaddress").val();
    var $flights = $("#flights");

    $flights.html("");

    if(from == "" || to == "") {
        $flights.append('<p>Välj avgångsort och resmål under sektionen <span class="linktosection" onclick="gotoSection(1)">Destination</span></p>');
    } else {
        $flights.append('<p>Flights från <b>'+from+'</b> till <b>'+to+'</b></p>');
        for(i = 0; i < 3; i ++) {
            $flights.append('<p class="flight">'+flight()+'</p>');
        }
        $(".flight").click(function() {
            $(this).css("background","#aaa");
            $secondSection.children(":first").css("background",okColor);
            $secondSection.children(".nextbutton").css("visibility","visible");
        });
    }
}

// check if enough information is available
function sectionDestinationChange() {
    var $firstSection = $(".section:nth-child(1)");
    if($("#fromaddress").val() != "" && $("#toaddress").val() != "") {
        $firstSection.children(":first").css("background",okColor);
        $firstSection.children(".nextbutton").css("visibility","visible");
    } else {
        $(".section:nth-child(1)").children(":first").css("background",todoColor);
        $firstSection.children(".nextbutton").css("visibility","hidden");
    }
};
