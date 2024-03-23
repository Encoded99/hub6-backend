import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    type: {
      type: String,
      enum: ['PASSWORD', 'FACEBOOK_OAUTH', 'GOOGLE_OAUTH'],
      default: 'PASSWORD',
    },
    secret: {
      type: String,
      required: true,
    },
    initialSecret: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
)
Schema.pre('save', async function (next) {
  try {
    // if (!this.isModified('password')) next()
    // const salt = await bcrypt.genSalt()
    this.secret = await bcrypt.hash(this.secret, 10)
    next()
  } catch (error) {
    console.log(error)
    throw error('Something Wrong Happened')
  }
})

const Auth = mongoose.model('auth', Schema)

export default Auth
