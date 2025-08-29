import { PrismaClient } from '@prisma/client';
import express from 'express';
import { env } from './config/env';

const prisma = new PrismaClient();
const app = express();
const PORT = parseInt(env.PORT, 10);

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
    res.send('ThaiTable API is running 🚀');
});

async function start() {
    try {
        await prisma.$connect();
        app.listen(PORT, () => {
            console.log(`ThaiTable backend listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

start();
