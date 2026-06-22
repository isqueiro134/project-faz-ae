import express from 'express';
import ProfileRepository from '../Repository/ProfileRepository.js';
import { requireApiAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/select', requireApiAuth, async (req, res) => {
    try {
        const result = await new ProfileRepository().selectProfile(req.user.id, req.body.profile_type);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.put('/me', requireApiAuth, async (req, res) => {
    try {
        const profile = await new ProfileRepository().updateBaseProfile(req.user.id, req.body);
        res.status(200).json({ profile });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

export default router;
