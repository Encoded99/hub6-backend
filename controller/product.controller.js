import slugify from 'slugify'
import User from '../database/models/users.js'
import Exception from '../utils/exception.js'
import validateProduct from '../validations/product.validation.js'
import Msg from '../utils/resMsg.js'
import Product from '../database/models/products.js'
import Review from '../database/models/reviews.js'
import generateInvoice from '../utils/pdf-generator.js'
//cloudinary code start here'
import {config} from 'dotenv';
import cloudinary from 'cloudinary';
import { findOne } from './authentication.js';

import {userProductState,userProductTelephone} from './authentication.js'




config()

 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
 })

const userAttributes = 'firstName lastName email telephone address'

const sellerInclude = {
  path: 'seller',
  select: userAttributes,
}
export async function addProduct(req, res, next) {

  try {
    const data = req.body
 
    const capitalizeName = data.name[0].toUpperCase() + data.name.slice(1).toLowerCase();
    data.name = capitalizeName;
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
    }).lean();
    
    if (product) {
      // Fetch the seller separately
      const seller = await User.findById(product.seller).select('firstName email _id whatsAppNo telephone address.city address.state').lean();
    
      // Update the product with the seller information
      product.seller = seller;
      Msg(res, { product, })
      // Now, you have the populated product with the seller information
     
    } else {
      console.log('Product not found');
    }





   
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
export async function fetchProducts(req, res, next) {










  const {page}= req.query
  const limitNo=12

const skipNo=(page-1)*limitNo
  try {
    if (req.user.role !== 'admin') {
      throw new Exception(
        "you don't have the privilege to perform the action",
        400
      )
    }






    const products = await Product.find({$or:[{ status: 'pending' },
    { available: false }]})
      .sort({ _id: -1 })
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
      ]).skip(skipNo).limit(limitNo).exec()

    



    Msg(res, { products, })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function fetchVerifiedProducts(req, res, next) {




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
      ]).limit(16).exec()




    

      const fullProducts = await Product.find({ status: 'verified', available: true })
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
      ]).exec()




      function shuffleArray(array) {
        // Copy the original array to avoid modifying the original
        const shuffledArray = [...array];
      
        // Fisher-Yates Shuffle Algorithm
        for (let i = shuffledArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
      
        return shuffledArray;
      }


      let shuffledProducts=[]

      const shuffled= shuffleArray(fullProducts)


      if(!userProductState || !userProductTelephone){
        shuffledProducts=shuffled.slice(0,16)
      }

      else{


        const firstArray=shuffled.filter((item)=>item.seller.telephone!==userProductTelephone && item.seller.address.state===userProductState)


        const ArrayLength= 16
        const remainder=ArrayLength-firstArray.length
        
        const secondArray=shuffled.filter((item)=> item.seller.address.state!=userProductState).slice(0,remainder)
        
    shuffledProducts=firstArray.concat(secondArray)


      }

     


    Msg(res, { products,shuffledProducts })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}








export async function verifiedAdminProducts(req, res, next) {
const {page}=req.query




const limitNo=12

  const pageToSkip=(page-1)*limitNo
  
  
    try {

     
      const products = await Product.find({ status: 'verified', available: true })
        .sort({ createdAt: -1 } )
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
        ]).skip(pageToSkip).limit(limitNo).exec()
  

  



       
  
  
      Msg(res, { products, })
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


