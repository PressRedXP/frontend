
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
}

function getPeopleList() {
	var peopleListUrl = "http://justmeet-backend.herokuapp.com/people/mrbuttons/contacts";
	// TODO pass in my id instead of "mrbuttons"
//    $.ajax({url: peopleListUrl,success:function(result){
//      $("#demo").html(result);
//    }});


	$.getJSON( peopleListUrl, function( data ) {
		var items = [];
		
		$.each( data.people, function( key, person ) {
			items.push( "<li id='" + key + "' class='list-group-item'>" + person.name + "</li>" );
		});
		
		$("#row-1-left").html($( "<ul/>", {
			"class": "list-group",
			html: items.join( "" )
		}));
	
	
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

