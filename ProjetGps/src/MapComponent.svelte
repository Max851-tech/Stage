<script>
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  let map;
  let userMarker;
  let instructions = [];

  const startCoords = [48.917402, 2.269675]; // 11 Avenue Raspail, Bois-Colombes
  const endCoords = [48.916672, 2.26667];  // Avenue Robert Bain, Bois-Colombes

  async function fetchRoute(start, end) {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
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

  async function fetchRouteInstructions(start, end) {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true`
      );
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0 || !data.routes[0].legs) {
        console.error("Aucune instruction trouvée.");
        return ["Aucune instruction disponible."];
      }
      
      return data.routes[0].legs.flatMap(leg => leg.steps.map(step => step.maneuver.instruction));
    } catch (error) {
      console.error("Erreur lors de la récupération des instructions :", error);
      return ["Erreur lors du chargement des instructions."];
    }
  }

  onMount(async () => {
    map = L.map('map').setView(startCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker(startCoords).addTo(map).bindPopup('Départ');
    L.marker(endCoords).addTo(map).bindPopup('Arrivée');

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          if (!userMarker) {
            userMarker = L.marker(userCoords).addTo(map).bindPopup('Vous êtes ici').openPopup();
          } else {
            userMarker.setLatLng(userCoords);
          }
          map.setView(userCoords, 13);
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
          alert("Impossible d'obtenir votre position.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('La géolocalisation n’est pas supportée par votre navigateur.');
    }

    const routeCoords = await fetchRoute(startCoords, endCoords);
    instructions = await fetchRouteInstructions(startCoords, endCoords);

    console.log("Instructions récupérées :", instructions);

    if (routeCoords.length > 0) {
      const routePolyline = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
      map.fitBounds(routePolyline.getBounds());
    }
  });
</script>

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
</style>

<div style="text-align:center; margin-bottom: 10px;">
  <h2>Carte Routière</h2>
</div>

<div id="map"></div>
<div id="instructions">
  <h3>Itinéraire</h3>
  <ul>
    {#if instructions.length > 0}
      {#each instructions as instruction}
        <li>{instruction}</li>
      {/each}
    {:else}
      <li>Aucune instruction disponible.</li>
    {/if}
  </ul>
</div>
