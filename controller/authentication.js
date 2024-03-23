import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../database/models/users.js'
import Auth from '../database/models/auth.js'
import Conn from '../database/config.js'
import Exception from '../utils/exception.js'
import axios from 'axios';
import { config } from 'dotenv'

import {
  registerValidation,
  LoginValidation,
  EmailValidation,
} from '../validations/register.js'
import Msg from '../utils/resMsg.js'
import sendEmail from '../services/mail.service.js'
import generateString from '../utils/randString.js'
import { getCache, setCache, } from '../utils/redisCache.js'
import { sendMail } from './smtp.js'
import Product from '../database/models/products.js'
import mongoose from 'mongoose'
import Review from '../database/models/reviews.js'
//import { log } from 'winston'
export   let userProductState=null
export let userProductTelephone=null
import cloudinary from 'cloudinary';
config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
 })
















export async function signUpEmailPassword(req, res, next) {
  const conn = await Conn
  const session = await conn.startSession()
  try {
    session.startTransaction()
    const data = req.body
    const { error } = registerValidation(data)
    if (error) throw new Exception(error.details[0].message, 400)
    const isEmailExist = await User.findOne({
      $or: [{ email: data.email }, { telephone: data.telephone }],
    })
    if (isEmailExist) throw new Exception('user exist', 400)

    // const password = data.password = await bcrypt.hash(data.password, 10)
    const { password } = data
    delete data.password
    const account = await User.create([{ ...data }], { session })
    await Auth.create([{ user: account[0]._id, secret: password }], {
      session,
    })

    await session.commitTransaction()

    account.accessToken = jwt.sign(
      { _id: account[0]._id, email: account[0].email, role: account[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: '24hrs',
      }
    )
    Msg(res, { user: account[0] }, 'registered', 201)
  } catch (error) {
    await session.abortTransaction()
    next(new Exception(error.message, error.status))
  }
  session.endSession()
}

export async function completeSignup(req, res, next) {
  const conn = await Conn
  const session = await conn.startSession()
  try {
    session.startTransaction()
    const data = req.body
    const { token } = req.query

    const { error } = registerValidation(data)
    if (error) throw new Exception(error.details[0].message, 400)
    const cacheData = await getCache(token)

    if (!cacheData || cacheData.email !== data.email)
      throw new Exception('user does not exit', 400)
    const isEmailExist = await User.findOne({
      $or: [{ email: data.email }, { telephone: data.telephone }],
    })
    if (isEmailExist) throw new Exception('user exist', 400)
    const { password } = data
    delete data.password
    const account = await User.create([{ ...data }], { session })
    await Auth.create([{ user: account[0]._id, secret: password }], {
      session,
    })

    await session.commitTransaction()

    account.accessToken = jwt.sign(
      { _id: account[0]._id, email: account[0].email, role: account[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: '24hrs',
      }
    )

    Msg(res, { user: account[0] }, 'registered', 201)
  } catch (error) {
    await session.abortTransaction()
    next(new Exception(error.message, error.status))
  }
  session.endSession()
}

export async function signUpMagicLink(req, res, next) {
  try {
    const data = req.body
    const { error } = EmailValidation(data)
    if (error) throw new Exception(error.details[0].message, 400)
    const isEmailExist = await User.findOne({ email: data.email })
    if (!isEmailExist || isEmailExist.isVerified===true) throw new Exception('user has already been verified/user has not been registered', 400)
    const token = generateString()



    const body = {
      sender:{  
        name:"hub6",
        email:"ismailumar999@gmail.com"
     },
        to: [
        {
          email: data.email,
          name: 'Recipient Name',
        },
      ],
      subject: 'Email Verification',
     
     htmlContent: `<!DOCTYPE html>
     <html lang="en">
     <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Document</title>
     </head>
     <body>
     <p> Hi there,</p>
     
     <p> Thank you for signing up for Hub6,</p>
     
     <p>Please kindly click on the button below to verify your account </p>
          <button style="background-color: #007bff; width: auto;height: 45px; border-radius: 1.3rem;">
         <strong style="font-size: large;">
          <a style="text-decoration: none; color: white;" href="http://localhost:3000/users/verify-email/${token}">Verify Account</a>
         </strong>  
          </button> 
          <br>
          <br>
      <p> This link will expire in 24 hours. If you did not sign up for a Hub6 account,
      you can safely ignore this email.</p>
        <br>
        <br>
      Thank you,
     
    </body>
    </html>

      `,
      response:  'verification code has been sent to your email address',
    }

    
    const cache = await setCache(token, { token, email: data.email }, 900)


    const url='https://api.brevo.com/v3/smtp/email'

const config = {
  headers: {
    'Content-Type': 'application/json',
    'api-key':process.env.BREVO_API_KEY,
    'accept':'application/json'
  },
};

const resp= await axios.post(url,JSON.stringify(body),config)

    Msg(
      res,
      { message: 'check your email for verification link' },
      'registered',
      201
    )
  } catch (error) {
   
    next(new Exception(error.message, error.status))
  }
}

export async function Login(req, res, next) {




  try {
    /* To implement later
    1. Get the user's ip address from request.
    2. Get the region where the user is browsing from using https://ipwho.is/41.217.100.157 or  https://ipwhois.app/json/41.217.100.157
    3. save the data somewhere where you can reference to return products from that region to the user when he/she uses the findAll products endpoint

    */

    const { error } = LoginValidation(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })
    const { email,telephone, password } = req.body
    const user = await User.findOne({$or:[{email},{telephone}]})
    if (!user) throw new Exception('Invalid email/password ', 401)
    const auth = await Auth.findOne({ user: user._id })
    
    if (!auth) throw new Exception('Invalid password/password ', 401)
    const validPassword = await bcrypt.compare(password, auth.secret)

   
   
    if (!validPassword) throw new Exception('Invalid email/password ', 401)
   
    userProductState=user.address.state
    userProductTelephone=user.telephone
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    )

    const refreshToken=jwt.sign(
      {
        _id:user.id,email:user.email,role:user.role},
        
        process.env.JWT_SECRET,

      {
        expiresIn:'15d'
      }
    )
    


    res.cookie('jwt', token, { httpOnly: true,sameSite: 'None', secure: true,  maxAge:86400000, path: '/', domain:'https://hub6.vercel.app' });
    res.cookie('id', user._id, { httpOnly: true,sameSite: 'None', secure: true,  maxAge: 1296000000,path: '/', domain:'https://hub6.vercel.app' });

    res.cookie('rjwt',refreshToken,{httpOnly:true, sameSite: 'None', secure: true,  maxAge: 1296000000,path:'/',domain:'https://hub6.vercel.app'})
    
   


    return Msg(res, { user }, 'login successful', 200)
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function myAccout(req, res, next) {
  

  try {
  

   const userId = req.cookies.id
    
  

    const user = await User.findOne({ _id: userId })
    if (!user) throw new Exception('user  not found ', 400)

userProductState=user.address.state
userProductTelephone=user.telephone
    Msg(res, { data: user })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function findOne(req, res, next) {
  try {
    const { id } = req.params
    const user = await User.findOne({ _id: id })
    if (!user) throw new Exception('user  not found ', 400)

    Msg(res, { user })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function findAll(req, res, next) {

  const {page}=req.query
  const limitNo=16
  const skipNo=(page-1)*limitNo
  try {
    const users = await User.find().select(
      'firstName lastName email telephone role isVerified address'
    ).skip(skipNo).limit(limitNo)

    Msg(res, { users })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}
export async function updateUser(req, res, next) {
  try {
    const userId = req.user._id
    const user = await User.findOne({ _id: userId })
    if (!user) throw new Exception('user  not found ', 400)

    const data = await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
    })

    Msg(res, { user: data })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function deleteUser(req, res, next) {

const session= await mongoose.startSession()

  try {
    session.startTransaction()


    const products= await Product.find({seller:req.params.id}).session(session)


    const images = products.flatMap((item) => item.image);




 



    const data = await User.findOneAndDelete({ _id: req.params.id }).session(session)
    const product= await Product.deleteMany({seller:req.params.id}).session(session)



    const feedBacks= await Review.deleteMany({seller:req.params.id}).session(session)

    const cloudId=images.map((item)=>{
      return item.cloudId || undefined
    })
    
    
    const validCloudId = cloudId.filter((element) => element !== undefined);
    
      
    
        if (validCloudId.length) {
    
          for (let i=0;i<cloudId.length;i++){
            const element=cloudId[i]
              const result = await cloudinary.uploader.destroy(element)
              console.log(`Deleted resource with public_id: ${element}`, result)
              }
        
          
        }
    


await session.commitTransaction()

    Msg(res, { data: 'user deleted' })
  } catch (err) {
  await  session.abortTransaction()
    next(new Exception(err.message, err.status || 400))
  }

  finally{
    session.endSession()
  }
}
export async function searchUser(req, res, next) {
  try {
    const { email, telephone } = req.query

    const user = await User.findOne({
      $or: [{ email }, { telephone }],
    })
    if (!user) throw new Exception('user  not found ', 400)

    Msg(res, { user })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

















export const changePassWord = async (req, res) => {

 // console.log('change password controller hit');
  try {
    const userId = req.user._id
    
    const {  oldPassWord, newPassWord } = req.body;
    const user = await User.findById(userId).select('+password');


    if (!user) {
  return     res.status(400).json({success:false,message:'user doesnt exist'});
    }

    const auth = await Auth.findOne({ user: user._id });
    if (!auth) {
  return     res.status(400).json({success:false,message:'you are not authorized to perform this action'});
    }
    

    const isPassWordCorrect = await bcrypt.compare(oldPassWord, auth.secret);

    if (!isPassWordCorrect) {
  return     res.status(401).json({success:false,message:'incorrect current password'});
    }

    // Hash the new password
    const updatedPassWord = await bcrypt.hash(newPassWord, 10);

  

    // Update both the Auth model and the User model
    auth.secret = updatedPassWord;
    await Auth.updateOne({ _id: auth._id }, { $set: { secret: updatedPassWord } });
  
    
    

    user.password = updatedPassWord;
    await user.save();
    
  return  res.status(200).json({
      success: true,
      message: 'password updated successfully',
      
    });
  } catch (err) {
 
  
 return   res.status(500).send({success:false,message:'internal server error updating password'});
  }
};






















export const verifySignUpEmail=async(req,res)=>{
    const {token}=req.params

  try{
    const extractedToken= await getCache(token)
   if(!extractedToken){
  return  res.status(400).send({success:false,message:'invalid token/sign up link has expired'})
   }

   const tokenEmail=extractedToken.email
   
const user= await User.findOne({email:tokenEmail})
   if(!user){
  return  res.status(400).send('no user with this associted email found')
   }

   const task= await User.findOneAndUpdate({email:tokenEmail},{isVerified:true})
   
   const redirectUrl = 'http://localhost:3000/verified';
return   res.status(200).json({success:true,message:'email verified, your account is fully registered',data:task,redirectUrl
  })
     
  }

  catch(err){
 
 return   res.status(500).send({success:false,message:'internal server error'})
  }

}



export const forgotPassWord=async(req,res)=>{
   


  try{

    const data=req.body
   
    const EmailExist= await User.findOne({email:data.email})
    
      if(!EmailExist){
        res.status(400).send('this email is not associated to any user in our data-base')
      }
      const token = generateString()

      const body = {
        sender:{  
          name:"hub6",
          email:"ismailumar999@gmail.com"
       },
          to: [
          {
            email: data.email,
            name: 'Recipient Name',
          },
        ],
        subject: 'Password Reset',
       
       htmlContent: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    
  
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <p> Hi there,</p>
        
        <p>Please kindly click on the button below to reset your account password </p>
        
        <p>Please do not reveal your password to anyone, kindly be aware of imposters. Note that hub6 staff do not request for users' passwords. If you suspect your password has been tampered with, please kindly reset or change your password as soon as possible </p>
        
        <!-- Bootstrap-styled button -->
        <button class="btn btn-primary" style="border-radius: 1.3rem;width: auto;height: 45px; background-color:#007bff">
            <a style="text-decoration: none; color: white;" href="http://localhost:3000/users/reset-password/${token}">
                <strong style="font-size: large;">Reset password</strong>
            </a>
        </button> 
        
        <br>
        <br>
        
        This link will expire in 24 hours. If you did not request this password reset, you can safely ignore this email, and make sure you don't divulge any sensitive information like your email password to anyone.
        
        <br>
        <br>
        
        Thank you,
    </div>
</body>
</html>

               `,
        response: 'reset link has been sent to your email address',
      }
     
      const cache = await setCache(token, { token, email: data.email }, 900)




const url='https://api.brevo.com/v3/smtp/email'

const config = {
  headers: {
    'Content-Type': 'application/json',
    'api-key':process.env.BREVO_API_KEY,
    'accept':'application/json'
  },
};

const resp= await axios.post(url,JSON.stringify(body),config)
 


    //  await sendMail(body)
     
    Msg(
      res,
      { message: 'A link has been sent to your email, kindly  check your email for verification link' },
      'registered',
      201
    ) 

     

  }

  catch(err){
      
     
      res.status(500).send('internal server error')
  }
}



export const verifyPassWordResetMail=async(req,res)=>{
try{

  const {token}=req.params
  const {newPassWord}=req.body
  const extractedToken= await getCache(token)
   if(!extractedToken){
    res.status(400).send('invalid token/password reset link has expired')
   }
   const tokenEmail=extractedToken.email
   

const user= await User.findOne({email:tokenEmail})

if(!user){
 return res.status(400).send('no user with this associated email found')
 }

 const auth = await Auth.findOne({ user: user._id });
 if(!auth){
 return res.status(400).send('user has no associated password in the database')
 }


const hashedPassWord= await bcrypt.hash(newPassWord,10)

auth.secret = hashedPassWord;
await Auth.updateOne({ _id: auth._id }, { $set: { secret: hashedPassWord } });

user.password = hashedPassWord;
    await user.save();
    
return    res.status(200).json({
      success: true,
      message: 'your password has been reset successfully',
      
    });



}

catch(err){
 
//  console.log('error sending verification password');

  
return  res.status(500).send('internal server error')
}
}







export const userLogOut= async(req,res,)=>{

   //console.log('log out hit');
 
  try{
    const user=req.user



   const token= req.cookies.jwt
   const refreshToken= req.cookies.rjwt

  

    res.cookie('jwt', token, { expires: new Date(0) });
    res.cookie('rjwt', refreshToken, { expires: new Date(0) });
    res.cookie('id', user._id, { expires: new Date(0) });




  return  res.status(200).send('log out sucessfully')


  }

  catch(err){
    res.status(500).send('internal access error')
  }
  


}
