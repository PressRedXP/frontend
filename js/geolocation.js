function UserUtils() {
	var userId;
	
	this.id = function() {
		if (userId === undefined) {
			userId = getUserId();
		}
		return userId;
	}
	
	this.getLocation = function(callback) {
		if (navigator.geolocation) {
		  	return navigator.geolocation.getCurrentPosition(callback);
		} else {
		  	error('Geo Location is not supported');
		}
	}
	
	var getUserId = function() {
	    name = 'user-id'.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

var userUtils = new UserUtils();

/**
 * Show an alert when user is invited to a meeting
 */
function showMeetingAlert(meeting) {

    var items = [];
    $.each( meeting.people, function( key, person ) {
	    if (person.id !== userUtils.id()) {
	    	items.push(person.name);
	    }
	});

	var alert = '<div class="alert alert-info" role="alert">You are invited to a meeting with ' + items.join(", ") +'<a href="#" class="alert-link accept-meeting" > Accept</a></div>';


	$('.meeting-alert-container').html(alert);
	
	$('.accept-meeting').bind('click', function () {
	    acceptMeeting(meeting.href);
	});
	
//	$('.accept-meeting').html(acceptButton);
}

/**
 * Show an alert when user has accepted a meeting, but other invitees have not yet confirmed
 */
function showAwaitingConfirmationAlert(meeting) {

	var unconfirmed = [];
	$.each(meeting.people, function(key, person){
		if (person.status == 'pending') {
			unconfirmed.push(person.name);
		}
	});
	
	var alert = '<div class="alert alert-info" role="alert">You are invited to a meeting. Awaiting confirmation from ' + unconfirmed.join(", ") + '.</div>';

	$('.meeting-alert-container').html(alert);
}

/**
 * Clear meeting alert
 */
function clearMeetingAlert() {
	$('.meeting-alert-container').html("");
}

/**
 * Make a request to the server to accept a meeting
 */
function acceptMeeting(href) {
	userUtils.getLocation(function(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		var payload = {status: 'confirmed', position:{latitude: latitude, longitude: longitude}};
		var url = href + "/people/" + userUtils.id() + "/attendance";
		
		$.ajax({
			type: "PUT",
			url: url,
			data: JSON.stringify(payload)
		})
		.done(function( msg ) {
			clearMeetingAlert();
		});
	});
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
	var map = new google.maps.Map(document.getElementById("map_container"), options);
	
	var marker = new google.maps.Marker({
	    position: coords,
	    map: map,
	    title:"You are here!"
	});
}

function getPeopleList() {
	var peopleListUrl = "http://justmeet-backend.herokuapp.com/people/" + userUtils.id() + "/contacts";


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
	
	var position = userUtils.getLocation(function(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		var payload = {organiser: {id: userUtils.id(), position:{latitude: latitude, longitude: longitude}}, people: peopleArray};
		
		$.ajax({
			type: "POST",
			url: "https://justmeet-backend.herokuapp.com/meetings",
			data: JSON.stringify(payload)
		})
		.done(function( msg ) {
			// TODO remove this - no action required
		});
	});	
}

function showLoadingGif () {
	$(".loading-gif").show();
}

function displayMeeting(meeting) {
	var names = [];
	$.each(meeting.people, function(key, person){
		if (person.id !== userUtils.id()) {
			names.push(person.name);
		}
	});
	$('.meeting-alert-container').html('<div class="alert alert-success" role="alert">You are meeting ' + names.join(", ") + ' at SOME_ADDRESS.</div>');

	showPosition({coords: meeting.position});
}


var pollForMeetings = new GetMeetings(userUtils.id(), showMeetingAlert, showAwaitingConfirmationAlert, displayMeeting);

function GetMeetings(userId, meetingAlertCallback, awaitingConfirmationCallback, displayMeetingCallback) {
	var pollTime = 5000;
	var userId = userId;
	var url = "http://justmeet-backend.herokuapp.com/people/" + userId + "/meetings";
	var meetingAlertCallback = meetingAlertCallback;
	var awaitingConfirmationCallback = awaitingConfirmationCallback;
	var displayMeetingCallback = displayMeetingCallback;
	var poll;
	var that = this;
	
	this.start = function() {
		poll = setInterval(_pollCallback, pollTime);
	};
	
	this.stop = function() {
		clearInterval(poll);
	}
	
	var _pollCallback = function(){
		$.getJSON(url, function(data) {
			if (data.meetings.length > 0) {
				var meeting = data.meetings[0];
				if (meeting.status === 'pending') {	
					if (!_amIConfirmedForMeeting(meeting)) {
						meetingAlertCallback(meeting);
					} else {
						awaitingConfirmationCallback(meeting);
					}
				} else if (meeting.status === 'confirmed') {
					that.stop();
					displayMeetingCallback(meeting);
				}
			}
		});	    
	};
	
	var _amIConfirmedForMeeting = function (meeting) {
		var amConfirmed = false;
		$.each(meeting.people, function(key, person){
			if ((person.id === userId) && (person.status === 'confirmed')) {
				amConfirmed = true;
			}
		});
		return amConfirmed;
	}
}
