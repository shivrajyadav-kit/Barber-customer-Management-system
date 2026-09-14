import express from "express";
import createContact from "../controller/contactController.js";

const router = express.Router();

router.post("/",createContact);
export default router;