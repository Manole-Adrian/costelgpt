import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import costelRoutes from './routes/routes.js';
import { rateLimit } from 'express-rate-limit';
import { environment } from './utils/env.js';
const app = express();
const PORT = environment.port;
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
})

const allowedOrigins = [`http://localhost:3000`, 'https://costel.eestec.ro', 'http://localhost:8081']

app.use(helmet())
app.use(cors({
    origin: function (origin, callback) {
        if(allowedOrigins.indexOf(origin!) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(limiter);

app.use('/api/v1', costelRoutes)

if (!process.env.FUNCTION_TARGET) {
    app.listen(PORT, () => {
        console.log(`🚀 RAG API running on port ${PORT}`);
        console.log(`🤖 LLM using ${environment.genModel}`);
    });
}

export default app;