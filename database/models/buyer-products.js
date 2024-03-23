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
        required:false,
      },
      type: {
        type: String,
        required:false,

      },
     
    },
  ],

  discount: {
    type: Number,
  },
  amount: {
    type: Number,
  },

  sku: {
    type: Number,
    required: false,
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
    default: new Date(),
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
const Product = mongoose.model('buyer-products', Schema)

export default Product
