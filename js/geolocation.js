
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