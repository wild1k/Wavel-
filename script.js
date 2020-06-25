//grabbing user search criteria from search bar input-field
$("#searchBtn").on("click", function () {
    event.preventDefault();
    var searchInput = $("#autocomplete-input").val();
    $("#autocomplete-input").val("");
    console.log(searchInput);
    console.log("click");
    openWeatherGet(searchInput);
});

//grabbing data from openweathermap.org/api 'current weather data' to find latitute and longitude to plug into onecall api
function openWeatherGet(citySearch) {

    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        //         //grabbing data from openweathermap.org 'onecall api' for daily forecast cards
        queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + `${response.coord.lat}` + "&lon=" + `${response.coord.lon}` + "&exclude=minutely,hourly&appid=51eff38dc476b28387cdbdbd9705ea5b&units=imperial";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            //gathering forecast data for five consecutive days
            for (i = 0; i < 5; i++) {
                //timestamp in unix
                var unixTimestamp = response.daily[i].dt
                //getting date in unix
                var unixDate = new Date(unixTimestamp * 1000);
                //converting unix date to useable moment format
                var convertedDate = moment(unixDate).format("MM/DD/YYYY");
                //grabbing main weather description to narrow down icon variables
                var weatherObject = response.daily[i].weather[0].main;
                //if we want more detailed weather for a broader range of icons by id we can use:
                console.log(weatherObject);
                //var weatherObject = response.daily[i].weather[0].id

                //stringifying our weatherObject so we can use it as a working variable
                
                var forecast = {
                    date: convertedDate,
                    temp: response.daily[i].temp.day,
                    humidity: response.daily[i].humidity,
                    //using toLowerCase on weatherObject for ease of image linking
                    description: weatherObject.toLowerCase(),
                    card: $(".cardRow")
                }
               
                // console.log(forecast.description);
                //TODO: make weather icon link work
                //still need working weather icon link, and alt is not displaying for some reason (syntax error?)
                //html syntax of our forecast cards
                var sourceString = `weather-icons/${forecast.description}.png`
                // console.log(sourceString);
                console.log(forecast);
                var details = `<div class="col m2 s6 push-m1">
                <div class="card small">
                        <div class="card-image">
                          <img src= ${sourceString}>
                        </div>
                        <div class="card-content">
                          <p>${forecast.date}</p>
                          <p>Temp: ${forecast.temp}°F</p>
                          <p>Humidity: ${forecast.humidity}%</p>
                        </div>
                        </div>`
                //appending forecast details onto cards for five day forecast
                forecast.card.append(details);
            };
        });
    });
}

// var divCol = $(`<div class="col m2 s6 push-m1"></div>`)
// var divCard = $(`<div class="card small"></div>`)
// var divCardImage =$(`<div class="card-image"></div>`)
// var imgSrc = $(`<img src="weather-icons/${forecast.description}.png">`)
//         <div class="card-content">
//            <p>${forecast.date}</p>
//            <p>Temp: ${forecast.temp}°F</p>
//            <p>Humidity: ${forecast.humidity}%</p>

//          `)