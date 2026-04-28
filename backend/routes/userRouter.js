import express from 'express';
import UserRepository from '../Repository/UserRepository.js';
import AuthRepository from '../Repository/AuthRepository.js';

const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await new AuthRepository().signIn(email, password);
        res.status(200).send(result);
    } catch (error) {
        res.status(404).send(`User not found: ${error}`);
    }
})

router
    .route("/")
    .get(async (req, res) => {
        try {
            const results = await new UserRepository().getAll();
            res.status(200).send(results);
        } catch (error) {
            res.status(404).send(`User not found: ${error}`);
        }
    })
    .post(async (req, res) => {
        const { email, password, metadata } = req.body;
        try {
            const result = await new AuthRepository().register(email, password, metadata);
            res.status(201).send(result);
        } catch (error) {
            res.status(404).send(`User not found: ${error}`);
        }
    })

router
    .route("/:id")
    .get(async (req, res) => {
        const { id } = req.body;
        try {
            const result = await new UserRepository().getById(id);
            res.status(200).send(result);
        } catch (error) {
            res.status(404).send(`User not found: ${error}`);
        }
    })


export default router;