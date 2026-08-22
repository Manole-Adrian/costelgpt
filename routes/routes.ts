import express from 'express';
import getPrompt from '../controllers/controller.js'
import { environment } from '../config/env.js';
import { isAllowedUser, verifyRequestToken } from '../services/firebaseAuth.js';

const costelRoutes = express.Router();

costelRoutes.get('/prompt', async (req, res) => {
    const { q: query, tone: tone } = req.query;

    const authToken = req.header("Authorization");
    if(!authToken) {
        return res.status(401).json({error:"401 Unauthorized"})
    }

    if (environment.authDevBypass) {
        console.warn("⚠️ AUTH_DEV_BYPASS is on — accepting token without verification");
    } else {
        try {
            const user = await verifyRequestToken(authToken);
            if (!isAllowedUser(user)) {
                console.warn(`🚫 Rejected ${user.email || user.uid}: not a verified @eestec.ro account`);
                return res.status(403).json({error: '403 Forbidden'})
            }
        } catch (error: any) {
            console.warn("🚫 Token verification failed:", error.message);
            return res.status(401).json({error: '401 Unauthorized'})
        }
    }

    if (!query) {
        return res.status(400).json({error: `Query parameter "q" is required`});
    }

    if (!tone) {
        return res.status(400).json({error: `Query parameter "tone" is required`});
    }
    console.log("got request!")
    const result = await getPrompt((query as string), (tone as string))
    return res.json({
        ...result,
        timestamp: new Date().toISOString()
    });

})

costelRoutes.get('/', async (req, res) => {
    const result = {
        name: 'CostelGPT',
        author: 'Manole Adrian',
        apiVersion: '1.0'
    }
    res.json({
        ...result,
        timestamp: new Date().toISOString()
    })
})

export default costelRoutes;