import app from '../server/index.js';
import { connectDB } from '../server/config/db.js';

/**
 * Vercel Serverless Function Entry Point
 * Routes all incoming /api/* requests through the fortified Express application stack.
 */
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel DB Notice]', err.message);
  }
  return app(req, res);
}
