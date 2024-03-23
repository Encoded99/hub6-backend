import * as nodemailer from 'nodemailer';
import Exception from '../utils/exception.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

export default async function sendEmail(body) {
  try {
    const { from, email, subject, text, html, response = '' } = body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          logger.error({
            message: error.message,
            data: error,
            func: 'sendEmail',
            time: new Date(),
          });
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const result = await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });

    logger.log(result, 'response from mail');
    return response;
  } catch (error) {
    throw new Exception(error.message, error.status || 400)();
  }
}
