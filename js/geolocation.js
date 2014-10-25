
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

	// TODO pass in my id instead of "mrbuttons"
    $.ajax({url:"http://justmeet-backend.herokuapp.com/people/mrbuttons/contacts",success:function(result){
      $("#demo").html(result);
    }});



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