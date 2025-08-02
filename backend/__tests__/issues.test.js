import request from 'supertest';
import { httpServer } from '../index.js'; // Use import
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Issues API', () => {
    let token;
    let projectId;
    let userId;

    beforeAll(async () => {
        const userResponse = await request(httpServer)
            .post('/api/auth/signup')
            .send({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });
        userId = userResponse.body.id;

        const loginResponse = await request(httpServer)
            .post('/api/auth/login')
            .send({ email: 'testuser@example.com', password: 'password123' });
        token = loginResponse.body.token;

        const projectResponse = await request(httpServer)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Project' });
        projectId = projectResponse.body.id;
    });

    afterAll(async () => {
        if (userId) {
          await prisma.user.delete({ where: { id: userId }});
        }
        await prisma.$disconnect();
        httpServer.close();
    });

    it('should create a new issue with valid data', async () => {
        const response = await request(httpServer)
            .post('/api/issues')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'A brand new test issue', projectId: projectId, priority: 'high' });
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('A brand new test issue');
    });
});