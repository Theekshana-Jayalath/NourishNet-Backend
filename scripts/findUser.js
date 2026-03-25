// Diagnostic script to find a user by username in MongoDB
// Usage: node scripts/findUser.js <username>

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../src/models/userModel.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/nourishnet'

const username = process.argv[2]
if (!username) {
  console.error('Usage: node scripts/findUser.js <username>')
  process.exit(1)
}

const run = async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    const user = await User.findOne({ username }).lean()
    if (!user) {
      console.log(`User not found for username: "${username}"`)
      process.exit(0)
    }

    // Print important fields, mask password hash
    const { _id, username: un, name, email, role, status, createdAt, updatedAt } = user
    console.log('User found:')
    console.log({ _id, username: un, name, email, role, status, createdAt, updatedAt })

    // If you need to inspect password hash (not recommended), uncomment below:
    // console.log('passwordHash:', user.password)

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(2)
  }
}

run()
