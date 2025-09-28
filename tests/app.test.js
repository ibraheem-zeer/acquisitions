import app from '../src/app.js'
import request from 'supertest'

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return health status' , async()=>{
            const res = await request(app).get('/health').expect(200);
            expect(res.body).toHaveProperty('status','Ok');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
        })
    });

    describe('GET /api', () => {
        it('should return API message' , async()=>{
            const res = await request(app).get('/api').expect(200);
            expect(res.body).toHaveProperty('message','Acquisitons API is running!');
        })
    });

    describe('GET /nonexistent', () => {
        it('should return404 for non-existent routes' , async()=>{
            const res = await request(app).get('/nonexistent').expect(404);
            expect(res.body).toHaveProperty('error','Route not found');
        })
    });
    
});
