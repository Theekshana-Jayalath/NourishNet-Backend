import Application from '../models/applicationModel.js'
import User from '../models/userModel.js'
import Request from '../models/request/request.model.js'
import Counter from '../models/request/counter.model.js'

// ─── DASHBOARD STATS ────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    console.log('NGO MANAGER: getStats called')

    const totalApplications = await Application.countDocuments({ role: 'ngo' })
    const pendingApplications = await Application.countDocuments({ role: 'ngo', status: 'pending' })
    const approvedApplications = await Application.countDocuments({ role: 'ngo', status: 'approved' })
    const declinedApplications = await Application.countDocuments({ role: 'ngo', status: 'declined' })

    const totalRequests = await Request.countDocuments()
    const pendingRequests = await Request.countDocuments({ status: 'PENDING' })
    const approvedRequests = await Request.countDocuments({ status: 'APPROVED' })
    const declinedRequests = await Request.countDocuments({ status: 'DECLINED' })

    const totalNgoUsers = await User.countDocuments({ role: 'ngo' })
    const activeNgoUsers = await User.countDocuments({ role: 'ngo', status: 'ACTIVE' })

    console.log('NGO MANAGER STATS =>', {
      totalApplications,
      pendingApplications,
      approvedApplications,
      declinedApplications,
      totalRequests,
      pendingRequests,
      approvedRequests,
      declinedRequests,
      totalNgoUsers,
      activeNgoUsers
    })

    res.json({
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        declined: declinedApplications
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        declined: declinedRequests
      },
      users: {
        total: totalNgoUsers,
        active: activeNgoUsers
      }
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─── APPLICATIONS ───────────────────────────────────────────
export const getApplications = async (req, res) => {
  try {
    const { status } = req.query
    const filter = { role: 'ngo' }

    if (status) filter.status = status

    const applications = await Application.find(filter).sort({ createdAt: -1 })
    console.log('NGO MANAGER APPLICATIONS =>', { filter, count: applications.length })
    res.json(applications)
  } catch (err) {
    console.error('Fetch applications error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.json(application)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: `Application already ${application.status}` })
    }

    let counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )

    const userId = `UI${String(counter.seq).padStart(4, '0')}`

    const newUser = new User({
      name: application.name,
      username: application.username,
      email: application.email,
      password: application.password,
      role: 'ngo',
      status: 'ACTIVE',
      nic: application.nic || '',
      address: application.address || '',
      city: application.city || '',
      contact: application.contact || '',
      organizationName: application.organizationName || '',
      registrationNumber: application.registrationNumber || '',
      userId
    })

    await newUser.save()

    // Delete the application after successful user creation
    await Application.findByIdAndDelete(req.params.id)

    res.json({ message: 'Application approved successfully and removed from applications', user: newUser })
  } catch (err) {
    console.error('Approve error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const declineApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: `Application already ${application.status}` })
    }

    application.status = 'declined'
    application.declinedBy = req.user.id
    application.declinedAt = new Date()
    application.declineReason = req.body.reason || ''
    await application.save()

    res.json({ message: 'Application declined', application })
  } catch (err) {
    console.error('Decline error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─── REQUESTS ───────────────────────────────────────────────
export const getRequests = async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}

    if (status) filter.status = status

    const requests = await Request.find(filter).sort({ createdAt: -1 })
    console.log('NGO MANAGER REQUESTS =>', { filter, count: requests.length })
    res.json(requests)
  } catch (err) {
    console.error('Fetch requests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    res.json(request)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const approveRequest = async (req, res) => {
  try {
    console.log('APPROVE REQUEST HIT:', req.params.id)
    console.log('REQ.USER FOR APPROVE:', req.user)

    const request = await Request.findById(req.params.id)
    console.log('FOUND REQUEST FOR APPROVE:', request)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Request already ${request.status}` })
    }

    request.status = 'APPROVED'
    request.approvedBy = req.user.id
    request.approvedAt = new Date()
    await request.save()

    console.log('REQUEST APPROVED SUCCESSFULLY:', request._id)

    res.json({ message: 'Request approved', request })
  } catch (err) {
    console.error('Approve request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const declineRequest = async (req, res) => {
  try {
    console.log('DECLINE REQUEST HIT:', req.params.id)
    console.log('DECLINE REQUEST BODY:', req.body)
    console.log('REQ.USER FOR DECLINE:', req.user)

    const request = await Request.findById(req.params.id)
    console.log('FOUND REQUEST FOR DECLINE:', request)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Request already ${request.status}` })
    }

    request.status = 'DECLINED'
    request.declinedBy = req.user.id
    request.declinedAt = new Date()
    request.declineReason = req.body.reason || ''
    await request.save()

    console.log('REQUEST DECLINED SUCCESSFULLY:', request._id)

    res.json({ message: 'Request declined', request })
  } catch (err) {
    console.error('Decline request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ─── NGO USERS ──────────────────────────────────────────────
export const getNgoUsers = async (req, res) => {
  try {
    const { status } = req.query
    const filter = { role: 'ngo' }

    if (status) filter.status = status

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    console.log('NGO MANAGER USERS =>', { filter, count: users.length })
    res.json(users)
  } catch (err) {
    console.error('Fetch users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateNgoUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'ngo') {
      return res.status(400).json({ message: 'Not an NGO user' })
    }

    user.status = status
    await user.save()

    res.json({
      message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'}`,
      user
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}