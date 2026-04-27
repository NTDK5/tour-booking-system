import express from 'express';
import { listUnifiedCalendarEvents } from './calendar.controller';

const router = express.Router();

router.get('/events', listUnifiedCalendarEvents);

export default router;
