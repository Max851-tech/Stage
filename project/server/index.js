import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const buildings = [
  { id: 'A', name: 'Bâtiment A' },
  { id: 'B', name: 'Bâtiment B' },
  { id: 'C', name: 'Bâtiment C' },
  { id: 'D', name: 'Bâtiment D' }
];

// Route pour récupérer la liste des bâtiments
app.get('/api/buildings', (req, res) => {
  res.json(buildings);
});

// Route pour récupérer le plan
app.get('/api/map', (req, res) => {
  // Simuler un plan simple pour l'exemple
  const map = {
    width: 1000,
    height: 800,
    buildings: [
      { id: 'A', x: 100, y: 100, width: 100, height: 100 },
      { id: 'B', x: 300, y: 100, width: 100, height: 100 },
      { id: 'C', x: 100, y: 300, width: 100, height: 100 },
      { id: 'D', x: 300, y: 300, width: 100, height: 100 }
    ]
  };
  res.json(map);
});

// Route pour obtenir l'itinéraire
app.post('/api/route', (req, res) => {
  const { from, to } = req.body;
  
  // Simuler un calcul d'itinéraire simple
  const route = {
    path: [
      { x: buildings.find(b => b.id === from).x, y: buildings.find(b => b.id === from).y },
      { x: buildings.find(b => b.id === to).x, y: buildings.find(b => b.id === to).y }
    ],
    distance: '100m',
    duration: '2 minutes'
  };
  
  res.json(route);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});