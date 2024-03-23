import mongoose from 'mongoose'

const PermissionEnum = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'MODIFY',
  'MANAGE',
  'READOWN',
  'UPDATEOWN',
  'DELETEOWN',
]

const Schema = new mongoose.Schema({
  action: {
    type: String,
    enum: PermissionEnum,
    unique: true,
  },
})

const Permission = mongoose.model('permissions', Schema)

export default Permission
