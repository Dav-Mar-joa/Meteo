// Sélection de l'élément d'entrée de texte
const cityInput = document.getElementById('city');

// Ajout d'un gestionnaire d'événements pour l'événement "keypress"
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeather();
    }
});

// Ajout d'un gestionnaire d'événements pour le bouton "Get Weather"
document.getElementById('getWeather').addEventListener('click', getWeather);
document.getElementById('found_me').addEventListener('click', locateMe);

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

function fetchWeatherDataForPeriods(city) {
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=f9cc340e26b240188b2195245242805&q=${city}&days=7&aqi=no&alerts=no`;
    return fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("données"+data)
            const forecastDays = data.forecast.forecastday;
            const periods = forecastDays.map(day => ({
                date: day.date,
                avgTemp: day.day.avgtemp_c,
                icon: day.day.condition.icon,
                condition: day.day.condition.text,
                chance_of_rain: day.day.daily_chance_of_rain
            }));
            console.log("periods"+periods)
            return { periods };
        });
}

// Fonction pour afficher les messages d'erreur
function displayError(message) {
    document.getElementById('weatherInfo').innerHTML = `<tr><td style="background-color: blue;" colspan="7">${message}</td></tr>`;
    document.getElementById('bubble').style.display = 'none';
    document.getElementById('second-bubble').style.display = 'none';
}

// Fonction pour obtenir les informations météorologiques
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

            // heure sunrise

            const dtUnix_rise = data.sys.sunrise;
            const timeZoneOffset_rise = data.timezone;
            const dtMillis_rise = dtUnix_rise * 1000;
            const localTimeMillis_rise = dtMillis_rise + (timeZoneOffset_rise * 1000) - 7200 * 1000;
            const localTimeDate_rise = new Date(localTimeMillis_rise);
            const localHours_rise = localTimeDate_rise.getHours();
            const localMinutes_rise = localTimeDate_rise.getMinutes();
            const formattedLocalTime_rise = `${localHours_rise.toString().padStart(2, '0')}:${localMinutes_rise.toString().padStart(2, '0')}`;
           
            // Heure sunset

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
                            // if (pm_2_5 >= 0 && pm_2_5 < 10) {
                            //     airQualityImage = 'indice_1.PNG';
                            // } else if (pm_2_5 >= 10 && pm_2_5 < 25) {
                            //     airQualityImage = 'indice_2.PNG';
                            // } else if (pm_2_5 >= 25 && pm_2_5 < 50) {
                            //     airQualityImage = 'indice_3.PNG';
                            // } else if (pm_2_5 >= 50 && pm_2_5 < 75) {
                            //     airQualityImage = 'indice_4.PNG';
                            // } else {
                            //     airQualityImage = 'indice_5.PNG';
                            // }
                            if (aqi === 1) {
                                airQualityImage = 'indice_1.PNG';
                            } else if (aqi === 2) {
                                airQualityImage = 'indice_2.PNG';
                            } else if (aqi === 3) {
                                airQualityImage = 'indice_3.PNG';
                            } else if (aqi === 4) {
                                airQualityImage = 'indice_4.PNG';
                            } else {
                                airQualityImage = 'indice_5.PNG';
                            }

                            const weatherInfo = `
                                <table>
                                <tr>
                               
                                <th colspan="1" rowspan="3"><img src="icon/${data.weather[0].icon}.png" alt="${data.weather[0].description}" style="width: 100px; margin-right: 10px;" /></th>
                                <th  class="th_dessus_titre" colspan="4" style="border-bottom: none; height:2%;"></th>
                               
                                </tr>
                                <tr>
                                <th colspan="4" style="border-bottom: none;" class="encadrement_titre">Informations actuelles ${formattedLocalTime} (Heure locale)</th>
                                <th"></th>
                                </tr>
                                <tr>
                               <th class="th_dessus_titre" colspan="2"></th>
                                <th class="th_dessus_titre" colspan="1" ></th>
                                </tr>
                                    
                                    <tr>
                                        <th>Ville (${data.sys.country})</th>
                                        <th>Température (°C)</th>
                                        <th>Vent (m/s)</th>
                                        <th>Ressentie (°C)</th>
                                        <th>Pluie (mm)</th>
                                    </tr>
                                    <tr>
                                        <td>${data.name}</td>
                                        <td>${data.main.temp}</td>
                                        <td>${data.wind.speed}</td>
                                        <td>${data.main.feels_like}</td>
                                        <td >${totalprecip}</td>
                                    </tr>
                                    <tr>
                                        <td style="height: 1px; border-bottom: none"></td>
                                        <td style="height: 1px; border-bottom: none"></td>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th colspan="4" style="border-bottom: none" class="encadrement">Prévisions sur la journée du ${date_formatted}</th>
                                
                                    </tr>
                                    <tr>
                                        <td  style="height: 1px; border-bottom: none;border-top: none"></td>
                                    </tr>
                                    <tr>
                                    <th style="text-align: left"></th>
                                        <th >Matin </th>
                                        <th>Midi </th>
                                        <th>Soir </th>
                                        <th>Nuit </th>
                                    </tr>
                                    <tr>
                               <th class="th_dessus_titre" colspan="2"></th>
                                <th class="th_dessus_titre" colspan="1" ></th>
                                </tr>
                                    <tr>
                                        <th>
                                        <td class="encadrement_heure">
                                                <div style="display: flex; justify-content: space-between;">
                                                    <div style="text-align: left;">6h</div>
                                                    <div style="text-align: center;">8h</div>
                                                    <div style="text-align: right;">10h</div>
                                                </div>
                                            </td>
                                            <td class="encadrement_heure">
                                                <div style="display: flex; justify-content: space-between;">
                                                    <div style="text-align: left;">12h</div>
                                                    <div style="text-align: center;">14h</div>
                                                    <div style="text-align: right;">16h</div>
                                                </div>
                                            </td>
                                        </th>
                                        <td class="encadrement_heure">
                                                <div style="display: flex; justify-content: space-between;">
                                                    <div style="text-align: left;">18h</div>
                                                    <div style="text-align: center;">20h</div>
                                                    <div style="text-align: right;">22h</div>
                                                </div>
                                            </td>
                                            <td class="encadrement_heure">
                                                <div style="display: flex; justify-content: space-between;">
                                                    <div style="text-align: left;">0h</div>
                                                    <div style="text-align: center;">2h</div>
                                                    <div style="text-align: right;">4h</div>
                                                </div>
                                            </td>
                                    </tr>
                                     <tr>
                               <th class="th_dessus_titre" colspan="2"></th>
                                </tr>
                                    <tr>
                                        <td style="text-align: center;border-bottom: 1px solid black">Température (°C)</td>
                                        <td style="border-bottom: 1px solid black">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('06:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: center;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('08:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: right;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('10:00')).temp_c : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="border-bottom: 1px solid black">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('12:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: center;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('14:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: right;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('16:00')).temp_c : 'N/A'}</div>
                                            </div>
                                        </td>
                                        
                                         <td style="border-bottom: 1px solid black">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('18:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: center;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('20:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: right;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('22:00')).temp_c : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="border-bottom: 1px solid black">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('00:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: center;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('02:00')).temp_c : 'N/A'}</div>
                                                <div style="text-align: right;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('04:00')).temp_c : 'N/A'}</div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="text-align: center;">Probabilité de pluie (%)</td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('06:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('08:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('10:00')).chance_of_rain : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('12:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('14:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('16:00')).chance_of_rain : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('18:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('20:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('22:00')).chance_of_rain : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('0:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('2:00')).chance_of_rain : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('4:00')).chance_of_rain : 'N/A'}</div>
                                            </div>
                                        </td>
                                    </tr>
                                     <tr>
                                        <td style="text-align: center;">Précipitations (mm)</td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('06:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('08:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.morning.length > 0 ? periods.morning.find(hour => hour.time.includes('10:00')).precip_mm : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('12:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('14:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.afternoon.length > 0 ? periods.afternoon.find(hour => hour.time.includes('16:00')).precip_mm : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('18:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('20:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.evening.length > 0 ? periods.evening.find(hour => hour.time.includes('22:00')).precip_mm : 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style="">
                                            <div style="display: flex; justify-content: space-between;">
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('0:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('2:00')).precip_mm : 'N/A'}</div>
                                                <div style="text-align: left;">${periods.night.length > 0 ? periods.night.find(hour => hour.time.includes('4:00')).precip_mm : 'N/A'}</div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            `;
                            document.getElementById('weatherInfo').innerHTML = weatherInfo;
                            document.getElementById('bubble').style.display = 'block';
                            document.getElementById('second-bubble').style.display = 'block';

                            const weatherInfo2 = `
                            <table>
                                <tr>
                                    <th colspan="2" style="border-bottom: none" class="encadrement">Point infos 🔔</th>
                                </tr>
                                <tr>
                               <th class="th_dessus_titre" colspan="2"></th>
                                </tr>
                                <tr>
                                    <td colspan="2" style="text-align:center;border-bottom: 1px solid black">Qualité de l'air ${aqi}/5</td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <img src="icon/${airQualityImage}" style="width: 20%;" />
                                    </td>
                                </tr>
                                <tr>
                                    <th colspan="2" class="encadrement">Phase de la lune</th>
                                </tr>
                                <tr>
                                    <td colspan="2" style="text-align:center;">
                                        <img src="icon/${MoonPhase_image}" style="width: 25%;" /><br>
                                        
                                    </td>
                                </tr>
                                <tr>
                                <th colspan="2" class="encadrement">Soleil</th>
                                </tr>
                                <tr>
                                <td style="border-bottom: 1px solid black;text-align:center;"><img src="icon/up.PNG" style="width: 20%;" /> 
                                <img src="icon/sunrise.PNG" style="width: 50%;" /> </td>
                                <td style="border-bottom: 1px solid black;text-align:center;">${formattedLocalTime_rise}</td>
                                </tr>
                                <tr>
                                <td style="border-bottom: 1px solid black;text-align:center;"><img src="icon/down.PNG" style="width: 20%;" /> 
                                <img src="icon/sunset.PNG" style="width: 50%;" /> </td>
                                <td style="border-bottom: 1px solid black;text-align:center;">${formattedLocalTime_set}</td>
                                </tr>
                                 <tr>
                               <th class="th_dessus_titre" colspan="2"></th>
                                </tr>
                                 <td colspan ="2">Indice UV (/13) : ${uvData.uv} (Max : ${uvData.uvMax})</td>
                                </table>
                            `;

                            const meteo_semaine=`
                            <table>
                            <tr>aaaa</tr>
                            </table>
                            `
                            document.getElementById('second-bubble').innerHTML = weatherInfo2;
                        })
                        .catch(error => {
                            displayError('Erreur lors de la récupération des données de pollution de l\'air.');
                            console.error('Error fetching pollution data:', error);
                        });
                        
                });
            });
        })
        .catch(error => {
            displayError('Erreur lors de la récupération des données météorologiques.');
            console.error('Error fetching weather data:', error);
        });
}

// Fonction pour obtenir les informations UV
function fetchUVData(lat, lon) {
    const myHeaders = new Headers();
    myHeaders.append("x-access-token", "openuv-1lfk38rlwphq4vx-io");
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            const uvMax = Math.round(result.result.uv_max);
            const sunrise = result.result.sun_info.sun_times.sunrise.slice(11, 16);
            const sunset = result.result.sun_info.sun_times.sunset.slice(11, 16);
            const uv = Math.round(result.result.uv);
            return { uvMax, uv, sunset, sunrise };
        })
        .catch(error => {
            console.error('Error fetching UV data:', error);
            return { uvMax: 'N/A', uv: 'N/A', sunset: 'N/A', sunrise: 'N/A' };
        });
}

// Fonction pour obtenir les prévisions météorologiques pour différentes périodes
function fetchWeatherDataForPeriods(city) {
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=f9cc340e26b240188b2195245242805&q=${city}&days=7&aqi=no&alerts=no`;
    return fetch(weatherApiUrl)
    
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const periods = {
                morning: data.forecast.forecastday[0].hour.filter(hour => hour.time.includes('06:00') || hour.time.includes('07:00') || hour.time.includes('08:00') || hour.time.includes('09:00') || hour.time.includes('10:00') || hour.time.includes('11:00')),
                afternoon: data.forecast.forecastday[0].hour.filter(hour => hour.time.includes('12:00') || hour.time.includes('13:00') || hour.time.includes('14:00') || hour.time.includes('15:00') || hour.time.includes('16:00') || hour.time.includes('17:00')),
                evening: data.forecast.forecastday[0].hour.filter(hour => hour.time.includes('18:00') || hour.time.includes('19:00') || hour.time.includes('20:00') || hour.time.includes('21:00') || hour.time.includes('22:00') || hour.time.includes('23:00')),
                night: data.forecast.forecastday[0].hour.filter(hour => hour.time.includes('00:00') || hour.time.includes('01:00') || hour.time.includes('02:00') || hour.time.includes('03:00') || hour.time.includes('04:00') || hour.time.includes('05:00')),
            };
            const pluie_date_1=data.forecast.forecastday[1].day.totalprecip_mm;
            const pluie_date_2=data.forecast.forecastday[2].day.totalprecip_mm;
            // const pluie_date_3=data.forecast.forecastday[3].day.totalprecip_mm;
            // const pluie_date_4=data.forecast.forecastday[4].day.totalprecip_mm;

            const T_max_date_1=data.forecast.forecastday[1].day.maxtemp_c;
            const T_max_date_2=data.forecast.forecastday[2].day.maxtemp_c;
            // const T_max_date_3=data.forecast.forecastday[3].day.maxtemp_c;
            // const T_max_date_4=data.forecast.forecastday[4].day.maxtemp_c;

            const T_min_date_1=data.forecast.forecastday[1].day.mintemp_c;
            const T_min_date_2=data.forecast.forecastday[2].day.mintemp_c;
            // const T_min_date_3=data.forecast.forecastday[3].day.mintemp_c;
            // const T_min_date_4=data.forecast.forecastday[4].day.mintemp_c;
            
            const icon_date_1=data.forecast.forecastday[1].day.condition.icon;
            // console.log("icon"+icon_date_1)
            const icon_date_2=data.forecast.forecastday[2].day.condition.icon;
            // const icon_date_3=data.forecast.forecastday[3].day.condition.icon;
            // const icon_date_4=data.forecast.forecastday[4].day.condition.icon;
            
            const moonPhase = data.forecast.forecastday[0].astro.moon_phase;
            // const MoonPhase_image = `moonphase/${moonPhase.replace(' ', '').toLowerCase()}.png`;
            const totalprecip = data.forecast.forecastday[0].day.totalprecip_mm;
            const date_formatted = new Date(data.forecast.forecastday[0].date).toLocaleDateString('fr-FR');
            let MoonPhase_image = "";
            if (moonPhase === "New Moon") {
                MoonPhase_image = "NewMoon.png";
            } else if (moonPhase === "Waxing Crescent") {
                MoonPhase_image = "WaxingCrescent.png";
            } else if (moonPhase === "First Quarter") {
                MoonPhase_image = "FirstQuarter.png";
            } else if (moonPhase === "Waxing Gibbous") {
                MoonPhase_image = "WaxingGibbous.png";
            } else if (moonPhase === "Full Moon") {
                MoonPhase_image = "FullMoon.png";
            } else if (moonPhase === "Waning Gibbous") {
                MoonPhase_image = "WaningGibbous.png";
            } else if (moonPhase === "Last Quarter") {
                MoonPhase_image = "LastQuarter.png";
            } else if (moonPhase === "Waning Crescent") {
                MoonPhase_image = "WaningCrescent.png";
            }
            return { periods, moonPhase, MoonPhase_image, totalprecip, date_formatted };
        });
}

// Fonction pour formater l'heure locale
function getFormattedLocalTime(dt, timezone) {
    const localTime = new Date((dt - timezone) * 1000);
    console.log(dt, timezone)
    return localTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
