import path from 'path'
import multer from 'multer'
import uid from 'rand-token'

const storage = multer.diskStorage({
  destination(request, file, cb) {
    cb(null, path.resolve('uploads'))
  },
  filename(req, file, cb) {
    const token = uid(4)
    const fileName = file.originalname.split('.')
    const ext = fileName[fileName.length - 1]
    const filename = `prefix_${token}_${Date.now()}.${ext}`
    cb(null, filename)
  },
})
const upload = multer({
  storage,
})

export default upload
