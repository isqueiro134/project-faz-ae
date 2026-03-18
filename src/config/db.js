import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

// Configuração centralizada
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obrigatório para o Supabase
  }
});

// Teste de conexão imediato para avisar no console se algo estiver errado
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Erro ao conectar ao Supabase:', err.stack);
  }
  console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
  release(); // Libera o client de volta para o pool
});

// Exporta o pool para o resto do sistema
export default pool;