

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
const router = Router();



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


export default router;