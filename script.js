const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const searchHistoryButton = document.querySelector(".search-history-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");


const API_KEY = "6cccde2e2ebeebdcc7a20fb71e53d5ff"; // API key for OpenWeatherMap API 

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {  // HTML for main weather card
      return `<div class="details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h4>Temperature: ${((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</h4>
                  <h4>Wind: 1mph</h4>
                  <h4>Humidity: 93%</h4>
              </div>
              <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h4>${weatherItem.weather[0].description}</h4>
              </div>`;

    } else {   // HTML for five day forecast card
      const tempFahrenheit = ((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2);
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${tempFahrenheit}°F</h4>
                <h4>Wind: ${weatherItem.wind.speed} mph</h4>
                <h4>Humidity:${weatherItem.main.humidity} %</h4>
            </li>`;
    }  
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        // Filters the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDayForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
               return uniqueForecastDays.push(forecastDate);
            }
        });

      
      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fiveDayForecast.forEach((weatherItem, index) => {
        if(index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
      });

      // Add city name to search history
      let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
      searchHistory.push(cityName);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    })
    .catch(() => {
      alert("An error occurred while fetching weather forecast");
    });
}


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // User enters city name and removes extra spaces
    if (!cityName) return; // Return if cityName is empty
  
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  
    // Entered city coordinates (lat,lon, and name) from API response
    fetch(GEOCODING_API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
      })
      .catch(() => {
        alert("An error occurred while fetching the coordinates");
      });
  }

  const showSearchHistory = () => {
    // Retrieve the search history from localStorage
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Clear previous search history
    const searchHistoryList = document.querySelector(".search-history-list");
    if (searchHistoryList) {
        searchHistoryList.innerHTML = ""; // Clear the existing list
    } else {
        // Create a new list if it doesn't exist
        const historyList = document.createElement("ul");
        historyList.className = "search-history-list";
        document.body.appendChild(historyList);
    }

    // Display the search history in the list
    searchHistory.forEach((searchItem) => {
        const listItem = document.createElement("li");
        listItem.textContent = searchItem;
        searchHistoryList.appendChild(listItem); // Append to the existing list
    });
};


searchButton.addEventListener("click", getCityCoordinates);
searchHistoryButton.addEventListener("click", showSearchHistory);

  
  
  