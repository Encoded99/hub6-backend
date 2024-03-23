import { Router } from 'express'
import {
  addProduct,
  fetchProducts,
  findProduct,
  searchProducts,
  updateProduct,
  fetchVerifiedProducts,
  updateProductStatus,
  addProductReview,
  generateAndSendInvoice,
  userDeleteProduct,getAllReview
} from '../controller/buyer-product.controller.js'
import isLoggedIn from '../middleware/authentication.js'

const bpRouter = Router()
bpRouter.post('/', isLoggedIn, addProduct)
bpRouter.get('/verified', fetchVerifiedProducts)
bpRouter.get('/search', searchProducts)
bpRouter.get('/invoice', generateAndSendInvoice)
bpRouter.get('/:id', findProduct)

bpRouter.use(isLoggedIn)
bpRouter.patch('/:id', updateProduct)
bpRouter.patch('/:id/status', updateProductStatus)
bpRouter.patch('/:id/add-review', addProductReview)
bpRouter.delete('/:id', userDeleteProduct)

bpRouter.get('/verified/rev', getAllReview)

export default bpRouter