export const fetchCategory=async(req,res,next)=>{


  const {parameter,page,skiped}=req.query




  const pageSize=skiped
  const skippedNumber=(page-1)*pageSize
  try{

   



const datas= await Product.find({ category: { $regex: `.*category:${parameter}.*` } })


    const data = await Product.find({ category: { $regex: `.*category:${parameter}.*` } }).sort({ _id: -1 }).populate({
      path: 'seller',
      select: userAttributes,
    }).populate([
      {
        path: 'reviews',
        select: 'review',
        populate: { path: 'user', select: 'firstName email' },
      },
    ]).skip(skippedNumber).limit(pageSize).exec()
    

    if (data.length===0){
      console.log(parameter,'parameter sent from front-end')
    console.log(data.length,'lentosdig');
     console.log (data,'data')
     console.log(datas.length,'datasa length')
      console.log(skippedNumber,'skipped number')
      console.log(pageSize,'page size')
      console.log(page,'page')
    }
    
    Msg(res, { product: data })


  }

  catch(err){

  }

  finally{

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

const item= await Product.findOne({_id:id})
const image= item.image

const cloudId=image.map((item)=>{
  return item.cloudId || undefined
})


const validCloudId = cloudId.filter((element) => element !== undefined);




    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    )


    if (validCloudId.length) {

      for (let i=0;i<cloudId.length;i++){
        const element=cloudId[i]
          const result = await cloudinary.uploader.destroy(element)
          console.log(`Deleted resource with public_id: ${element}`, result)
          }
    
      
    }


 
 


    Msg(res, { product: 'product deleted' })
  }
  
  catch (err) {
    next(new Exception(err.message, err.status))
  }
}


















export async function adminDeleteProduct(req, res, next) {
  try {
  
    const { id } = req.params
    const item= await Product.findOne({_id:id})
    const image= item.image

  const cloudId=image.map((item)=>{
  return item.cloudId || undefined
})


const validCloudId = cloudId.filter((element) => element !== undefined);

    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    )

    if (validCloudId.length) {

      for (let i=0;i<cloudId.length;i++){
        const element=cloudId[i]
          const result = await cloudinary.uploader.destroy(element)
          console.log(`Deleted resource with public_id: ${element}`, result)
          }
     
    }



    Msg(res, { product: 'product deleted' })
  }
  
  
  catch (err) {
    next(new Exception(err.message, err.status))
  }
}



export async function searchProducts(req, res, next) {

  const { query} = req.query
  


  try {
   const products = await Product.find({
    $or: [
      { name: { $regex: `.*${query}.*`, $options: 'i' } },
      { tags: { $regex: `.*${query}.*`, $options: 'i' } },
      { category: { $regex: `.*${query}.*`, $options: 'i' } },
    ]
    }).limit(10).populate({
        path: 'seller',
        select: userAttributes,
      }).populate([
        {
          path: 'reviews',
          select: 'review',
          populate: { path: 'user', select: 'firstName email' },
        },
      ]) .exec()

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

export const addViews= async(req,res)=>{
  const {id} =req.params
  try{
   const product= await Product.findById(id)
   if(!product){
   return res.status(404).json('no matching product')
   }

   const updatedViews= await Product.findByIdAndUpdate(id,{$inc:{views:1}})

 return  res.status(200).json({success:true,message:'impression added',
    data:[updatedViews]})
  }

  catch(err){
     console.log(err);
  return   res.status(500).json({ error: 'Internal Server Error' });
  }
}



export const addContactViews= async (req,res,next)=>{

  const {id}=req.params
 
  try{

    const updatedViews= await Product.findByIdAndUpdate(id,{$inc:{cviews:1}})
    return  res.status(200).json({success:true,message:'contact view added',
    data:[updatedViews]})
  }

  

  catch(err){

console.log(err)
    return   res.status(500).json({ error: 'Internal Server Error' });


  }
}


export const userFetchUnverifiedProducts=async(req,res,next)=>{

  try{
    const userId  = req.user._id
    if(!userId){
  return   res.status(400).json({message:'unauthorized user'})
    }

    
    const products= await Product.find({$or:[{available:false,seller:userId},{status:'pending',seller:userId}]})
  


 return res.status(200).json({success:true,data:products})
   

  }



  catch(err){
    console.log(err);
  return  res.status(500).json({ error: 'Internal Server Error' });
 }


}










export const uploadCloudinary = async (req, res) => {

 




  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert the buffer to a base64-encoded string
    const base64String = req.file.buffer.toString('base64');

    // Upload the base64-encoded string to Cloudinary
    const result = await cloudinary.v2.uploader.upload(`data:${req.file.mimetype};base64,${base64String}`, {
      resource_type: 'auto',
    });

    // Respond with the Cloudinary upload result
    const uploadedImage = {
      url: result.secure_url,
      type: result.format,
      cloudId: result.public_id,
    };

 //   console.log('Uploaded image:', uploadedImage);
    return res.status(200).json(uploadedImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




  