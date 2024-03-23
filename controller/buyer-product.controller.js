import slugify from 'slugify'
import User from '../database/models/users.js'
import Exception from '../utils/exception.js'
import validateProduct from '../validations/product.validation.js'
import Msg from '../utils/resMsg.js'
import Product from '../database/models/buyer-products.js'
import Review from '../database/models/reviews.js'
import generateInvoice from '../utils/pdf-generator.js'


const userAttributes = 'firstName lastName email telephone address'

const sellerInclude = {
  path: 'seller',
  select: userAttributes,
}


export const getAllReview=async(req,res)=>{

  try{

  res.send('howdy')

  }

  catch(err){
    console.log(err);
  }

}










export async function addProduct(req, res, next) {
  try {
    const data = req.body
    const { error } = validateProduct(data)
    if (error) throw new Exception(error.details[0].message, 400)
    data.slug = slugify(`${data.name} ${Date.now()}`, {
      lower: true,
      trim: true,
    })
    data.seller = req.user._id
    const product = await Product.create(data)
    Msg(res, { product }, 'product added to marketplace', 201)
  } catch (error) {
    next(new Exception(error.message, error.status))
  }
}

export async function findProduct(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }],
    })
      .lean()
      .populate([
        {
          path: 'seller',
          select: userAttributes,
        },
        {
          path: 'reviews',
          select: 'review',
          populate: { path: 'user', select: 'firstName email _id' },
        },
      ])
      .exec()
    if (!product) throw new Exception('product not found ', 400)

    Msg(res, { product })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
export async function fetchProducts(req, res, next) {
  console.log('you are in buyer product');
  try {
    if (req.user.role !== 'admin') {
      throw new Exception(
        "you don't have the privilege to perform the action",
        400
      )
    }
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'seller',
        select: userAttributes,
      })
      .populate([
        {
          path: 'reviews',
          select: 'review',
          populate: { path: 'user', select: 'firstName email _id' },
        },
      ])
      .exec()

    Msg(res, { products })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function fetchVerifiedProducts(req, res, next) {
  console.log('you are in verified buyer product');
  try {
    const products = await Product.find({ status: 'verified', available: true })
      .sort({ createdAt: -1 })
      .populate({
        path: 'seller',
        select: userAttributes,
      })
      .populate([
        {
          path: 'reviews',
          select: 'review',
          populate: { path: 'user', select: 'firstName email' },
        },
      ])
      .exec()

    Msg(res, { products })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id })
    if (!product) throw new Exception('product  not found ', 400)

    const data = await Product.findByIdAndUpdate(product._id, req.body, {
      new: true,
    }).lean()

    Msg(res, { product: data })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function updateProductStatus(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id })
    if (!product) throw new Exception('product  not found ', 400)

    product.status = req.body.status
    product.available = req.body.available

    const data = await Product.findOneAndUpdate(
      { _id: product._id },
      { ...product },
      {
        new: true,
      }
    )

    Msg(res, { product: data })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function userDeleteProduct(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    )

    Msg(res, { product: 'product deleted' })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function adminDeleteProduct(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    )

    Msg(res, { product: 'product deleted' })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
export async function searchProducts(req, res, next) {
  try {
    const { tag, category, name, amount } = req.query

    const products = await Product.find({
      $or: [
        { tags: { $regex: `.*${name}.*`, $options: 'i' } },
        { name: { $regex: `.*${tag}.*`, $options: 'i' } },
        { tags: { $in: [tag] } },
        { amount: { $lt: amount } },
        { category: { $regex: `.*${category}.*`, $options: 'i' } },
      ],
    }).limit(10)
    if (!products) throw new Exception('products  not found ', 400)

    Msg(res, { products })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function addProductReview(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id })
    if (!product) throw new Exception('product  not found ', 400)

    const review = await Review.create({
      review: req.body.review,
      user: req.user._id,
      product: product._id,
    })

    product.reviews.push(review)

    const data = await Product.findByIdAndUpdate(product._id, product, {
      new: true,
    })
    Msg(res, { review: req.body.review }, 'review added to product ', 201)
  } catch (error) {
    next(new Exception(error.message, error.status))
  }
}

export async function generateAndSendInvoice(req, res, next) {
  try {
    const data = {
      logo: 'https://thumbs.dreamstime.com/b/laundry-basket-icon-trendy-design-style-isolated-white-background-vector-simple-modern-flat-symbol-web-site-mobile-135748439.jpg',
      name: 'Company Name',
      address1: 'Some Road No 1',
      address2: 'Some State, Pincode',
      orderId: 'INV-001',
      customerName: 'Sai Sandeep',
      date: 'Oct 2, 2022',
      paymentTerms: 'Delivery Items Receipt',
      items: [
        {
          name: 'SINGLE BED_SHEET',
          qty: 3,
          rate: '10.00',
          amount: '30.00',
        },
        {
          name: 'DOUBLE BED_SHEET',
          qty: 2,
          rate: '20.00',
          amount: '40.00',
        },
        {
          name: 'TOWELS',
          qty: 3,
          rate: '5.00',
          amount: '15.00',
        },
        {
          name: 'CLOTHES',
          qty: 3,
          rate: '50.00',
          amount: '150.00',
        },
      ],
      total: '235.00',
      balanceDue: '235.00',
      notes: 'Thanks for being an awesome customer!',
      terms:
        'This invoice is auto generated at the time of delivery. If there is any issue, Contact provider',
    }

    const pdf = await generateInvoice(data)
    res.status(200)
    res.contentType('application/pdf')
    res.send(pdf)
  } catch (error) {
    next(new Exception(error.message, error.status))
  }
}

export async function fetchSeller(req, res, next) {
  try {
    const uniqueSellers = await Product.find().distinct('seller')
    const sellers = await User.find({
      _id: { $in: uniqueSellers },
    }).select(userAttributes)

    Msg(res, { sellers })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
