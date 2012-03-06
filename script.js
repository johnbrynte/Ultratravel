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

var currentFlights;
var selectedFlight = {};

$(document).ready(function() {
    var today = new Date();
    var month = today.getMonth();
    var date = today.getDate();
    var todayString = today.getFullYear()+"/"+
        ((month<9)?"0"+(month+1):month+1)+"/"+
        ((date<10)?"0"+date:date)+" 13:37";
    var $sectionHeaders = $(".section > h1");

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

    // initialize sections
    $(".section").not("first-child").height(minimized);
    $(".section:first-child").height(maximized);
    $sectionHeaders.first().addClass("active_section");
    $sectionHeaders.first().addClass("enabled");

    // set default section header color
    $(".section > h1").css("background",todoColor);

    // set the click event handler for each section
    $sectionHeaders.click(function() {
        if($(this).is(".enabled")) { // literally, baby!!!
            gotoSection($(".section").index($(this).parent())+1);
        }
    });

    // Generate those flightseats
    generateFlightSeats();

    // CALENDAR
    $("#arrival").val(todayString);
    $("#departure").val(todayString)

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
        firstSectionChange();
    });
    $("#fromaddress").keyup(function(event) {
        firstSectionChange();
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
            + '<span>Anv&auml;ndarnamn: <input id="login_username" type="text" /></span>'
            + '<span>L&ouml;senord: <input id="login_password" type="password" /></span>'
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

        $('#login_password').keypress(function(evt) {
            if (evt.which === 13) {
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
                $('#login_menu input').hide();

                writeLoginInfo();
            }
        });
    }
});


function codeAddress(index,address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (markers[index]) {
                markers[index].setMap(null);
            }
              
            // Make a nice marker yeah
            var markerIcon = new google.maps.MarkerImage('images/marker_mint_s.png',
            new google.maps.Size(31,40),    // Size
            new google.maps.Point(0,0),    // Origin
            new google.maps.Point(16,40));    // Anchor

            var markerShadow = new google.maps.MarkerImage('images/marker_shadow_s.png',
            new google.maps.Size(45,31),
            new google.maps.Point(0,0),
            new google.maps.Point(16,31));

            markers[index] = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                animation: google.maps.Animation.BOUNCE,
                shadow: markerShadow,
                icon: markerIcon
            });
            map.setCenter(results[0].geometry.location);

            if (markers[1] && markers[0]) {
            if (line) {
                line.setMap(null);
            }

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

    if($section.height() > minimized) {
        return;
    }

    // if the flight section is selected
    if(number === 2) {
        createFlights();
    }

    $(".active_section").removeClass("active_section");
    $section.children("h1").addClass("active_section");

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
    var $flights = $("#flights");
    var $section = $(".section:nth-child(2)");
    var from = $("#fromaddress").val();
    var to = $("#toaddress").val();

    if(selectedFlight.from !== from || selectedFlight.to !== to) {
        $flights.html('<p>Flights från <b>'+from+'</b> till <b>'+to+'</b></p>');

        currentFlights = new Array(3);
        for(i = 0; i < currentFlights.length; i ++) {
            currentFlights[i] = createRandomFlight();
            $flights.append('<p class="flight">'
                +currentFlights[i].time.start.h+':'+currentFlights[i].time.start.m
                +' - '+currentFlights[i].time.end.h+':'+currentFlights[i].time.end.m
                +'<br/>'+currentFlights[i].airline
                +'<br/>'+currentFlights[i].aircraft
                +'<br/>'+currentFlights[i].price+':-'
                +'</p>');
        }
        $(".flight").click(function() {
            $(".flight").not(this).css("background","#fff");
            $(this).css("background","#aaa");
            $section.children(":first").addClass("approved");
            $section.next().children(":first").addClass("enabled");
            $section.children(".nextbutton").css("visibility","visible");

            // save the flight
            selectedFlight.from = from;
            selectedFlight.to = to;

            // clear the flight seat section
            disableSectionsFrom(2, true);
            $(".fseat").css("background","#00f");
        });
    } else {

    }
}

function generateFlightSeats() {
    var $section = $(".section:nth-child(3)");
    var $flightseats = $("#flightseats");
    var $fsection;
    var $frow;
    var $fcol;
    var i, j, k, l;

    for(i = 0; i < 2; i += 1) {
        $flightseats.append("<div class='fsection'></div>");
        $fsection = $flightseats.children(":nth-child("+(i+1)+")");
        for(j = 0; j < 4; j += 1) {
            $fsection.append("<div class='frow'></div>");
            $frow = $fsection.children(":nth-child("+(j+1)+")");
            for(k = 0; k < 2; k += 1) {
                $frow.append("<div class='fcol'></div>");
                $fcol = $frow.children(":nth-child("+(k+1)+")");
                for(l = 0; l < 9; l += 1) {
                    $fcol.append("<div class='fseat'></div>");
                    $fcol.children(":nth-child("+(l+1)+")").click(function() {
                        $(".fseat").not(this).css("background","#00f");
                        $(this).css("background","#f00");

                        $section.children(":first").addClass("approved");
                        $section.next().children(":first").addClass("enabled");
                        $section.children(".nextbutton").css("visibility","visible");
                    });
                }
            }
        }
    }
}

function firstSectionChange() {
    var $section = $(".section:nth-child(1)");

    if($("#fromaddress").val() !== "" && $("#toaddress").val() !== "") {
        disableSectionsFrom(1, true);
        $section.children("h1").addClass("approved");
        $section.next().children("h1").addClass("enabled");
        $section.children(".nextbutton").css("visibility","visible");
    } else {
        disableSectionsFrom(1, false);
        $section.next().children("h1").removeClass("enabled");
        $section.children(".nextbutton").css("visibility","hidden");
    }
};

function disableSectionsFrom(number, approved) {
    if(number > 1) {
        $(".section:gt("+(number-2)+")").children("h1").removeClass("approved");
    } else {
        $(".section").children("h1").removeClass("approved");
    }
    if(approved) {
        $(".section:nth-child("+number+")").children("h1").addClass("approved");
    }
    $(".section:gt("+number+")").children("h1").removeClass("enabled");
}
