
import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('T3 API Server (TypeScript) is running!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});