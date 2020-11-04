
var app = angular.module("pooledFundModule", []) //Create module with name pooledFundModule
    .controller("pooledFundController", function ($scope, $http) { //Create controller with name pooledFundController

        //Call PooledFund API and get the date
        var siteUrl = window.location;
        $http({
            method: "GET",
            url: "https://cbpfapi.unocha.org/vo1/odata/Poolfund"
        })
            //Once Data is fetched add it in $scope
            .then(function (response) {
                var payload = response.data;
                $scope.pooledFunds = payload.value;

                //Select the selected value to AFG by default
                var selectedPooledFund = $(payload.value).map(function (i, e) {
                    if (e.PoolfundCodeAbbrv === 'AFG23')
                        return e;
                });

                if (selectedPooledFund.length > 0)
                    $scope.selectedPooledFund = selectedPooledFund[0];
            },
            function (reason) {
                $scope.error = reason.data;
            }
            );

    });