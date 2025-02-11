`<script lang="ts">
  import { onMount } from 'svelte';
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let mapData: any = null;
  let pan = { x: 0, y: 0 };
  let isDragging = false;
  let lastPos = { x: 0, y: 0 };
  
  onMount(async () => {
    ctx = canvas.getContext('2d')!;
    await loadMap();
    drawMap();
  });
  
  async function loadMap() {
    const response = await fetch('http://localhost:3000/api/map');
    mapData = await response.json();
  }
  
  function drawMap() {
    if (!ctx || !mapData) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    
    // Dessiner les bâtiments
    mapData.buildings.forEach((building: any) => {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(building.id, 
        building.x + building.width/2 - 8,
        building.y + building.height/2 + 8
      );
    });
    
    ctx.restore();
  }
  
  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    lastPos = { x: event.clientX, y: event.clientY };
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastPos.x;
    const deltaY = event.clientY - lastPos.y;
    
    pan.x += deltaX;
    pan.y += deltaY;
    
    lastPos = { x: event.clientX, y: event.clientY };
    drawMap();
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
</script>

<canvas
  bind:this={canvas}
  width="800"
  height="600"
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
></canvas>

<style>
  canvas {
    border: 1px solid #ccc;
    cursor: move;
  }
</style>