//secret key for making multiple pindrops
// sk.eyJ1Ijoid2lsZDFrIiwiYSI6ImNrYndwM3A0OTBpNHozMXAzMG8zbTY4YjcifQ.Ery_IrBQ7OHK8e07QeV7pw

//grabbing user search criteria from search bar input-field
$(document).on("click", ".searchBtn", function () {
    event.preventDefault();
    $(".cardRow").empty();
    var searchInput = $(".textField").val().trim();
    openWeatherGet(searchInput);
});
//setting fallback image for restaurant cards
//tabs function
function createTab() {
    var tabBar = `<div class="row tabRow">
     <div class="col s12">
       <ul class="tabs cyan lighten-5">
         <li class="tab col s3"><a class="active black-text" href="#cardRow1">Weather</a></li>
         <li class="tab col s3"><a class="black-text" href="#cardRow2">Restaurants</a></li>
       </ul>
     </div>
   
   </div>`
    $(`.container`).append(tabBar)
}
//grabbing data from openweathermap.org/api 'current weather data' to find latitute and longitude to plug into onecall api
function openWeatherGet(citySearch) {
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        $(".subBody").empty()
        createNav()
        $(".subBody").append($("<div class = container>"))
        zomatoGet(citySearch);
        $(".textField").val("");
        var cityName = response.name;
        //calls the coord for the location put in the search bar
        var mapCord = response['coord']
        var country = response.sys.country;
        var mapCreate = ` <div class="row firstRow">
                            <div class="col s12">
                                <div class="card">
                                    <div class="map-image card-image">
                                        <div id='map' style='width: 100%; height: 400px;'></div>
                                        <span class="card-title test">Card Title</span>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>`
        $(".container").prepend(mapCreate)
        mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsZDFrIiwiYSI6ImNrYnYybnNyMDAyMXgzNG54OXU1Z2drcGYifQ.MUn86umO4rIoDnJHpdQuTw';
        var map = new mapboxgl.Map({

            container: 'map',
            style: 'mapbox://styles/wild1k/ckbwlrt6r18mq1ho6214s9ip6',
            center: [-122.04, 47.507],
            zoom: 13,
            attributionControl: false
        });

        //adding markers to city search
        var marker = new mapboxgl.Marker()
            .setLngLat([mapCord.lon, mapCord.lat])
            .addTo(map); // add the marker to the map

        // Makes the map fly to the destination 
        // Makes the title the name of the country and city
        map.addControl(new mapboxgl.AttributionControl(), 'top-left');
        map.flyTo({ center: [mapCord.lon, mapCord.lat], essential: true });
        $(".card-title").text(`${cityName}, ${country}`)
        //TODO: later control for 404 return from queryURL.status (undefined)
        // console.log(queryURL.status);
        //         //grabbing data from openweathermap.org 'onecall api' for daily forecast cards
        queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + `${response.coord.lat}` + "&lon=" + `${response.coord.lon}` + "&exclude=minutely,hourly&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            createTab();
            $(".tabRow").append('<div class="row cardRow firstRow" id="cardRow1"></div>')                    // Creates row for weather cards
            for (i = 0; i < 6; i++) {                                                                           // gathering forecast data for five consecutive days
                var unixTimestamp = response.daily[i].dt                                                        // timestamp in unix
                var unixDate = new Date(unixTimestamp * 1000);                                                  // getting date in unix
                var convertedDate = moment(unixDate).format("MM/DD/YYYY");                                      // converting unix date to useable moment format
                var dayOfWeek = moment(unixDate).format("ddd");                                                 // day of week for top of cards
                var weatherObject = response.daily[i].weather[0].main;                                          // grabbing main weather description to narrow down icon variables

                var forecast = {                                                                                // Forecast Object
                    date: convertedDate,
                    temp: response.daily[i].temp.day,
                    humidity: response.daily[i].humidity,
                    description: weatherObject.toLowerCase(),
                    card: $("#cardRow1")
                }

                var sourceString = `images/${forecast.description}.png`
                //html syntax of our forecast cards
                if (i === 5) {
                    var details = `<div class="col l2 m4 s6">
                                    <div class="card small">
                                        <div class="card-image">
                                            <img src= ${sourceString || "images/weather-placeholder.png"}>
                                        </div>
                                        <div class="card-content">
                                            <p>${dayOfWeek}</p>
                                            <p>${forecast.date}</p>
                                            <p>Temp: ${forecast.temp}°F</p>
                                            <p>Humidity: ${forecast.humidity}%</p>
                                        </div>
                                    </div>`
                    forecast.card.append(details);
                } else {
                    var details = `<div class="col l2 m4 s6">
                                    <div class="card small">
                                        <div class="card-image">
                                            <img class="weatherImg" src= ${sourceString || "images/weather-placeholder.png"}>
                                        </div>
                                        <div class="card-content">
                                            <p class="theBoldTitle">${dayOfWeek}</p>
                                            <p>${forecast.date}</p>
                                            <p>Temp: ${forecast.temp}°F</p>
                                            <p>Humidity: ${forecast.humidity}%</p>
                                        </div>
                                    </div>`
                    forecast.card.append(details);
                }                                                                 //appending forecast details onto cards for five day forecast 
            };
        });
    }).catch(function (error) {                                                    //Modal popup for incorrect city
        $('#modal').modal();
    $('#modal').modal('open'); 
        $(".textField").val("");
    });
}
function zomatoGet(citySearch) {
    var key = "75a4bd45f80155eb1fab5d411cf931c6";
    queryURL = "https://developers.zomato.com/api/v2.1/locations?query=" + citySearch + "&count=1";
    $.ajax({
        url: queryURL,
        method: "GET",
        headers: { "user-key": key }
    }).then(function (response) {
        var locationID = response.location_suggestions[0].entity_id
        var locationType = response.location_suggestions[0].entity_type
        queryURL = "https://developers.zomato.com/api/v2.1/location_details?entity_id=" + locationID + "&entity_type=" + locationType;
        $.ajax({
            url: queryURL,
            method: "GET",
            headers: { "user-key": key }
        }).then(function (response) {
            $(".tabRow").append('<div class="row cardRow firstRow" id="cardRow2"></div>')
            for (i = 0; i < 6; i++) {
                var restaurant = {
                    name: response.best_rated_restaurant[i].restaurant.name,
                    menu: response.best_rated_restaurant[i].restaurant.menu_url,
                    cuisine: response.best_rated_restaurant[i].restaurant.cuisines,
                    thumbnail: response.best_rated_restaurant[i].restaurant.thumb,
                    card: $("#cardRow2")
                };
                console.log(restaurant.cuisine);
                if (i === 5) {
                    details = `<div class="col l2 m4 s6">
                <div class="card medium">
                        <div class="card-image">
                        <img src= ${restaurant.thumbnail || "images/restaurant-placeholder.png"}>
                        </div>
                        <div class="card-content">
                        <p class="limit-text theBoldTitle" rows="2">${restaurant.name}</p>
                        <p class="limit-text" rows="2">${restaurant.cuisine}</p>
                        <p><a href="${restaurant.menu}" target="_blank">See the menu!</a></p>
                        </div>
                        </div>`

                    restaurant.card.append(details);
                } else {
                    details = `<div class="col l2 m4 s6">
                <div class="card medium">
                        <div class="card-image">
                        <img class="restaurantImg" alt="restaurant thumbnail" src= ${restaurant.thumbnail || "images/restaurant-placeholder.png"}>
                        </div>
                        <div class="card-content">
                        <p class="limit-text theBoldTitle" rows="2">${restaurant.name}</p>
                        <p class="limit-text" rows="2">${restaurant.cuisine}</p>
                        <p><a href="${restaurant.menu}" target="_blank">See the menu!</a></p>
                        </div>
                        </div>`

                    restaurant.card.append(details);
                }


            }

            $('ul.tabs').tabs();
        });
    });
}
function createNav() {                                                                                           // Creates the navbar
    var navBar = `<nav class="N/A transparent nav-wrapper">
    <a href="#" class="left brand-logo cyan-text text-darken-1">Wavel</a>
    <ul class="right">
      <li>
        <div class="row">
          <div class="col s12">
            <div class="row" id="topbarsearch">
              <div class="input-field col m12 s9 push-s3 red-text">
                <input class ="textField" type="text" placeholder="City Name Here"  id="autocomplete-input"
                  class="autocomplete black-text">
              </div>
            </div>
          </div>
        </div>
      </li>
      <li><a class="button waves-effect deep-purple accent-1 searchBtn" >Search</a></li>
    </ul>
  </nav>
  <br>`
    $('.subBody').prepend(navBar)                                                                               // Prepends the Navbar to the subBody class
}
