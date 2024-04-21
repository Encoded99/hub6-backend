import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const Schema = new mongoose.Schema({


  name: {
    type: String,
    required: false,
    lower: true,
  },

  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lower: true,
  },
 
  subject: {
   type: String,
   required: [true, 'Subject is required'],
   lower: true,
   minlength:[3,'Subject can not be less than three characters long'],
   maxlength:[30,'Subject can not be more than thirty characters long '],

   
 },

 message: {
  type: String,
  required: [true, 'Message is required'],
  minlength:[3,'Subject can not be less than three characters long'],
   maxlength:[150,'Subject can not be more than one fifty characters long'],

},

createdAt: {
 type: Date,
 default: new Date(),
},
 
 
})


const Feedback = mongoose.model('feedback', Schema)

export default Feedback
