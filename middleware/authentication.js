import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import axios from 'axios';
import User from '../database/models/users.js';
import Feedback from '../database/models/feedback.js';


config()



const domain = '.onrender.com';  

















export default  function  isLoggedIn(req, res, next) {
 // console.log(req.headers.authorization,'headers')

 //console.log(req.cookies,'cookies');
 const token = req.cookies.jwt;
 const refreshToken=req.cookies.rjwt


  try {
    if (token) {
    //  console.log('1s tken hit',refreshToken,'token',token);
      
      const decode = jwt.verify(token, process.env.JWT_SECRET)

      req.user = decode

      next()
    }
    else if(refreshToken  && (token===undefined || !token)  ){
//console.log('token expired but refresh is carried on','tk',);

try {

const decode= jwt.verify(refreshToken, process.env.JWT_SECRET)

  req.user=decode

  const user=req.user


  const newToken= jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  )
  
    const newRefreshToken=jwt.sign(
      {
        _id:user.id,email:user.email,role:user.role},
        
        process.env.JWT_SECRET,

      {
        expiresIn:'15d'
      }
    )
    
  
  
  
  res.cookie('jwt',newToken  , { httpOnly: true,sameSite: 'None', secure: true,  maxAge:86400000, path: '/',  });
  res.cookie('id', req.user._id, { httpOnly: true,sameSite: 'None', secure: true,  maxAge: 1296000000,path: '/',  }); 
  
  res.cookie('rjwt',newRefreshToken,{httpOnly:true, sameSite: 'None', secure: true,  maxAge: 1296000000,path:'/',})
  





 
  
  

  
  
  next()








}


catch (err){
 // console.log('error from token refresh req','token',token);

 // console.log('error from token refresh',err);
 res.status(500).send('internal server error')
  
}









  
     

    }
    
    
    
    else {
      
    //  console.log(req.headers.authorization,'headers')
   // console.log('error frm 1st authorization',err);
   
   return res.status(400).json({ message: 'unauthorized ' })
    }
  } catch (err) {
    
 
    //console.log('error frm 2nd authorization',err);
   // console.log(req.headers.authorization,'headers')
    return res.status(400).json({ message: 'unauthorized 2' })
  }
  return null
}



