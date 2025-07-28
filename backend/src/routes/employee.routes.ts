

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
const router = Router();

router.get('/auth/:apiKey', async (req: Request, res: Response) => {
    try {
        const { apiKey } = req.params;

        const employee = await prisma.employee.findUnique({
            where: {
                apiKey,
            },
        });

        if (!employee) {
            return res.status(404).json({ error: 'Invalid API Key' });
        }


        // if (!employee.activated) {
        //   return res.status(403).json({ error: 'Account not activated' });
        // }

        res.status(200).json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});


router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const newEmployee = await prisma.employee.create({
            data: {
                email,
                name,
            },
        });

        res.status(201).json(newEmployee);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

router.get('/:employeeId/screenshots', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.query;

        const screenshots = await prisma.screenshot.findMany({
            where: {

                timeEntry: {
                    employeeId: employeeId,
                },

                timestamp: {
                    gte: startDate ? new Date(startDate as string) : undefined,
                    lte: endDate ? new Date(endDate as string) : undefined,
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        res.status(200).json(screenshots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve screenshots' });
    }
});


router.get('/:employeeId/projects', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;


        const assignments = await prisma.projectAssignment.findMany({
            where: {
                employeeId,
            },

            include: {
                project: {

                    include: {
                        tasks: true,
                    },
                },
            },
        });


        const projects = assignments.map(a => a.project);

        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});


export default router;