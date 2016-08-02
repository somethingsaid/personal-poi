// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' module and service.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gmapservice']);
addCtrl.controller('addCtrl', ['$scope', '$rootScope', '$http', 'geolocation', 'gmapservice', function($scope, $rootScope, $http, geolocation, gmapservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    $scope.useAddress = false;
    var coords = {};
    var lat = 0;
    var long = 0;

    // Functions
    // ----------------------------------------------------------------------------
    // Get coordinates based on mouse click on $broadcast('mapclick')
    $rootScope.$on("mapclick", function(){

        // Use gmapservice click functions to update form
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gmapservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gmapservice.clickLong).toFixed(3);
        });
    });
    // Creates a new point of interest based on the form fields
    $scope.createPoint = function() {

        // Grabs all of the text box fields
        var pointData = {
            nickname: $scope.formData.nickname,
            keywords: $scope.formData.keywords.replace(' ', '').split(','), // parse into an array of keywords
            location: [$scope.formData.longitude, $scope.formData.latitude]
        };

        // Saves the point of interest data to the db
        $http.post('/points', pointData)
            .success(function (data) {

                // Once complete, clear the form
                $scope.formData.username = "";
                $scope.formData.keywords = "";
                $scope.formData.longitude = "";
                $scope.formData.latitude = "";
                
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        // Refresh the map with new data
        gmapservice.refresh($scope.formData.latitude, $scope.formData.longitude);
    };
}]);