import app from './app';
import { initDatabase, closePool, query } from './db';
import { seedDatabase } from './db/seed';
import { env } from './config/env';

const startServer = async () => {
  try {
    await initDatabase();
    const result = await query<{ count: string }>('SELECT COUNT(*)::int AS count FROM users');
    if (Number(result.rows[0].count) === 0) {
      await seedDatabase();
    }

    app.listen(env.port, () => {
      console.log(`Aegis backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await closePool();
  process.exit();
});
