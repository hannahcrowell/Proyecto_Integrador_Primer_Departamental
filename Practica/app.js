const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos (CSS, imágenes, JS)
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log("Server is running on port", 3000);
});