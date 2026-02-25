import Request from "../../models/request/request.model.js";

// CREATE: POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const created = await Request.create(req.body);
    return res.status(201).json({
      message: "Request created successfully",
      data: created
    });
  } catch (err) {
    return res.status(400).json({
      message: "Request creation failed",
      error: err.message
    });
  }
};

// READ ALL (with filters): GET /api/requests
export const getAllRequests = async (req, res) => {
  try {
    const { status, urgencyLevel, q, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    if (q) filter.organizationName = new RegExp(q, "i");

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Request.countDocuments(filter)
    ]);

    return res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
};

// READ ONE by Mongo _id: GET /api/requests/:id
export const getRequestById = async (req, res) => {
  try {
    const doc = await Request.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json(doc);
  } catch (err) {
    return res.status(400).json({ message: "Invalid request id", error: err.message });
  }
};

// READ ONE by requestId: GET /api/requests/by-requestId/:requestId
export const getRequestByRequestId = async (req, res) => {
  try {
    const doc = await Request.findOne({ requestId: req.params.requestId });
    if (!doc) return res.status(404).json({ message: "Request not found" });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch request", error: err.message });
  }
};

// UPDATE: PUT/PATCH /api/requests/:id
export const updateRequest = async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    return res.json({
      message: "Request updated successfully",
      data: updated
    });
  } catch (err) {
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// DELETE: DELETE /api/requests/:id
export const deleteRequest = async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Request not found" });

    return res.json({ message: "Request deleted successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Delete failed", error: err.message });
  }
};