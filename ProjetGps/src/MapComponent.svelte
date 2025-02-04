<script>
  import { onMount } from 'svelte'; // Pour gérer le cycle de vie du composant
  import L from 'leaflet'; // Bibliothèque Leaflet pour les cartes interactives
  import 'leaflet/dist/leaflet.css'; // Styles CSS de Leaflet

  // Variables pour la carte, les marqueurs et les instructions
  let map;
  let userMarker;
  let instructions = [];

  // Variables pour les coordonnées de départ et d'arrivée
  let startCoordsInput = ''; // Champ de saisie pour les coordonnées de départ
  let endCoordsInput = ''; // Champ de saisie pour les coordonnées d'arrivée

  // Variables pour le mode de transport
  let transportMode = 'driving'; // Par défaut : mode voiture

  // Créer une icône bleue pour le marqueur de l'utilisateur
  const blueIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], // Taille de l'icône
    iconAnchor: [12, 41], // Point d'ancrage de l'icône
    popupAnchor: [1, -34], // Point d'ancrage de la popup
    shadowSize: [41, 41] // Taille de l'ombre
  });

  // Fonction pour détecter si l'entrée est une adresse ou des coordonnées
  function detectInputType(input) {
    // Expression régulière pour vérifier si l'entrée est au format "latitude,longitude"
    const coordsRegex = /^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;
    return coordsRegex.test(input) ? 'coords' : 'address';
  }

  // Fonction pour valider et convertir les coordonnées saisies
  function parseCoordinates(coordsString) {
    const coords = coordsString.split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return coords;
    } else {
      alert("Coordonnées invalides. Veuillez entrer des valeurs au format 'latitude,longitude'.");
      return null;
    }
  }

  // Fonction pour géocoder une adresse en coordonnées
  async function geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      } else {
        alert("Adresse non trouvée. Veuillez vérifier l'adresse saisie.");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors du géocodage :", error);
      return null;
    }
  }

  // Fonction pour récupérer l'itinéraire entre deux points
  async function fetchRoute(start, end, mode = 'driving') {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${mode}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        console.error("Aucun itinéraire trouvé.");
        return [];
      }
      
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'itinéraire :", error);
      return [];
    }
  }

  // Fonction pour récupérer les instructions de l'itinéraire
  async function fetchRouteInstructions(start, end, mode = 'driving') {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${mode}/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true`
      );
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0 || !data.routes[0].legs) {
        console.error("Aucune instruction trouvée.");
        return ["Aucune instruction disponible."];
      }
      
      return data.routes[0].legs[0].steps;
    } catch (error) {
      console.error("Erreur lors de la récupération des instructions :", error);
      return ["Erreur lors du chargement des instructions."];
    }
  }

  // Fonction pour calculer et afficher l'itinéraire
  async function calculateRoute() {
    let startCoords, endCoords;

    // Détecter automatiquement le type de saisie pour le départ et l'arrivée
    const startInputType = detectInputType(startCoordsInput);
    const endInputType = detectInputType(endCoordsInput);

    // Convertir les adresses en coordonnées si nécessaire
    if (startInputType === 'address') {
      startCoords = await geocodeAddress(startCoordsInput);
    } else {
      startCoords = parseCoordinates(startCoordsInput);
    }

    if (endInputType === 'address') {
      endCoords = await geocodeAddress(endCoordsInput);
    } else {
      endCoords = parseCoordinates(endCoordsInput);
    }

    if (!startCoords || !endCoords) return; // Arrêter si les coordonnées sont invalides

    // Supprimer l'ancien itinéraire et les marqueurs
    if (map) {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    }

    // Ajouter les nouveaux marqueurs de départ et d'arrivée
    L.marker(startCoords).addTo(map).bindPopup('Départ');
    L.marker(endCoords).addTo(map).bindPopup('Arrivée');

    // Récupérer l'itinéraire et les instructions en fonction du mode de transport
    const routeCoords = await fetchRoute(startCoords, endCoords, transportMode);
    instructions = await fetchRouteInstructions(startCoords, endCoords, transportMode);

    console.log("Instructions récupérées :", instructions);

    // Tracer l'itinéraire sur la carte si des coordonnées sont disponibles
    if (routeCoords.length > 0) {
      const routePolyline = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
      map.fitBounds(routePolyline.getBounds()); // Ajuster la vue pour afficher l'itinéraire complet
    }
  }

  // Fonction exécutée après le rendu du composant
  onMount(() => {
    map = L.map('map').setView([48.8566, 2.3522], 13); // Centrer la carte sur Paris par défaut

    // Ajout de la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Suivi de la position de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude]; // Coordonnées de l'utilisateur
          if (!userMarker) {
            // Créer le marqueur de l'utilisateur s'il n'existe pas encore
            userMarker = L.marker(userCoords, { icon: blueIcon }).addTo(map).bindPopup('Vous êtes ici').openPopup();
          } else {
            // Mettre à jour la position du marqueur
            userMarker.setLatLng(userCoords);
          }
          // Centrer la carte sur la position de l'utilisateur
          map.setView(userCoords, 13);
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
          alert("Impossible d'obtenir votre position.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options de géolocalisation
      );
    } else {
      alert('La géolocalisation n’est pas supportée par votre navigateur.');
    }
  });
</script>

<!-- Styles pour la carte et le panneau d'instructions -->
<style>
  #map {
    height: 500px;
    width: 70%;
    display: inline-block;
  }
  #instructions {
    width: 25%;
    height: 500px;
    overflow-y: auto;
    padding: 10px;
    display: inline-block;
    vertical-align: top;
    border-left: 1px solid #ccc;
  }
  #instructions ul {
    list-style-type: none;
    padding: 0;
  }
  #instructions ul li {
    background: #f8f9fa;
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;
  }
  .input-container {
    margin-bottom: 20px;
  }
  .input-container input {
    width: 200px;
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .input-container select {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .input-container button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .input-container button:hover {
    background-color: #0056b3;
  }
</style>

<!-- Structure HTML du composant -->
<div style="text-align:center; margin-bottom: 10px;">
  <h2>Carte Routière</h2> <!-- Titre de la carte -->
</div>

<div class="input-container">
  <!-- Champs de saisie pour le départ et l'arrivée -->
  <input
    type="text"
    bind:value={startCoordsInput}
    placeholder="Départ (latitude,longitude ou adresse)"
  />
  <input
    type="text"
    bind:value={endCoordsInput}
    placeholder="Arrivée (latitude,longitude ou adresse)"
  />

  <!-- Sélecteur pour le mode de transport -->
  <select bind:value={transportMode}>
    <option value="driving">Voiture</option>
    <option value="walking">Piéton</option>
  </select>

  <!-- Bouton pour calculer l'itinéraire -->
  <button on:click={calculateRoute}>Calculer l'itinéraire</button>
</div>

<div id="map"></div> <!-- Conteneur pour la carte -->
<div id="instructions">
  <h3>Itinéraire</h3> <!-- Titre du panneau d'instructions -->
  <ul>
    {#if instructions.length > 0} <!-- Vérification de la présence d'instructions -->
      {#each instructions as instruction} <!-- Boucle sur les instructions -->
        <li>{instruction.name}</li> <!-- Affichage de chaque instruction -->
      {/each}
    {:else}
      <li>Aucune instruction disponible.</li> <!-- Message par défaut -->
    {/if}
  </ul>
</div>