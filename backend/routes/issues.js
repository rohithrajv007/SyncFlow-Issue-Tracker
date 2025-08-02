const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.js');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// ... other code ...

router.get('/', async (req, res) => {
    console.log('1. Received request for GET /api/issues');
    const { projectId, status, priority, search } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
        where.title = {
            contains: search,
            mode: 'insensitive',
        };
    }
    
    console.log('2. Built filter object:', where);

    try {
        console.log('3. Querying the database...');
        const issues = await prisma.issue.findMany({
            where,
            include: {
                project: { select: { name: true } },
                assignee: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log('4. Database query successful! Sending response.');
        res.status(200).json(issues);
    } catch (error) {
        console.error('5. An error occurred in the database query!', error);
        res.status(500).json({ message: 'Failed to retrieve issues.', error: error.message });
    }
});

// ... other code ...

// POST /api/issues - Create a new issue
router.post('/', async (req, res) => {
    const { title, description, priority, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
        return res.status(400).json({ message: 'Title and projectId are required.' });
    }

    try {
        const newIssue = await prisma.issue.create({
            data: { title, description, priority, projectId, assigneeId },
        });
        
        // ✨ EMIT EVENT: A new issue has been created
        req.io.emit('issue:created', newIssue);

        res.status(201).json(newIssue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create issue.', error: error.message });
    }
});

// PATCH /api/issues/:issueId - Update an issue
router.patch('/:issueId', async (req, res) => {
    const { issueId } = req.params;
    const { title, description, status, priority, assigneeId } = req.body;

    try {
        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: { title, description, status, priority, assigneeId },
        });

        // ✨ EMIT EVENT: An existing issue has been updated
        req.io.emit('issue:updated', updatedIssue);

        res.status(200).json(updatedIssue);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Issue not found.' });
        }
        res.status(500).json({ message: 'Failed to update issue.', error: error.message });
    }
});
// DELETE /api/issues/:issueId - Delete an issue
// DELETE /api/issues/:issueId - Delete an issue
router.delete('/:issueId', async (req, res) => {
    const { issueId } = req.params;

    try {
        await prisma.issue.delete({
            where: { id: issueId },
        });

        // ✨ EMIT EVENT: An issue has been deleted
        req.io.emit('issue:deleted', { id: issueId });

        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Issue not found.' });
        }
        res.status(500).json({ message: 'Failed to delete issue.', error: error.message });
    }
});

export default router;