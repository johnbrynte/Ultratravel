/*jslint browser: true, sloppy: true, maxerr: 50, indent: 4 */

/**
 * Script.js
 * @author John Brynte Turesson
 * @author Anton Erholt
 * @author Daniel Molin
 */

var minimized = 35;
var maximized = 500;

var map;
var geocoder;
var line;
var markers = [];

var saveFunc;
var loadFunc;

var okColor = "#37d2ac";
var todoColor = "#ff8973";
var selectionColor = "#84f4d8";

var ultratravelUserData;

var currentFlights;
var selectedFlight = {};

var currentHotels;
var selectedHotel = {};

$(document).ready(function () {
    var today, month, date, todayString, $sectionHeaders,myOptions, fa, ta;

    today = new Date();
    month = today.getMonth();
    date = today.getDate();
    todayString = today.getFullYear() + "/" +
        ((month<9) ? "0" + (month+1) : month + 1 ) + "/" +
        ((date<10) ? "0" + date : date ) + " 13:37";
    $sectionHeaders = $(".section > h1");

    // GOOGLE MAPZ
    myOptions = {
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
    $sectionHeaders.click(function () {
        if ($(this).is(".enabled")) { // literally, baby!!!
            gotoSection($(".section").index($(this).parent())+1);
        }
    });

    // Generate those flightseats
    generateFlightSeats();

    // CALENDAR
    $("#arrival").val(todayString);
    $("#departure").val(todayString);

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    geocoder = new google.maps.Geocoder();

    // FORM
    fa = $("#fromaddress");
    ta = $("#toaddress");
    fa.keypress(function (event) {
        if (event.which === 13) { // check if enter was pressed
            codeAddress(0, $(this).attr("value"));
        }
    }).focusout(function () {
        if (fa.val() !== '') {
            codeAddress(0, $(this).attr("value"));
        }
    });


    ta.keypress(function (event) {
        if (event.which === 13) { // check if enter was pressed
            codeAddress(1, $(this).attr("value"));
        }
    }).focusout(function () {
        if (ta.val() !== '') {
            codeAddress(1, $(this).attr("value"));
        }
    });

    // If the text field in section 1 changed
    ta.keyup(function (event) {
        firstSectionChange();
    });
    fa.keyup(function (event) {
        firstSectionChange();
    });

    // Set the focus to the "from" text field
    fa.focus();

    // LOGIN
    if (typeof (Storage) !=="undefined") {
        saveFunc = saveDataLocal;
        loadFunc = loadDataLocal;
    } else {
        saveFunc = saveDataCookie;
    }

    loadFunc();

    // HOTELS
    $("#hotels").hide();

    if (ultratravelUserData && ultratravelUserData.loggedin) {
        writeLoginInfo();
    } else {
        $('#login').append('<div id="login_popup">' +
            '<span>Anv&auml;ndarnamn: <input id="login_username" type="text" /></span>' +
            '<span>L&ouml;senord: <input id="login_password" type="password" /></span>' +
            '</div>');

        $('#loginbutton').click(function () {
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

            writeLoginInfo();
        });

        $('#login_password').keypress(function (evt) {
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
                $('#login').append('<div id="login_menu">' +
                        '<input id="saveUser" type="button" value="Spara" />' +
                        '<input id="forgetUser" type="button" value="Glöm" />' +
                        '</div>');
                $('#login_menu input').hide();

                writeLoginInfo();
            }
        });
    }
});


