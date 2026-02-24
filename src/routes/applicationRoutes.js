import express from "express";
import { fetch, createApplication , updateApplication , deleteApplication } from "../controllers/applicationController.js";

const route = express.Router();

route.get("/getAllApplications", fetch);
route.post("/create", createApplication);
route.put("/update/:id", updateApplication);
route.delete("/delete/:id", deleteApplication);


export default route;