//grabbing user search criteria from search bar input-field
$(".searchBtn").on("click", function () {
    event.preventDefault();
    console.log("You Clicked a button")
    $(".cardRow").empty();
    var searchInput = $(".textField").val().trim();
    if (searchInput === "" || searchInput === undefined) {
        alert("Sorry, we couldn't find that. Please enter a valid city.");
        $(".textField").val("");
    } else {
        $(".subBody").empty()
        createNav()
        $(".subBody").append($("<div class = container>"))
        openWeatherGet(searchInput);
        zomatoGet(searchInput);
        $(".textField").val("");

    }
});
//grabbing data from openweathermap.org/api 'current weather data' to find latitute and longitude to plug into onecall api
function openWeatherGet(citySearch) {
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var cityName = response.name;
        //calls the coord for the location put in the search bar
        var mapCord = response['coord']
        //makes the map fly to the destination 
        var country = response.sys.country;
        var mapCreate = ` <div class="row firstRow">
                            <div class="col m6 push-m3 s12">
                                <div class="card">
                                    <div class="map-image card-image">
                                        <div id='map' style='width: 100%; height: 300px;'></div>
                                        <span class="card-title">Card Title</span>
                                    </div>
                                </div>
                            </div>
                        </div>`
        $(".container").prepend(mapCreate)
        mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsZDFrIiwiYSI6ImNrYnYybnNyMDAyMXgzNG54OXU1Z2drcGYifQ.MUn86umO4rIoDnJHpdQuTw';
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-77.04, 38.907],
                zoom: 11.15,
                attributionControl: false
            });
        map.addControl(new mapboxgl.AttributionControl(), 'top-left');
        map.flyTo({ center: [mapCord.lon, mapCord.lat], essential: true });
        $(".card-title").text(`${cityName}, ${country}`)
        //TODO: later control for 404 return from queryURL.status (undefined)
        // console.log(queryURL.status);
        //         //grabbing data from openweathermap.org 'onecall api' for daily forecast cards
        queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + `${response.coord.lat}` + "&lon=" + `${response.coord.lon}` + "&exclude=minutely,hourly&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //gathering forecast data for five consecutive days
            $(".container").append('<div class="row cardRow firstRow" id="cardRow1"></div>')
            for (i = 0; i < 5; i++) {
                //timestamp in unix
                var unixTimestamp = response.daily[i].dt
                //getting date in unix
                var unixDate = new Date(unixTimestamp * 1000);
                //converting unix date to useable moment format
                var convertedDate = moment(unixDate).format("MM/DD/YYYY");
                //day of week for top of cards
                var dayOfWeek = moment(unixDate).format("ddd");
                //grabbing main weather description to narrow down icon variables
                var weatherObject = response.daily[i].weather[0].main;
                //if we want more detailed weather for a broader range of icons by id we can use:
                //var weatherObject = response.daily[i].weather[0].id

                var forecast = {
                    date: convertedDate,
                    temp: response.daily[i].temp.day,
                    humidity: response.daily[i].humidity,
                    description: weatherObject.toLowerCase(),
                    card: $("#cardRow1")
                }
                //html syntax of our forecast cards
                var sourceString = `weather-icons/${forecast.description}.png`
                var details = `<div class="col m2 s6 push-m1">
                                    <div class="card small">
                                        <div class="card-image">
                                            <img src= ${sourceString}>
                                        </div>
                                        <div class="card-content">
                                            <p>${dayOfWeek}</p>
                                            <p>${forecast.date}</p>
                                            <p>Temp: ${forecast.temp}°F</p>
                                            <p>Humidity: ${forecast.humidity}%</p>
                                        </div>
                                    </div>`
                //appending forecast details onto cards for five day forecast
                function makeForecast() {
                    forecast.card.append(details);
                }
                makeForecast();
            };
        });
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
        // console.log(response)
        var locationID = response.location_suggestions[0].entity_id
        var locationType = response.location_suggestions[0].entity_type
        queryURL = "https://developers.zomato.com/api/v2.1/location_details?entity_id=" + locationID + "&entity_type=" + locationType;
        $.ajax({
            url: queryURL,
            method: "GET",
            headers: { "user-key": key }
        }).then(function (response) {
            $(".container").append('<div class="row cardRow firstRow" id="cardRow2"></div>')
            for (i = 0; i < 5; i++) {
                var restaurant = {
                    name: response.best_rated_restaurant[i].restaurant.name,
                    menu: response.best_rated_restaurant[i].restaurant.menu_url,
                    cuisine: response.best_rated_restaurant[i].restaurant.cuisines,
                    thumbnail: response.best_rated_restaurant[i].restaurant.thumb,
                    card: $("#cardRow2")
                };
                console.log(restaurant);
                details = `<div class="col m2 s6 push-m1">
                <div class="card small">
                        <div class="card-image">
                        <img src= ${restaurant.thumbnail}>
                        </div>
                        <div class="card-content">
                        <p>${restaurant.name}</p>
                        <p>${restaurant.cuisine}</p>
                        <p><a href="${restaurant.menu}" target="_blank">See the menu!</a></p>
                        </div>
                        </div>`

                function renderRestaurants() {
                    restaurant.card.append(details);
                }
                renderRestaurants();
            }
        });
    });
}
function createNav(){
    var navBar = `<nav class="N/A transparent nav-wrapper">
    <a href="#" class="left brand-logo cyan-text text-darken-1">Wavel</a>
    <ul class="right">
      <li>
        <div class="row">
          <div class="col s12">
            <div class="row" id="topbarsearch">
              <div class="input-field col s6 s12 red-text">
                <input class ="textField" type="text" placeholder="City Name Here"  id="autocomplete-input"
                  class="autocomplete black-text">
              </div>
            </div>
          </div>
        </div>
      </li>
      <li><a class="button deep-purple accent-1 searchBtn" >Search</a></li>
    </ul>
  </nav>
  <br>`
    $('.subBody').prepend(navBar)
    $(".searchBtn").on("click", function () {
        event.preventDefault();
        console.log("You Clicked a button")
        $(".cardRow").empty();
        var searchInput = $(".textField").val().trim();
        if (searchInput === "" || searchInput === undefined) {
            alert("Sorry, we couldn't find that. Please enter a valid city.");
            $(".textField").val("");
        } else {
            $(".subBody").empty()
            createNav()
            $(".subBody").append($("<div class = container>"))
            openWeatherGet(searchInput);
            zomatoGet(searchInput);
            $(".textField").val("");
        }
    });
}