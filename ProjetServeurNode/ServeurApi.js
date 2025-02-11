import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Sert les fichiers statiques du dossier public

let message = "Bonjour, c'est moi l'API";

// Route GET /api/info
app.get('/api/info', (req, res) => {
    res.json({ message });
});

// Route POST /api/info
app.post('/api/info', (req, res) => {
    if (req.body.message) {
        message = req.body.message;
        res.json({ success: true, message});
    } else {
        res.status(400).json({ success: false, error: "Le champ 'message' est requis." });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send("Bienvenue sur mon API !");
});
