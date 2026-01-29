import {Pool, neonConfig} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({connectionString: process.env.DATABASE_URL});
export const db = drizzle(pool);
