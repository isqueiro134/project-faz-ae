import express from 'express';
import HiringRepository from '../Repository/HiringRepository.js';
import ProfileRepository from '../Repository/ProfileRepository.js';
import { requireApiAuth } from '../middleware/auth.js';

const router = express.Router();

async function requireClient(req, res) {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.profile_type !== 'client') {
        res.status(403).json({ message: 'Ambiente incompativel.' });
        return false;
    }
    return true;
}

router.get('/', requireApiAuth, async (req, res) => {
    try {
        if (!await requireClient(req, res)) return;
        const hirings = await new HiringRepository().listByClientUserId(req.user.id);
        res.status(200).json({ hirings });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.post('/', requireApiAuth, async (req, res) => {
    try {
        if (!await requireClient(req, res)) return;
        const hiring = await new HiringRepository().create(req.user.id, req.body.freelancer_id);
        res.status(201).json({ hiring });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

export default router;
