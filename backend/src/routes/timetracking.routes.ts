

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path'
const router = Router();



router.post('/start', async (req: Request, res: Response) => {
    try {
        const { employeeId, taskId } = req.body;

        if (!employeeId || !taskId) {
            return res.status(400).json({ error: 'Employee ID and Task ID are required' });
        }


        const existingEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId,
                endTime: null,
            },
        });

        if (existingEntry) {
            return res.status(409).json({ error: 'An active time entry already exists for this employee.' });
        }

        const newTimeEntry = await prisma.timeEntry.create({
            data: {
                employeeId,
                taskId,
                startTime: new Date(),
            },
        });

        res.status(201).json(newTimeEntry);
    } catch (error: any) {

        if (error.code === 'P2003') {
            return res.status(404).json({ error: 'Employee or Task not found' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to start time entry' });
    }
});


router.post('/stop', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ error: 'Employee ID is required' });
        }

        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId,
                endTime: null,
            },

            orderBy: {
                startTime: 'desc',
            },
        });

        if (!activeEntry) {
            return res.status(404).json({ error: 'No active time entry found for this employee.' });
        }

        const updatedEntry = await prisma.timeEntry.update({
            where: {
                id: activeEntry.id,
            },
            data: {
                endTime: new Date(),
            },
        });

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to stop time entry' });
    }
});

router.post('/:timeEntryId/screenshots', async (req: Request, res: Response) => {
    try {
        const { timeEntryId } = req.params;

        const { imageBase64, permissionFlag } = req.body;

        if (!imageBase64 || permissionFlag === undefined) {
            return res.status(400).json({ error: 'imageBase64 and permissionFlag are required.' });
        }


        const newScreenshot = await prisma.screenshot.create({
            data: {
                timeEntryId,
                permissionFlag,
                imageUrl: '',
            },
        });


        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const fileName = `${newScreenshot.id}.png`;
        const filePath = path.join('public', 'screenshots', fileName);

        fs.writeFileSync(filePath, imageBuffer);


        const updatedScreenshot = await prisma.screenshot.update({
            where: { id: newScreenshot.id },
            data: { imageUrl: `/${filePath}` },
        });

        res.status(201).json(updatedScreenshot);
    } catch (error: any) {
        console.error(error);

        if (error.code === 'P2003') {
            return res.status(404).json({ error: 'Time Entry not found' });
        }
        res.status(500).json({ error: 'Failed to upload screenshot' });
    }
});



export default router;