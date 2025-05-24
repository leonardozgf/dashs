const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

// Verificar se o diretório atual é acessível
try {
  fs.accessSync(__dirname, fs.constants.R_OK);
  console.log('Diretório atual é acessível para leitura');
} catch (err) {
  console.error('Erro ao acessar o diretório:', err);
}

// Listar arquivos no diretório atual para debug
try {
  const files = fs.readdirSync(__dirname);
  console.log('Arquivos no diretório:', files);
} catch (err) {
  console.error('Erro ao listar arquivos:', err);
}

// Servir arquivos estáticos do diretório atual
app.use(express.static(__dirname));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Adicionar tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).send('Erro interno do servidor');
});

// Iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Tratamento de erros e encerramento gracioso
process.on('SIGTERM', () => {
  console.log('Recebido sinal SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não tratada:', err);
  server.close(() => {
    process.exit(1);
  });
});
