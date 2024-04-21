import { Router } from 'express'
import {
  fetchProducts,
  verifiedAdminProducts,
  fetchSeller,
  updateProductStatus,
  adminDeleteProduct,
} from '../controller/product.controller.js'
import {
  findOne,
  findAll,
  searchUser,
  deleteUser,
} from '../controller/authentication.js'

import {
  deleteFeedBack,getAllFeedBack
  
 } from '../controller/feedback.controller.js'
import isLoggedIn from '../middleware/authentication.js'

const admin = Router()
admin.use(isLoggedIn)
admin.get('/users', findAll)
admin.get('/products', fetchProducts)
admin.get('/verified',verifiedAdminProducts)
admin.get('/users/search', searchUser)
admin.get('/products/sellers', fetchSeller)
admin.get('/users/:id', findOne)
admin.patch('/products/:id/status', updateProductStatus)
admin.delete('/products/:id', adminDeleteProduct)
admin.delete('/users/:id', deleteUser)
admin.get('/feedbacks',getAllFeedBack)
admin.delete('/feedbacks/:id', deleteFeedBack)
export default admin

// ✅ Instead, do this
const tryCatchFn = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next)
}
