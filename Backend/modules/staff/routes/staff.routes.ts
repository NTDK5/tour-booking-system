import express from 'express';
import {
    activateStaffHandler,
    createStaffHandler,
    deactivateStaffHandler,
    getStaffByIdHandler,
    listStaffHandler,
    updateStaffHandler,
} from '../controllers/staff.controller';
import { listStaffSchedule } from '../../assignments/controllers/assignment.controller';

const router = express.Router();

router.get('/', listStaffHandler);
router.post('/', createStaffHandler);
router.get('/:id/schedule', listStaffSchedule);
router.get('/:id', getStaffByIdHandler);
router.put('/:id', updateStaffHandler);
router.patch('/:id/deactivate', deactivateStaffHandler);
router.patch('/:id/activate', activateStaffHandler);

export default router;
