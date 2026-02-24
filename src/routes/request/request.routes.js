import express from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  getRequestByRequestId,
  updateRequest,
  deleteRequest
} from "../../controllers/request/request.controller.js";

const router = express.Router();

// CREATE
router.post("/", createRequest);

// READ ALL (filters/pagination)
router.get("/", getAllRequests);

// READ by requestId
router.get("/by-requestId/:requestId", getRequestByRequestId);

// READ by Mongo _id
router.get("/:id", getRequestById);

// UPDATE
router.put("/:id", updateRequest);
router.patch("/:id", updateRequest);

// DELETE
router.delete("/:id", deleteRequest);

export default router;