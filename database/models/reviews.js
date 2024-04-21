import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
  review: {
    type: String,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
})

const Review = mongoose.model('reviews', Schema)

export default Review
