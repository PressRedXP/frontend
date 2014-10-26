var pollingForMeetingsTime = 5000;
var meetingsPoll;

function startPollingForMeetings() {

	var meetingsPollEndpoint = "http://justmeet-backend.herokuapp.com/people/" + getUserId() + "/meetings";

	meetingsPoll = setInterval(function(){
		$.getJSON(meetingsPollEndpoint, function( data ) {
			$.each( data.meetings, function( key, meeting ) {
				if (meeting.status === 'pending') {
					showMeetingAlert(meeting);
				} else if (meeting.status === 'confirmed') {
					getMeeting(meeting.href);
				}
			});	
		});
		    
	}, pollingForMeetingsTime);

}

function showMeetingAlert(meeting) {

    var items = [];
    $.each( meeting.people, function( key, person ) {
		items.push( person.name);
	});

	var alert = '<div class="alert alert-info" role="alert">You are invited to a meeting with ' + items.join( " ") +'<a href="#" class="alert-link accept-meeting" >Accept</a></div>';


	$('.meeting-alert-container').html(alert);
	
	$('.accept-meeting').bind('click', function () {
	    acceptMeeting(meeting.href);
	});
	
//	$('.accept-meeting').html(acceptButton);
}

function acceptMeeting(href) {
	getLocation(function(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		var payload = {status: 'confirmed', position:{latitude: latitude, longitude: longitude}};
		
		var url = href + "/people/" + getUserId() + "/attendance";
		
		$.ajax({
			type: "PUT",
			url: url,
			data: JSON.stringify(payload)
		})
		.done(function( msg ) {
			getMeeting(href);
		});
		
		
		
	});
}

function stopPollingForMeetings() {
	clearInterval(meetingsPoll);
}

function getUserId() {
    name = 'user-id'.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function getLocation(callback) {
	if (navigator.geolocation) {
	  	return navigator.geolocation.getCurrentPosition(callback);
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
	var latitude, longitude;
	
	var position = getLocation(function(position){
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		var payload = {organiser: {id: getUserId(), position:{latitude: latitude, longitude: longitude}}, people: peopleArray};
		
		$.ajax({
			type: "POST",
			url: "https://justmeet-backend.herokuapp.com/meetings",
			data: JSON.stringify(payload)
		})
		.done(function( msg ) {
			var data = JSON.parse(msg);
			getMeeting(data.href);
		});
	});	
}

function getMeeting(href) {
	$.getJSON( href, function( data ) {
		if (data.status == "confirmed") {
			stopPollingForMeetings();
			showPosition({coords:{latitude:data.position.latitude,longitude:data.position.longitude}});
		}
	});

}

function showLoadingGif () {
$(".loading-gif").show();

}

