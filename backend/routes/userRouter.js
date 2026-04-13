import express from 'express';
import UserRepository from '../Repository/UserRepository.js';
import AuthRepository from '../Repository/AuthRepository.js';

const router = express.Router();

router
    .route("/")
    .get(async (req, res) => {
        const { id } = req.body;
        try {
            const result = await new UserRepository().getById(id);
            res.status(200).send(result);
        } catch (error) {
            res.status(404).send(`User not found: ${error}`);
        }
    })
    .post(async (req, res) => {
        const { email, senha, metadata } = req.body;
        try {
            const result = await new AuthRepository().register(email, senha, metadata);
            res.status(200).send(result);
        } catch (error) {
            res.status(404).send(`User not found: ${error}`);
        }
    })