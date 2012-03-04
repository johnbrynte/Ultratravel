/**
 * Script.js
 * @author John Brynte Turesson
 * @author Anton Erholt
 */

var minimized = 35;
var maximized = 400;

var map;
var geocoder;
var line;
var markers = [];

var saveFunc;
var loadFunc;

var ultratravelUserData;

$(document).ready(function() {
		      $(".section").height(minimized);
		      $("#booking .section:first-child").height(maximized);
		      var sectionHeaders = $(".section > h1");
		      sectionHeaders.first().addClass("active_section");

		sectionHeaders.click(function() {
			gotoSection($(".section").index($(this).parent())+1);
		});

		      // CALENDAR
		      var today = new Date();
		      var month = today.getMonth();
		      var date = today.getDate();
		      var string = today.getFullYear()+"/"+
			  ((month<9)?"0"+(month+1):month+1)+"/"+
			  ((date<10)?"0"+date:date)+" 13:37";
		      document.forms[0].arrival.value = string;
		      document.forms[0].departure.value = string;
		      
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
					   { saturation: -100 }
				       ]
				   }]
		      };
		      
		      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		      geocoder = new google.maps.Geocoder();
		      

		      // FORM
		      $("#fromaddress").keypress(function(event) {
						     if(event.which == 13) {
							 codeAddress(0, $(this).attr("value"));
						     }
						 });
		      
		      $("#toaddress").keypress(function(event) {
						   if(event.which == 13) {
						       codeAddress(1, $(this).attr("value"));
						   }
					       });

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
					     + '<form>'
					     + '<p>Anv&auml;ndarnamn: <input id="login_username" type="text" /></p>'
					     + '<p>L&ouml;senord: <input id="login_password" type="password" /></p>'
					     + '<input id="loginbutton" type="button" value="Logga in">'
					     + '</form>'
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
								      strokeColor: "#f00",
								      geodesic: true
								  });
				  map.setCenter(google.maps.geometry.spherical.interpolate(p1,p2,0.5));
			      }
			  } else {
			      alert("Geocode was not successful for the following reason: " + status);
			  }
		      });
}

function gotoSection(section) {
	var $link = $(".section:nth-child("+section+")");
	if ($link.height() > minimized) { 
		return;
	}

	$(".active_section").removeClass("active_section");
	$link.children(":first").addClass("active_section");

	var expand = {};
	expand["height"] = maximized;
	$link.animate(expand, 300, null);

	var collapse = {};
	collapse["height"] = minimized;
	$(".section").not($link).animate(collapse, 300, null);

	// Hide calendar
	$("#calendarDiv").css("display", "none");
}