function codeAddress(index,address) {
    var markerIcon, markerShadow, p1, p2;

    geocoder.geocode( { 'address': address}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (markers[index]) {
                markers[index].setMap(null);
            }

            // Make a nice marker yeah
            markerIcon = new google.maps.MarkerImage('images/marker_mint_s.png',
            new google.maps.Size(31,40),    // Size
            new google.maps.Point(0,0),    // Origin
            new google.maps.Point(16,40));    // Anchor

            markerShadow = new google.maps.MarkerImage('images/marker_shadow_s.png',
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

            p1 = markers[0].getPosition();
            p2 = markers[1].getPosition();

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
    var $section, hotelPrice, expand, collapse;

    $section = $(".section:nth-child("+number+")");

    if ($section.height() > minimized) {
        return;
    }

    // if the flight section is selected
    if (number === 2) {
        createFlights();
    }

    // if the boende section is selected
    if (number === 4) {
        if ($section.children("p").children("input").attr("checked")) {
            $section.children(".nextbutton").css("visibility","visible");
            disableSectionsFrom(4, true);
        }
    }

    // if the betalning section is selected
    if (number === 5){
        $("#payment").html("<h2>" + selectedFlight.from + " - " + selectedFlight.to +"</h2>"+flight(selectedFlight));
        hotelPrice = 0;

        // Display a summary of the booking if hotel
        if (!$section.prev().children("p").children("input").attr("checked")) {
            $("#payment").append(hotelStay(selectedHotel));
            hotelPrice = selectedHotel.price;
        }

        $("#payment").append("<div style='float:right'><h2>Totalt: "+(selectedFlight.price + hotelPrice)+":-</h2><input style='margin: 5px 30px 0 0; width: 100px;' type='button' value='Betala' onclick=\"alert('Konto tömt!')\" /></div>");

    }

    $(".active_section").removeClass("active_section");
    $section.children("h1").addClass("active_section");

    expand = {};
    expand.height = maximized;
    $section.animate(expand, 300, null);

    collapse = {};
    collapse.height = minimized;
    $(".section").not($section).animate(collapse, 300, null);

    // Hide calendar
    $("#calendarDiv").css("display", "none");
}

function createFlights() {
    var $flights, $section, from, to;
    $flights = $("#flights");
    $section = $(".section:nth-child(2)");
    from = $("#fromaddress").val();
    to = $("#toaddress").val();

    if (selectedFlight.from !== from || selectedFlight.to !== to) {
        $flights.html('<p>Flights från <b>'+from+'</b> till <b>'+to+'</b></p>');

        currentFlights = new Array(3);
        for(i = 0; i < currentFlights.length; i ++) {
            currentFlights[i] = createRandomFlight();
            $flights.append('<p class="flight">' +
                currentFlights[i].time.start.h + ':' + currentFlights[i].time.start.m +
                ' - ' + currentFlights[i].time.end.h + ':' + currentFlights[i].time.end.m +
                '<br/>' + currentFlights[i].airline +
                '<br/>' + currentFlights[i].aircraft +
                '<br/>' + currentFlights[i].price + ':-' +
                '</p>');
        }
        $(".flight").click(function () {
            $(".flight").not(this).css("background","#fff");
            $(this).css("background",selectionColor);
            $section.children(":first").addClass("approved");
            $section.next().children(":first").addClass("enabled");
            $section.children(".nextbutton").css("visibility","visible");

            // save the flight
            selectedFlight = currentFlights[$(".flight").index(this)];
            selectedFlight.from = from;
            selectedFlight.to = to;

            // clear the flight seat section
            disableSectionsFrom(2, true);
            $(".fseat").css("background","#00f");
        });
    }
}

function generateFlightSeats() {
    var $section, $flightseats, $fsection, $frow, $fcol, i, j, k, l, fn;
    $section = $(".section:nth-child(3)");
    $flightseats = $("#flightseats");

    fn = function () {
        $(".fseat").not(this).css("background","#00f");
        $(this).css("background","#f00");

        $section.children(":first").addClass("approved");
        $section.next().children(":first").addClass("enabled");
        $section.children(".nextbutton").css("visibility","visible");
    };

    for (i = 0; i < 2; i += 1) {
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
                    $fcol.children(":nth-child("+(l+1)+")").click(fn);
                }
            }
        }
    }
}

function firstSectionChange() {
    var $section = $(".section:nth-child(1)");

    if ($("#fromaddress").val() !== "" && $("#toaddress").val() !== "") {
        disableSectionsFrom(1, true);
        $section.children("h1").addClass("approved");
        $section.next().children("h1").addClass("enabled");
        $section.children(".nextbutton").css("visibility","visible");
    } else {
        disableSectionsFrom(1, false);
        $section.next().children("h1").removeClass("enabled");
        $section.children(".nextbutton").css("visibility","hidden");
    }
}

function disableSectionsFrom(number, approved) {
    if (number > 1) {
        $(".section:gt("+(number-2)+")").children("h1").removeClass("approved");
    } else {
        $(".section").children("h1").removeClass("approved");
    }
    if (approved) {
        $(".section:nth-child("+number+")").children("h1").addClass("approved");
    }
    $(".section:gt("+number+")").children("h1").removeClass("enabled");
    $(".section:gt("+(number-1)+")").children(".nextbutton").css("visibility","hidden");
}

// updates the boende section
function updateBoende(checked) {
    var $section, $hotels, fn;
    fn = function () {
        $hotels.children("p").not(this).css("background","#fff");
        $(this).css("background",selectionColor);

        $section.children(":first").addClass("approved");
        $section.next().children(":first").addClass("enabled");
        $section.children(".nextbutton").css("visibility","visible");

        selectedHotel = currentHotels[$hotels.children("p").index(this)];
    };

    $section = $(".section:nth-child(4)");
    $hotels = $("#hotels");

    if (checked) {
        disableSectionsFrom(4, true);
        $hotels.hide();
        $section.children(".nextbutton").css("visibility","visible");
    } else {
        disableSectionsFrom(4, false);

        $section.children(".nextbutton").css("visibility","hidden");
        $hotels.html("");

        currentHotels = new Array(4);
        for (i = 0; i<currentHotels.length; i+=1) {
            currentHotels[i] = createRandomHotel();
            $hotels.append(hotelStay(currentHotels[i]));
            $hotels.children(":nth-child("+(i+1)+")").click(fn);
        }

        $hotels.show();
    }
}
