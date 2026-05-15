import express from 'express';
import { 
    getMyNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from '../controllers/notificationController.js';
import { verifyUserAuth } from '../middleware/userAuth.js';

const router = express.Router();

router.route('/all').get(verifyUserAuth, getMyNotifications);
router.route('/:id/read').put(verifyUserAuth, markNotificationAsRead);
router.route('/read-all').put(verifyUserAuth, markAllNotificationsAsRead);

export default router;
