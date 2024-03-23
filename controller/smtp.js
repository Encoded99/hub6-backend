import nodemailer from 'nodemailer'
import { config } from 'dotenv'



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port:process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,  
    pass: process.env.SMTP_PASS,  
  },
});


// smtp.js or mail.service.js
export const sendMail = async (options) => {
  try {
    console.log('Sending email:', options);
    await transporter.sendMail(options);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to ensure it's caught by the calling function
  }
};
