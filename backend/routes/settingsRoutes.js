import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';

const router = express.Router();


router.route('/admin/settings')
    .get(
        verifyUserAuth,           
        roleBasedAccess('admin'), 
        getSettings              
    )
    .put(
        verifyUserAuth,           
        roleBasedAccess('admin'), 
        updateSettings            
    );


export default router;
