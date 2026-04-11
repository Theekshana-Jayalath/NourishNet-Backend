import Application from "../models/applicationModel.js";
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/userModel.js'
import Employee from '../models/employeeModel.js'

//Create

export const createApplication = async (req, res) => {
    try{
        console.log('[applications] create request body:', req.body)
        const { username, password, email, role } = req.body;

        // basic required checks
        if (!username || !password) {
            console.log('[applications] validation failed: missing username/password')
            return res.status(400).json({ message: 'Username and password are required' });
        }
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        // check username uniqueness across Users and pending/approved Applications
        const userExists = await User.findOne({ username });
        const appUserExists = await Application.findOne({ username });
        console.log('[applications] uniqueness check userExists:', !!userExists, 'appUserExists:', !!appUserExists)
        if (userExists || appUserExists) {
            console.log('[applications] validation failed: username taken')
            return res.status(400).json({ message: 'Username already taken' });
        }

        // check email uniqueness for applications
        const applicationExist = await Application.findOne({ email });
        console.log('[applications] email exists:', !!applicationExist)
        if (applicationExist) {
            console.log('[applications] validation failed: email already applied')
            return res.status(400).json({ message: "Application already exists" });
        }

        // hash password before storing with the application
        const hashed = await bcrypt.hash(password, 10);

        const applicationData = new Application({ ...req.body, password: hashed, username, status: 'pending' });

        const savedApplication = await applicationData.save();
        console.log('[applications] saved application id:', savedApplication._id)
        return res.status(201).json({ savedApplication });

    }catch(error){
        console.error('[applications] create error', error)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message)
            return res.status(400).json({ message: 'Validation failed', errors: messages })
        }
        return res.status(500).json({ message: "Error creating application" });
    }
}

//Read

export const fetch = async (req, res) => {
    try{
        const applications = await Application.find();  
        if(applications.length === 0){
            return res.status(404).json({ message: "No applications found" });
        }
        return res.status(200).json({ applications });
    }catch(err){
        return res.status(500).json({ message: "Error fetching data" });
    }
}

//Update

export const updateApplication = async (req, res) => {
    try{
        const id = req.params.id;
        const applicationExist = await Application.findOne({ _id: id });
        if(!applicationExist){
            return res.status(404).json({ message: "Application not found" });
        }

        // If status changing to approved, create employee record inside a transaction
        const newStatus = (req.body.status || '').toString().toLowerCase();
        if (newStatus === 'approved' && applicationExist.status !== 'approved') {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
            // choose username: prefer applicant-supplied, else derive from email/name
                const email = applicationExist.email || ''
                const baseFromEmail = (email.split('@')[0] || applicationExist.name || 'user').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user'
                let username = (applicationExist.username || baseFromEmail).toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || baseFromEmail

                // ensure unique username within the users collection (and within session)
                let attempt = 0
                while (await User.findOne({ username }).session(session)) {
                    attempt += 1
                    username = `${baseFromEmail}${attempt}`
                    if (attempt > 50) break
                }

                // determine password: if applicant supplied hashed password, reuse it; otherwise generate one
                let plainPassword = null
                let passwordHash
                if (applicationExist.password) {
                    passwordHash = applicationExist.password
                } else {
                    plainPassword = Math.random().toString(36).slice(-10)
                    passwordHash = await bcrypt.hash(plainPassword, 10)
                }

                // Build user object using all applicant-provided fields where present
                const user = new User({
                    name: applicationExist.name,
                    email: applicationExist.email,
                    username,
                    password: passwordHash,
                    role: applicationExist.role,
                    status: 'ACTIVE',

                    // Common profile fields
                    nic: applicationExist.nic,
                    address: applicationExist.address,
                    city: applicationExist.city,
                    contact: applicationExist.contact,

                    // Organization / NGO fields
                    organizationName: applicationExist.organizationName,
                    registrationNumber: applicationExist.registrationNumber,

                    // Driver-specific
                    vehicleType: applicationExist.vehicleType,
                    vehicleNumber: applicationExist.vehicleNumber,
                    licenseNumber: applicationExist.licenseNumber,

                    // Donor-specific
                    donorType: applicationExist.donorType || applicationExist.donationType,

                    // members (for NGO) – copy if provided
                    members: applicationExist.members,
                })

                // save new user within transaction
                await user.save({ session })

                // remove the application document now that the user has been created
                const deletedApplication = await Application.findByIdAndDelete(id, { session });

                await session.commitTransaction()
                session.endSession()

                const responsePayload = { deletedApplication }
                if (plainPassword) responsePayload.userCredentials = { username, password: plainPassword }
                return res.status(200).json(responsePayload)
            } catch (error) {
                await session.abortTransaction()
                session.endSession()
                console.error(error)
                return res.status(500).json({ message: 'Error approving application' })
            }
        }

        const updatedApplication = await Application.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({ updatedApplication });
    }catch(error){
        res.status(500).json({error : "Internal Server error."});
    }
}

//Delete

export const deleteApplication = async (req, res) => {
    try{
        const id = req.params.id;
        const applicationExist = await Application.findOne({ _id: id });
        if(!applicationExist){
            return res.status(404).json({ message: "Application not found" });
        }

        await Application.findByIdAndDelete(id);
        return res.status(200).json({ message: "Application deleted successfully" });
    }catch(error){
        res.status(500).json({error : "Internal Server error."});
    }
}

// Approve application: create user/employee and delete application
export const approveApplication = async (req, res) => {
    try {
        const id = req.params.id;
        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // build username (prefer supplied)
        const username = (application.username || (application.email || '').split('@')[0] || application.name || 'user')
            .toString()
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();

        // prepare password hash: reuse if stored, otherwise generate
        let passwordHash = application.password;
        if (!passwordHash) {
            const plain = Math.random().toString(36).slice(-10);
            passwordHash = await bcrypt.hash(plain, 10);
        }

        // Build payload including all applicant fields
        const userPayload = {
            name: application.name,
            email: application.email,
            username,
            password: passwordHash,
            role: application.role,
            status: 'ACTIVE',

            nic: application.nic,
            address: application.address,
            city: application.city,
            contact: application.contact,

            organizationName: application.organizationName,
            registrationNumber: application.registrationNumber,

            vehicleType: application.vehicleType,
            vehicleNumber: application.vehicleNumber,
            licenseNumber: application.licenseNumber,

            donorType: application.donorType || application.donationType,
            members: application.members,
        };

        await User.create(userPayload);

        await Application.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Application approved and user created', username });

    } catch (error) {
        console.error('[applications] approve error', error);
        return res.status(500).json({ message: 'Error approving application' });
    }
}