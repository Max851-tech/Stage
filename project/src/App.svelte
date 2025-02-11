<script lang="ts">
  import Map from './lib/Map.svelte';
  
  let buildings: Array<{ id: string, name: string }> = [];
  let fromBuilding = '';
  let toBuilding = '';
  let route: any = null;
  
  async function loadBuildings() {
    const response = await fetch('http://localhost:3000/api/buildings');
    buildings = await response.json();
  }
  
  async function getRoute() {
    if (!fromBuilding || !toBuilding) return;
    
    const response = await fetch('http://localhost:3000/api/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromBuilding, to: toBuilding }),
    });
    
    route = await response.json();
  }
  
  loadBuildings();
</script>

<main>
  <h1>Navigation des Bâtiments</h1>
  
  <div class="map-container">
    <Map />
  </div>
  
  <div class="navigation-form">
    <div class="select-group">
      <label for="from">Où êtes-vous actuellement ?</label>
      <select id="from" bind:value={fromBuilding}>
        <option value="">Sélectionnez un bâtiment</option>
        {#each buildings as building}
          <option value={building.id}>{building.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="select-group">
      <label for="to">Où souhaitez-vous aller ?</label>
      <select id="to" bind:value={toBuilding}>
        <option value="">Sélectionnez un bâtiment</option>
        {#each buildings as building}
          <option value={building.id}>{building.name}</option>
        {/each}
      </select>
    </div>
    
    <button on:click={getRoute} disabled={!fromBuilding || !toBuilding}>
      Trouver l'itinéraire
    </button>
  </div>
  
  {#if route}
    <div class="route-info">
      <h3>Itinéraire :</h3>
      <p>Distance : {route.distance}</p>
      <p>Durée estimée : {route.duration}</p>
    </div>
  {/if}
</main>

<style>
  main {
    padding: 2em;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .map-container {
    margin: 2em 0;
  }
  
  .navigation-form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .select-group {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  
  select {
    padding: 0.5em;
    font-size: 1em;
  }
  
  button {
    padding: 0.5em 1em;
    font-size: 1em;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .route-info {
    margin-top: 2em;
    padding: 1em;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
</style>