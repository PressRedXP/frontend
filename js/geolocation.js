
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
	var peopleListUrl = "http://justmeet-backend.herokuapp.com/people/mrbuttons/contacts";
	// TODO pass in my id instead of "mrbuttons"
//    $.ajax({url: peopleListUrl,success:function(result){
//      $("#demo").html(result);
//    }});


	$.getJSON( peopleListUrl, function( data ) {
		var items = [];
//		items.push( "<li id='titleEntry' class='list-group-item disabled'>Your contacts:</li>" );
		$.each( data.people, function( key, person ) {
			//items.push( "<li id='" + person.id + "' class='list-group-item'>" + person.name + "</li>" );
			items.push( "<option value='" + person.id + "' >" + person.name + "</option>" );
		});
		
		$("#row-1-left").html($( "<select/>", {
			"multiple": "multiple",
			"class": "my-contacts-list",
			html: items.join( "" )
		}));
		
		$('.my-contacts-list').multiselect();
	
	
	});


// example POST
//	$.ajax({
//	  type: "POST",
//	  url: "some.php",
//	  data: { name: "John", location: "Boston" }
//	})
//	  .done(function( msg ) {
//	    alert( "Data Saved: " + msg );
//	  });
}

function createMeeting() {

	// POST to meetings
	// follow href in returned JSON and GET
	// use returned location to draw map
	
	$.ajax({
	type: "POST",
	url: "https://justmeet-backend.herokuapp.com/meetings",
	data: { }
	})
	.done(function( msg ) {
	  var data = JSON.parse(msg);
	   getMeeting(data.href);
	 //alert( "Data Saved: " + data.href);
	 });
	 
	
}

function getMeeting(href) {
$.getJSON( href, function( data ) {
showPosition({coords:{latitude:data.position.latitude,longitude:data.position.longitude}});
//alert (data);
});

}
