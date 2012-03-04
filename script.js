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
		if ($(this).parent().height() > minimized) 
			return;

		$(".active_section").removeClass("active_section");
		$(this).addClass("active_section");

		var collapse = {};
		collapse["height"] = minimized;
		$("#booking > .section:not(this:parent)").animate(collapse, 300, null);

		var parameters = {};
		parameters["height"] = maximized;
		$(this).parent().animate(parameters, 200, null);

		// Hide calendar
		$("#calendarDiv").css("display", "none");
	});

	// CALENDAR
	var today = new Date();
	var string = today.getFullYear()+"/"+
		((today.getMonth()<9)?"0"+(today.getMonth()+1):today.getMonth()+1)+"/"+
		((today.getDate()<10)?"0"+today.getDate():today.getDate())+" 13:37";
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

      document.getElementById("fromaddress").focus();
  });

		      $(".date").dateinput({
					       format: 'dddd dd, mmmm yyyy',	// the format displayed for the user
					       selectors: true,             	// whether month/year dropdowns are shown
					       min: 0,                    // min selectable day (100 days backwards)
					       max: 1000,                    	// max selectable day (100 days onwards)
					       offset: [10, 20],            	// tweak the position of the calendar
					       speed: 'fast',               	// calendar reveal speed
					       firstDay: 1                  	// which day starts a week. 0 = sunday, 1 = monday etc..
					   });
		      $(".section").height(minimized);
		      $("#booking .section:first-child").height(maximized);
		      var sectionHeaders = $(".section > h1");
		      sectionHeaders.first().addClass("active_section");

		      sectionHeaders.click(function() {
					       if ($(this).parent().height() > minimized) 
						   return;
					       
					       $(".active_section").removeClass("active_section");
					       $(this).addClass("active_section");


					       var collapse = {};
					       collapse["height"] = minimized;
					       $("#booking > .section:not(this:parent)").animate(collapse, 300, null);

					       var parameters = {};
					       parameters["height"] = maximized;
					       $(this).parent().animate(parameters, 200, null);
					   });


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

		      document.getElementById("fromaddress").focus();

		      // Login	  
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
					     + '<label>Anv&auml;ndarnamn: <input id="login_username" type="text" /></label>'
					     + '<label>L&ouml;senord: <input id="login_password" type="password" /></label>'
					     + '<input id="loginbutton" type="submit" value="Logga in">'
					     + '</form>'
					     + '</div>');

			  // What happens when we click login?
			  $('#loginbutton').click(function(){
						      ultratravelUserData = new UserData();
						      ultratravelUserData.loggedin = true;
						      ultratravelUserData.username = $('#login_username').val();
						      ultratravelUserData.password = $('#login_password').val();
					
						      $('#login_popup').remove();
						      writeLoginInfo();
						  });
		      }
		  });
//>>>>>>> a2d2114aa753ff3aaed7e252831910143017fc22


function codeAddress(index,address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
			      if (markers[index])
				  markers[index].setMap(null);

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