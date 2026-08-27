import app from '../api/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor de Banco de Dados da Clínica rodando em http://localhost:${PORT}`);
});
