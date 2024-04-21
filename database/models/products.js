import mongoose from 'mongoose'
// import MongooseDelete from 'mongoose-delete'

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  description: {
    type: String,
    required: [true, 'description is required'],
  },
  category: {
    type: String,
    required: [true, 'category is required'],
  },
  slug: {
    type: String,
    unique: true,
    lower: true,
    required: true,
  },
  image: [
    {
      url: {
        type: String,
      },
      type: {
        type: String,
      },
      cloudId: {
        type: String,
      },
    },
  ],

  discount: {
    type: Number,
  },
  amount: {
    type: Number,
  },

  
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },

  available: {
    type: Boolean,
    default: false,
  },

  views: {
    type: Number,
    default: 0,
  },

  cviews: {
    type: Number,
    default: 0,
  },
  tags: [String],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reviews',
    },
  ],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  createdAt: {
    type: Date,
    default:()=>new Date(),
  },
  deletedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
})
Schema.pre('find', function () {
  this.where({ isDeleted: false })
})
Schema.pre('findOne', function () {
  this.where({ isDeleted: false })
})

// Schema.plugin(MongooseDelete)
const Product = mongoose.model('products', Schema)

export default Product
