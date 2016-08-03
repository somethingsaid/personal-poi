angular.module('gmapservice', [])
    .factory('gmapservice', function($http, $rootScope){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];

        // Initialize to geographic centre of the world: Great Pyramid of Giza
        var selectedLat = 30.00;
        var selectedLong = 31.00;

        // Handling Clicks and location selection
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude){

            // Initialize empty holding location
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // AJAX Get existing pois from database
            $http.get('/points').success(function(response){

                // Convert the results into Google Map Format
                locations = convertToMapPoints(response);

                initialize(latitude, longitude);
            }).error(function(){});
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of points of interests into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var point = response[i];

                // Create popup windows for each record
                var  contentString =
                    '<p><b>Nickname</b>: ' + point.nickname +
                    '<br><b>Keywords</b>: ' + point.keywords +
                    '<br><b>Latitude:</b> ' + point.location[1] +
                    '<br><b>Longitude:</b> ' + point.location[0] +
                    '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                // Mongo stores geocoordinates as [Lng, Lat]
                locations.push({
                    latlon: new google.maps.LatLng(point.location[1], point.location[0]),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    nickname: point.nickname,
                    keywords: point.keywords,
                });
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };

        // Initializes the map
        var initialize = function(latitude, longitude) {

            // Uses the selected lat, long as starting point
            var myLatLng = {lat: selectedLat, lng: selectedLong};

            // If map has not been created already...
            if (!map){

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 2, // Valid values are 1-8, set at 1 for world level, 8 for street
                    center: myLatLng
                });
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function(n, i){
                var marker = new google.maps.Marker({
                    position: n.latlon,
                    map: map,
                    title: "My World Map",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                });

                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function(e){

                    // When clicked, open the selected marker's message
                    currentSelectedMarker = n;
                    n.message.open(map, marker);
                });
            });

            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(latitude, longitude);
            var marker = new google.maps.Marker({
                position: initialLocation,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Add listener on map click to move bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });

                // Remove previous bouncing marker and create new
                if(lastMarker){
                    lastMarker.setMap(null);
                }
                lastMarker = marker;
                map.panTo(marker.position);

                // Update clickLat and clickLng for form fill
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLng = marker.getPosition().lng();
                $rootScope.$broadcast('mapclick');
            });
        };

    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load',
        googleMapService.refresh(selectedLat, selectedLong)
    );
return googleMapService;
});