const http = require('http');
const fs = require('fs');
const path = require('path');
const host = '127.0.0.1';
const port = 3000;


function getContentType(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.jpg': 'image/jpeg'
    };
    return mimeTypes[extname] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    let filePath;
    
    if (req.url === '/') {
        filePath = 'juego.html';
    } else {

        filePath = req.url.slice(1); 
    }
    
    // Leer y servir el archivo
    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Error 404: Archivo no encontrado');
        } else {
            const contentType = getContentType(filePath);
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    });
});

server.listen(port, host, () => {
    console.log(`Servidor funcionando en http://${host}:${port}`);
});