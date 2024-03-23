import AWS from 'aws-sdk'
// import sharp from 'sharp'
import Image from 'image-js'
import fs from 'fs'
import path from 'path'
import Exception from '../utils/exception.js'

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESSKEY_ID,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: 'v4',
})

const uploadFileToCloud = async (fileData) => {
  try {
    const fileContent = fs.readFileSync(
      path.resolve(`uploads/${fileData.filename}`)
    )
    if (
      fileData.mimetype === 'image/jpeg' ||
      fileData.mimetype === 'image/jpg' ||
      fileData.mimetype === 'image/png'
    ) {
      // await sharp(fileContent)
      // 	.resize(500)
      // 	// .webp({ quality: 20 })
      // 	.toFile(path.resolve(`src/uploads/${fileData.filename}`))

      const image = await Image.load(fileContent)
      const img = image.resize({ width: 400 }) // resize the image, forcing a width of 200 pixels. The height is computed automatically to preserve the aspect ratio.

      await img.save(`uploads/${fileData.filename}`)

      const Content = fs.readFileSync(
        path.resolve(`uploads/${fileData.filename}`)
      )
      const params = {
        Bucket: process.env.BUCKET_NAME || '',
        Key: fileData.filename,
        Body: Content,
        ContentType: fileData.type,
      }
      s3.upload(params, (err) => {
        console.log(err)
      })
    } else {
      const params = {
        Bucket: process.env.BUCKET_NAME || '',
        Key: fileData.filename,
        Body: fileContent,
        ContentType: fileData.type,
      }
      s3.upload(params, (err) => {
        console.log(err)
      })
      // fs.unlinkSync(path.resolve(`uploads/${fileData.filename}`))
    }
  } catch (error) {
    // fs.unlinkSync(path.resolve(`uploads/${fileData.filename}`))
    throw new Exception(error, 500)
  }
}

export default uploadFileToCloud
