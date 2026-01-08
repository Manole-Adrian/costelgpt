import express from 'express';
import getPrompt from '../controllers/controller.js';
import { jwtDecode } from 'jwt-decode';
const costelRoutes = express.Router();
costelRoutes.get('/prompt', async (req, res) => {
    const { q: query, tone: tone } = req.query;
    const authToken = req.header("Authorization");
    if (!authToken) {
        res.status(401).json({ error: "401 Unauthorized" });
    }
    const decodedJwt = jwtDecode(authToken);
    if (!decodedJwt.firebase.identities.email.includes("@eestec.ro") && decodedJwt.firebase.sign_in_provider != "google.com") {
        return res.status(401).json({ error: '401 Unauthorized' });
    }
    if (!query) {
        return res.status(400).json({ error: `Query parameter "q" is required` });
    }
    if (!tone) {
        return res.status(400).json({ error: `Query parameter "tone" is required` });
    }
    const jwt = authToken.split(" ")[1];
    const result = await getPrompt(query, tone, jwt);
    res.json({
        ...result,
        timestamp: new Date().toISOString()
    });
});
costelRoutes.get('/', async (req, res) => {
    const result = {
        name: 'CostelGPT',
        author: 'Manole Adrian',
        apiVersion: '1.0'
    };
    res.json({
        ...result,
        timestamp: new Date().toISOString()
    });
});
export default costelRoutes;
//# sourceMappingURL=routes.js.map