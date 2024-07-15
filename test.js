const apiKey = '072fb3e5f6fd83aa3fb38d23534c3df3'; // Remplacez par votre clé API
const city = 'Paris'; // Remplacez par le nom de la ville de votre choix

const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    console.log('Données météorologiques actuelles:', data);
    // Affichez les informations météorologiques comme vous le souhaitez
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des données météorologiques:', error);
  });