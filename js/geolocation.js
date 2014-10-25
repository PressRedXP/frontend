function getUserId() {
    name = 'user-id'.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function getLocation() {
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition);
} else {
  error('Geo Location is not supported');
}
}


function showPosition(position) {
 var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
   
   var options = {
     zoom: 15,
     center: coords,
     mapTypeControl: false,
     navigationControlOptions: {
     	style: google.maps.NavigationControlStyle.SMALL
     },
     mapTypeId: google.maps.MapTypeId.ROADMAP
   };
   var map = new google.maps.Map(document.getElementById("test"), options);
 
   var marker = new google.maps.Marker({
       position: coords,
       map: map,
       title:"You are here!"
   });
}

function getPeopleList() {
	var peopleListUrl = "http://justmeet-backend.herokuapp.com/people/" + getUserId() + "/contacts";


	$.getJSON( peopleListUrl, function( data ) {
		var items = [];
		$.each( data.people, function( key, person ) {
			items.push( "<option value='" + person.id + "' >" + person.name + "</option>" );
		});
		
		$("#row-1-left").html($( "<select/>", {
			"multiple": "multiple",
			"class": "my-contacts-list",
			html: items.join( "" )
		}));
		
		$('.my-contacts-list').multiselect();
	});
}

function createMeeting() {

	// POST to meetings
	// follow href in returned JSON and GET
	// use returned location to draw map
	
	var peopleSelected = $('.my-contacts-list option:selected');
    
    
    if (peopleSelected.length == 0) {
    	alert("Please pick some friends to meet");
    	return;
    }
    
    var peopleArray = [];
    for(var i = 0; i < peopleSelected.length; i++){
        peopleArray.push({id: $(peopleSelected[i]).val()});
    }
	
	
	var payload = {organiser: {id: getUserId(), position:{latitude: 1, longitude: 1}}, people: peopleArray};
	
	$.ajax({
		type: "POST",
		url: "https://justmeet-backend.herokuapp.com/meetings",
		data: JSON.stringify(payload)
	})
	.done(function( msg ) {
		var data = JSON.parse(msg);
		getMeeting(data.href);
	});
	 
	
}

function getMeeting(href) {
$.getJSON( href, function( data ) {
showPosition({coords:{latitude:data.position.latitude,longitude:data.position.longitude}});
//alert (data);
});

}
