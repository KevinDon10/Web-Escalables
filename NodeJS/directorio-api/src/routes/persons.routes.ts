import {Router} from "express";
import {getPersons, getPersonById, createPersons, deletePersons, updatePersons, migratePersons} from "../controllers/persons.controller.ts";


const router = Router();

router.get("/", getPersons);
router.get("/:id", getPersonById);
router.post("/", createPersons);
router.delete("/:id", deletePersons);
router.put("/:id", updatePersons);
router.post("/migrate", migratePersons);


export default router;