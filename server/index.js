import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initSentry, reportError } from './sentry.js';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Optional Sentry (only if SENTRY_DSN is provided)
await initSentry(app);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  try { reportError(reason); } catch {}
});
process.on('uncaughtException', (err) => {
  try { reportError(err); } catch {}
});
