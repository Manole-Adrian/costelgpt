import {onRequest} from "firebase-functions/v2/https";
// Reach out of the functions folder to get your Express app
// Ensure this path actually leads to your Express implementation
import app from "../../index.js";

// THIS LINE IS MANDATORY - Firebase looks for this 'api' export
export const api = onRequest(app);
