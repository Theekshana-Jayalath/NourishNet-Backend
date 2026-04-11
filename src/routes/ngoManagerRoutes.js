import express from 'express'
import auth from '../middleware/authMiddleware.js'
import {
  getStats,
  getApplications,
  getApplicationById,
  approveApplication,
  declineApplication,
  getRequests,
  getRequestById,
  approveRequest,
  declineRequest,
  getNgoUsers,
  updateNgoUserStatus
} from '../controllers/ngoManagerController.js'

const router = express.Router()

// Middleware to check if user is NGO manager
const isNgoManager = (req, res, next) => {
  const role = (req.user?.role || '').toString().toLowerCase()
  const department = (req.user?.department || '').toString().toLowerCase()

  console.log('NGO MANAGER CHECK =>', {
    user: req.user,
    role,
    department
  })

  if (role !== 'manager' || department !== 'ngo') {
    return res.status(403).json({
      message: 'Access denied. NGO Manager only.',
      debug: { role, department }
    })
  }

  next()
}

// ─── DASHBOARD STATS ────────────────────────────────────────
router.get('/stats', auth, isNgoManager, getStats)

// ─── APPLICATIONS ───────────────────────────────────────────
router.get('/applications', auth, isNgoManager, getApplications)
router.get('/applications/:id', auth, isNgoManager, getApplicationById)
router.patch('/applications/:id/approve', auth, isNgoManager, approveApplication)
router.patch('/applications/:id/decline', auth, isNgoManager, declineApplication)

// ─── REQUESTS ───────────────────────────────────────────────
router.get('/requests', auth, isNgoManager, getRequests)
router.get('/requests/:id', auth, isNgoManager, getRequestById)
router.patch('/requests/:id/approve', auth, isNgoManager, approveRequest)
router.patch('/requests/:id/decline', auth, isNgoManager, declineRequest)

// ─── NGO USERS ──────────────────────────────────────────────
router.get('/users', auth, isNgoManager, getNgoUsers)
router.patch('/users/:id/status', auth, isNgoManager, updateNgoUserStatus)

export default router