
import express, { Express, Request, Response } from 'express';
import employeeRouter from './routes/employee.routes'
import projectRouter from './routes/project.routes';
import timeTrackingRouter from './routes/timetracking.routes'
import screenshotRouter from './routes/screenshot.routes'
const app: Express = express();

app.use(express.json());


app.use('/api/employees', employeeRouter)
app.use('/api/projects', projectRouter);
app.use('/api/timetracking', timeTrackingRouter);
app.use('/api/screenshots', screenshotRouter);
app.get('/', (req: Request, res: Response) => {
    res.send('T3 API Server (TypeScript) is running!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});