const cityInput = document.getElementById('city');
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeather();
    }
});
document.getElementById('getWeather').addEventListener('click', getWeather);
document.getElementById('found_me').addEventListener('click', locateMe);

function displayError(message) {
    document.getElementById('weatherInfo').innerHTML = `<tr><td style="background-color: blue;" colspan="7">${message}</td></tr>`;
    document.getElementById('bubble').style.display = 'none';
    document.getElementById('second-bubble').style.display = 'none';
}

function getWeather() {
    const city = document.getElementById('city').value;
    const openWeatherApiKey = '2dec67f041a37a3333796cc816ca6b9e';
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric&lang=fr`;

    if (city === '') {
        displayError("Veuillez entrer le nom d'une ville");
        return;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                displayError(data.message);
                return;
            }
            const dtUnix = data.dt;
            const timeZoneOffset = data.timezone;
            const dtMillis = dtUnix * 1000;
            const localTimeMillis = dtMillis + (timeZoneOffset * 1000) - 7200 * 1000;
            const localTimeDate = new Date(localTimeMillis);
            const localHours = localTimeDate.getHours();
            const localMinutes = localTimeDate.getMinutes();
            const formattedLocalTime = `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;

            const dtUnix_rise = data.sys.sunrise;
            const timeZoneOffset_rise = data.timezone;
            const dtMillis_rise = dtUnix_rise * 1000;
            const localTimeMillis_rise = dtMillis_rise + (timeZoneOffset_rise * 1000) - 7200 * 1000;
            const localTimeDate_rise = new Date(localTimeMillis_rise);
            const localHours_rise = localTimeDate_rise.getHours();
            const localMinutes_rise = localTimeDate_rise.getMinutes();
            const formattedLocalTime_rise = `${localHours_rise.toString().padStart(2, '0')}:${localMinutes_rise.toString().padStart(2, '0')}`;

            const dtUnix_set = data.sys.sunset;
            const timeZoneOffset_set = data.timezone;
            const dtMillis_set = dtUnix_set * 1000;
            const localTimeMillis_set = dtMillis_set + (timeZoneOffset_set * 1000) - 7200 * 1000;
            const localTimeDate_set = new Date(localTimeMillis_set);
            const localHours_set = localTimeDate_set.getHours();
            const localMinutes_set = localTimeDate_set.getMinutes();
            const formattedLocalTime_set = `${localHours_set.toString().padStart(2, '0')}:${localMinutes_set.toString().padStart(2, '0')}`;

            const lat = data.coord.lat;
            const lon = data.coord.lon;
            const apiUrl_pollution = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=fr`;

            fetchUVData(lat, lon).then(uvData => {
                fetchWeatherDataForPeriods(city).then(({ periods, moonPhase, MoonPhase_image, totalprecip, date_formatted }) => {
                    fetch(apiUrl_pollution)
                        .then(response => response.json())
                        .then(pollutionData => {
                            const pm_2_5 = pollutionData.list[0].components.pm2_5;
                            const aqi = pollutionData.list[0].main.aqi;

                            let airQualityImage = '';
                            if (pm_2_5 >= 0 && pm_2_5 < 10) {
                                airQualityImage = 'indice_1.PNG';
                            } else if (pm_2_5 >= 10 && pm_2_5 < 25) {
                                airQualityImage = 'indice_2.PNG';
                            } else if (pm_2_5 >= 25 && pm_2_5 < 50) {
                                airQualityImage = 'indice_3.PNG';
                            } else if (pm_2_5 >= 50 && pm_2_5 < 75) {
                                airQualityImage = 'indice_4.PNG';
                            } else {
                                airQualityImage = 'indice_5.PNG';
                            }

                            const weatherInfo = `
                                <table>
                                <tr>
                                <th classe="th_titre2"></th>
                                <th  colspan="7" style="background-color: #444444;" class="trait_du_bas">Prévisions pour : ${data.name} (${data.sys.country})</th>
                                </tr>
                                <tr>
                                <th class="th_titre"></th>
                                <th  colspan="7" class="encadrement_loc">Heure locale: ${formattedLocalTime}</th>
                                </tr>
                                <tr>
                                <th></th>
                                <th colspan="7" class="encadrement_tete" >${data.weather[0].description} (${data.main.temp} °C)</th>
                                </tr>
                                <tr>
                                <th colspan="7" class="encadrement">UV Index : ${uvData.uv} (Max: ${uvData.maxUv})</th>
                                </tr>
                                <tr>
                                <th class="th_titre"></th>
                                <th class="encadrement">Lever du soleil</th>
                                <th class="encadrement">Coucher du soleil</th>
                                <th class="encadrement">Vent</th>
                                <th class="encadrement">Rafales</th>
                                <th class="encadrement">Pression</th>
                                <th class="encadrement">Humidité</th>
                                </tr>
                                <tr>
                                <td></td>
                                <td>${formattedLocalTime_rise}</td>
                                <td>${formattedLocalTime_set}</td>
                                <td>${data.wind.speed} m/s</td>
                                <td>${data.wind.gust} m/s</td>
                                <td>${data.main.pressure} hPa</td>
                                <td>${data.main.humidity} %</td>
                                </tr>
                                <tr>
                                <th colspan="7" class="encadrement_titre">Prévisions sur 7 jours</th>
                                </tr>
                                <tr>
                                <th></th>
                                <th class="encadrement">Date</th>
                                <th class="encadrement">Temp. Min</th>
                                <th class="encadrement">Temp. Max</th>
                                <th class="encadrement">Total Precip.</th>
                                <th class="encadrement">Description</th>
                                <th class="encadrement">Icone</th>
                                </tr>
                                ${periods.map((period, index) => `
                                    <tr>
                                        <td></td>
                                        <td>${date_formatted[index]}</td>
                                        <td>${period.minTemp} °C</td>
                                        <td>${period.maxTemp} °C</td>
                                        <td>${totalprecip[index]} mm</td>
                                        <td>${period.description}</td>
                                        <td><img src="https:${period.icon}" alt="${period.description}"></td>
                                    </tr>
                                `).join('')}
                                <tr>
                                <th colspan="7" class="encadrement_titre">Phase de la Lune : ${moonPhase}</th>
                                </tr>
                                </table>
                            `;

                            document.getElementById('weatherInfo').innerHTML = weatherInfo;
                            document.getElementById('bubble').style.display = 'block';
                            document.getElementById('second-bubble').style.display = 'block';

                            const secondBubbleContent = `
                                <div style="text-align: center; width: 100%;"><img src="indice_air.PNG" alt="Qualité de l'air" width="32"></div>
                                <div style="text-align: center;"><strong>Qualité de l'air (PM2.5)</strong></div>
                                <div style="text-align: center; width: 100%;"><img src="${airQualityImage}" alt="Indice qualité de l'air" width="128"></div>
                                <div style="text-align: center;">AQI: ${aqi}</div>
                            `;
                            document.getElementById('second-bubble').innerHTML = secondBubbleContent;
                        })
                        .catch(error => {
                            console.error("Erreur lors de la récupération de la pollution de l'air :", error);
                            displayError("Erreur lors de la récupération de la pollution de l'air");
                        });
                }).catch(error => {
                    console.error("Erreur lors de la récupération des prévisions météorologiques :", error);
                    displayError("Erreur lors de la récupération des prévisions météorologiques");
                });
            }).catch(error => {
                console.error("Erreur lors de la récupération de l'indice UV :", error);
                displayError("Erreur lors de la récupération de l'indice UV");
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données météorologiques :", error);
            displayError("Erreur lors de la récupération des données météorologiques");
        });
}

function locateMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const reverseGeocodeApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;

            fetch(reverseGeocodeApiUrl)
                .then(response => response.json())
                .then(data => {
                    const city = data.city;
                    document.getElementById('city').value = city;
                    getWeather();
                })
                .catch(error => {
                    console.error("Erreur lors de la géolocalisation inverse :", error);
                    displayError("Erreur lors de la géolocalisation inverse");
                });
        }, error => {
            console.error("Erreur lors de la récupération des coordonnées :", error);
            displayError("Erreur lors de la récupération des coordonnées");
        });
    } else {
        displayError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
}

function fetchUVData(lat, lon) {
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const uvApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;
    return fetch(uvApiUrl)
        .then(response => response.json())
        .then(data => ({
            uv: data.current.uv,
            maxUv: data.forecast.forecastday[0].day.uv,
        }));
}

function fetchWeatherDataForPeriods(city) {
    const weatherApiKey = 'f9cc340e26b240188b2195245242805';
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=7&aqi=no&alerts=no`;
    return fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            const periods = data.forecast.forecastday.map(forecast => ({
                minTemp: forecast.day.mintemp_c,
                maxTemp: forecast.day.maxtemp_c,
                description: forecast.day.condition.text,
                icon: forecast.day.condition.icon,
            }));

            const moonPhase = data.forecast.forecastday[0].astro.moon_phase;
            const MoonPhase_image = data.forecast.forecastday[0].astro.MoonPhase_image;
            const totalprecip = data.forecast.forecastday.map(forecast => forecast.day.totalprecip_mm);
            const date_formatted = data.forecast.forecastday.map(forecast => forecast.date);
            
            return { periods, moonPhase, MoonPhase_image, totalprecip, date_formatted };
        });
}
