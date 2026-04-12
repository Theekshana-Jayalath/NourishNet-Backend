import express from "express";
import { fetch, createApplication , updateApplication , deleteApplication, approveApplication } from "../controllers/applicationController.js";

const route = express.Router();

// Support both legacy and new endpoints
route.get("/getAllApplications", fetch);
// new: GET /api/applications
route.get("/", fetch);
// create application - support both / (preferred) and legacy /create
route.post("/", createApplication);
route.post("/create", createApplication);
route.put("/update/:id", updateApplication);
route.delete("/delete/:id", deleteApplication);
route.post("/:id/approve", approveApplication);
route.put("/:id/approve", approveApplication);


export default route;