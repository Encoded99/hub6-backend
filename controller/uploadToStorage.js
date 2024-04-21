import fs from 'fs'
import path from 'path'
import Exception from '../utils/exception.js'
import uploadQueue from '../utils/queue.js'
import Msg from '../utils/resMsg.js'

const UploadToStorage = async (req, res, next) => {
  const fileData = req.files
  try {
    await uploadQueue.add('upload', fileData, {
      removeOnFail: true,
      removeOnComplete: true,
      timeout: 30000,
    })
    const urls = fileData.map((file) => {
      const url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file.filename}`
      return url
    })

    Msg('media upload was successful', { data: urls }, res)
  } catch (error) {
    next(new Exception(error.message, error.status || 422))
  } finally {
    setTimeout(() => {
      fileData?.forEach((file) => {
        fs.unlinkSync(path.resolve(`uploads/${file.filename}`))
      })
    }, 20000)
  }
}
export default UploadToStorage
