

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const router = Router();


router.post('/', async (req: Request, res: Response) => {
    try {
        const { timeEntryId, imageBase64, permissionFlag } = req.body;

        if (!timeEntryId || !imageBase64 || permissionFlag === undefined) {
            return res.status(400).json({ error: 'timeEntryId, imageBase64, and permissionFlag are required.' });
        }


        const fileName = `${Date.now()}-${timeEntryId}.png`;
        const filePath = path.join('public', 'screenshots', fileName);


        const screenshot = await prisma.screenshot.create({
            data: {
                timeEntryId,
                imageUrl: `/${filePath}`,
                permissionFlag,
            },
        });


        const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
        fs.writeFileSync(filePath, imageBuffer);

        res.status(201).json(screenshot);
    } catch (error: any) {
        console.error('Failed to upload screenshot:', error);

        if (error.code === 'P2003') {
            return res.status(404).json({ error: 'Associated Time Entry not found.' });
        }
        res.status(500).json({ error: 'Screenshot upload failed.' });
    }
});

export default router;