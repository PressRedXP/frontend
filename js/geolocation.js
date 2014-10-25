
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
    	var x = document.getElementById("demo");
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
	var x = document.getElementById("demo");
    x.innerHTML="Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;	
}

function getPeopleList() {
	var peopleListUrl = "http://justmeet-backend.herokuapp.com/people/mrbuttons/contacts";
	// TODO pass in my id instead of "mrbuttons"
//    $.ajax({url: peopleListUrl,success:function(result){
//      $("#demo").html(result);
//    }});


	$.getJSON( peopleListUrl, function( data ) {
		var items = [];
		items.push( "<li id='titleEntry' class='list-group-item disabled'>Your contacts:</li>" );
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