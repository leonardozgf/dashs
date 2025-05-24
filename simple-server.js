const http = require('http');
const fs = require('fs');
const path = require('path');

// Mapeamento de extensões de arquivo para tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv'
};

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Normalizar URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Obter a extensão do arquivo
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Ler o arquivo
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Arquivo não encontrado
        console.log(`Arquivo não encontrado: ${filePath}`);
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Erro interno do servidor');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Outro erro de servidor
        console.error(`Erro ao ler arquivo: ${error.code}`);
        res.writeHead(500);
        res.end(`Erro interno do servidor: ${error.code}`);
      }
    } else {
      // Sucesso - enviar o arquivo
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Configurar porta e iniciar o servidor
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  
  // Listar arquivos no diretório atual
  try {
    const files = fs.readdirSync('.');
    console.log('Arquivos no diretório:', files);
  } catch (err) {
    console.error('Erro ao listar arquivos:', err);
  }
});

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', () => {
  console.log('Recebido sinal SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recebido sinal SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (err) => {
  console.error('Exceção não tratada:', err);
  server.close(() => {
    process.exit(1);
  });
});
