import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
  role: {
    type: String,
    unique: true,
  },
})

const Role = mongoose.model('roles', Schema)

export default Role
