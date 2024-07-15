// Sélection de l'élément d'entrée de texte
const cityInput = document.getElementById('city');

// Ajout d'un gestionnaire d'événements pour l'événement "keypress"
cityInput.addEventListener('keypress', function(event) {
    // Vérification si la touche pressée est "Enter"
    if (event.key === 'Enter') {
        // Empêcher le comportement par défaut qui pourrait recharger la page
        event.preventDefault();
        // Appel de la fonction pour obtenir les informations météorologiques
        getWeather();
    }
});

// Ajout d'un gestionnaire d'événements pour le bouton "Get Weather"
document.getElementById('getWeather').addEventListener('click', getWeather);

// Fonction pour obtenir les informations météorologiques
function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = '072fb3e5f6fd83aa3fb38d23534c3df3'; // Remplacez par votre clé API
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    if (city === '') {
        document.getElementById('weatherInfo').innerHTML = `<tr><td style="background-color: blue;" colspan="7">Veuillez entrer le nom d'une ville.</td></tr>`;
        document.getElementById('bubble').style.display = 'none';
        document.getElementById('second-bubble').style.display = 'none';
        return;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Afficher toutes les données dans la console pour inspection
            console.log(data);

            const lat = data.coord.lat;
            const lon = data.coord.lon;

            const apiUrlOneCall = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely,alerts&appid=${apiKey}&units=metric&lang=fr`;
            
            fetch(apiUrlOneCall)
                .then(response => response.json())
                .then(weatherData => {
                    // Accéder aux prévisions journalières
                    const todayWeather = weatherData.daily[0];
                    
                    const tempMorning = todayWeather.temp.morn;
                    const tempAfternoon = todayWeather.temp.day;
                    const tempEvening = todayWeather.temp.eve;
                    const tempNight = todayWeather.temp.night;

                    console.log("Température matin:", tempMorning);
                    console.log("Température après-midi:", tempAfternoon);
                    console.log("Température soir:", tempEvening);
                    console.log("Température nuit:", tempNight);

                    const weatherInfo = `
                        <tr>
                            <th>Ville</th>
                            <th>Température Matin</th>
                            <th>Température Après-midi</th>
                            <th>Température Soir</th>
                            <th>Température Nuit</th>
                            <th>Humidité</th>
                            <th>Vent</th>
                            <th>Température ressentie</th>
                        </tr>
                        <tr>
                            <td>${data.name} (${data.sys.country})</td>
                            <td>${tempMorning} °C</td>
                            <td>${tempAfternoon} °C</td>
                            <td>${tempEvening} °C</td>
                            <td>${tempNight} °C</td>
                            <td>${data.main.humidity} %</td>
                            <td>${data.wind.speed} m/s</td>
                            <td>${data.main.feels_like} °C</td>
                        </tr>
                    `;

                    document.getElementById('weatherInfo').innerHTML = weatherInfo;
                    document.getElementById('bubble').style.display = 'block';

                    // Appel à l'API de pollution
                    const apiUrl_pollution = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

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

                            if (data.cod === 200) {
                                const weatherInfo2 = `
                                    <tr>
                                        <th colspan="2">Qualité de l'air</th>
                                    </tr>
                                    <tr>
                                        <td>Indice : ${aqi}/10 </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="text-align:center;">
                                            <img src="icon/${airQualityImage}" style="width: 70%;" />
                                        </td>
                                    </tr>
                                `;
                                document.getElementById('weatherInfo2').innerHTML = weatherInfo2;
                                document.getElementById('bubble').style.display = 'block';
                            } else {
                                document.getElementById('weatherInfo2').innerHTML = `<tr><td colspan="7">${data.message}</td></tr>`;
                                document.getElementById('bubble').style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching pollution data:', error);
                            document.getElementById('weatherInfo2').innerHTML = `<tr><td colspan="7">Error fetching pollution data</td></tr>`;
                            document.getElementById('bubble').style.display = 'none';
                        });
                })
                .catch(error => {
                    console.error('Error fetching one call data:', error);
                    document.getElementById('weatherInfo').innerHTML = `<tr><td colspan="7">Error fetching one call data</td></tr>`;
                    document.getElementById('bubble').style.display = 'none';
                });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weatherInfo').innerHTML = `<tr><td colspan="7">Error fetching weather data</td></tr>`;
            document.getElementById('bubble').style.display = 'none';
        });
}
