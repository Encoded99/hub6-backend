import mongoose, { Schema } from 'mongoose'

const DSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles',
  },
  permission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'permissions',
  },
  resource: {
    type: String,
  },
  attributes: [Strings],
  conditions: [
    {
      fn: String,
      target: {
        filter: String,
      },
      evaluator: {
        key: String,
        filter: String,
      },
    },
  ],
})

const Policy = mongoose.model('policiess', DSchema)

export default Policy
