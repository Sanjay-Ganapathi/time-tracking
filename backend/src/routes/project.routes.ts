

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const newProject = await prisma.project.create({
            data: {
                name,

                tasks: {
                    create: {
                        name: "Default Task"
                    }
                }
            },
            include: {
                tasks: true
            }
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});


router.post('/:projectId/employees', async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ error: 'Employee ID is required' });
        }


        const assignment = await prisma.projectAssignment.create({
            data: {
                projectId,
                employeeId,
            },
        });

        res.status(201).json(assignment);
    } catch (error: any) {

        if (error.code === 'P2003') {
            return res.status(404).json({ error: 'Project or Employee not found' });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Employee is already assigned to this project' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to assign employee' });
    }
});

export default router;