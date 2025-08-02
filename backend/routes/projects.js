const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.js');

const prisma = new PrismaClient();
const router = express.Router();

// Apply the auth middleware to all routes in this file
router.use(authMiddleware);

// --- ROUTES ---

// GET /api/projects - Get all projects for the logged-in user
router.get('/', async (req, res) => {
    const userId = req.user.id;

    try {
        const projects = await prisma.project.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve projects.' });
    }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: 'Project name is required.' });
    }

    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                ownerId: userId,
            },
        });
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project.' });
    }
});

export default router;