import express from 'express';
import {
    cancelAssignment,
    createAssignment,
    listDepartureAssignments,
    listStaffSchedule,
} from '../controllers/assignment.controller';

const router = express.Router();

router.post('/assignments', createAssignment);
router.delete('/assignments/:id', cancelAssignment);
router.get('/staff/:id/schedule', listStaffSchedule);
router.get('/departures/:id/assignments', listDepartureAssignments);

export default router;
