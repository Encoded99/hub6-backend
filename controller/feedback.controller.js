import slugify from 'slugify'
import User from '../database/models/users.js'
import Exception from '../utils/exception.js'
import Feedback from '../database/models/feedback.js'

import Msg from '../utils/resMsg.js'


import generateInvoice from '../utils/pdf-generator.js';


export const addFeedBack= async(req,res,next)=>{

 const {name,email,subject,message}=req.body
if(!subject || !message || !email){
 res.status(404).send('subject or email or message can not be empty')
}

 try{

  const task= await Feedback.create({name,email,subject,message})

  res.status(200).send({success:true,data:task, message:'review posted'})

 }

 catch(error){
  console.log(error);
 }
}



export const deleteFeedBack= async(req,res,next)=>{

  const {id}=req.params

  

 try{

  const task= await Feedback.findOne({_id:id})

  if(!task){
   res.status(404).send('revie doesnt exist')
  }
const deleteTask= await Feedback.deleteOne({_id:id})

if (deleteTask.deletedCount===1){
 res.status(200).send('review deleted')
}
else{
 res.status(500).send('error deleting review')

}
 }

 catch(error){
  console.log(error);
 }
}


export const getAllFeedBack= async(req,res,next)=>{

  console.log('get all feedback gotten',);
  console.log('get all feedback gotten',req.query.page);

  const {page}=req.query
  const limitNo=5;
  const skipNo=(page-1)*5

 try {

  if (req.user.role !== 'admin') {
   throw new Exception(
     "you don't have the privilege to perform the action",
     400
   )
 }




  const feedbackList = await Feedback.find({});

 
  Msg(res, { data: feedbackList})
  
} catch (error) {
  console.log(error);
return  res.status(500).json({ success: false, message: 'Error fetching reviews' });
}

}









