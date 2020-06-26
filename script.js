//grabbing user search criteria from search bar input-field
$("#searchBtn").on("click", function () {
    event.preventDefault();
    $(".cardRow").empty();
    var searchInput = $("#textField").val().trim();
    if (searchInput === "" || searchInput === undefined) {
        alert("Sorry, we couldn't find that. Please enter a valid city.");
        $("#textField").val("");
    } else {
        openWeatherGet(searchInput);
        zomatoGet(searchInput);
        $("#textField").val("");
    }
});

//grabbing data from openweathermap.org/api 'current weather data' to find latitute and longitude to plug into onecall api
function openWeatherGet(citySearch) {

    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // console.log(response)
        var cityName = response.name;
        var country = response.sys.country;
        $(".card-title").text(`${cityName}, ${country}`)
        //TODO: later control for 404 return from queryURL.status (undefined)
        // console.log(queryURL.status);
        //         //grabbing data from openweathermap.org 'onecall api' for daily forecast cards
        queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + `${response.coord.lat}` + "&lon=" + `${response.coord.lon}` + "&exclude=minutely,hourly&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response);

            //gathering forecast data for five consecutive days
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
                // console.log(weatherObject);
                //var weatherObject = response.daily[i].weather[0].id

                //stringifying our weatherObject so we can use it as a working variable

                var forecast = {
                    date: convertedDate,
                    temp: response.daily[i].temp.day,
                    humidity: response.daily[i].humidity,
                    //using toLowerCase on weatherObject for ease of image linking
                    description: weatherObject.toLowerCase(),
                    card: $("#cardRow1")
                }

                // console.log(forecast.description);
                //still need working weather icon link, and alt is not displaying for some reason (syntax error?)
                //html syntax of our forecast cards
                var sourceString = `weather-icons/${forecast.description}.png`
                // console.log(sourceString);
                // console.log(forecast);
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
            console.log(response);

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