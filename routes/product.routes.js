import { Router } from 'express';
import cors from 'cors'
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
  userDeleteProduct,
 addViews,
 addContactViews,
 userFetchUnverifiedProducts,
 uploadCloudinary,
 fetchCategory,
 
} from '../controller/product.controller.js'
import isLoggedIn from '../middleware/authentication.js'
import { uploadMiddleWare } from '../middleware/upload.js';



const pRouter = Router()
pRouter.post('/', isLoggedIn, addProduct)
pRouter.post('/upload-cloudinary',isLoggedIn,uploadMiddleWare,uploadCloudinary)
pRouter.get('/unverified',isLoggedIn,userFetchUnverifiedProducts)
pRouter.get('/fetch-category', fetchCategory)
pRouter.get('/verified', fetchVerifiedProducts)
pRouter.get('/search', searchProducts)
pRouter.get('/invoice', generateAndSendInvoice)
pRouter.get('/:id', findProduct)
pRouter.patch('/views/:id',addViews)
pRouter.patch('/contact-views/:id',addContactViews)



pRouter.use(isLoggedIn)
pRouter.patch('/:id', updateProduct)
pRouter.patch('/:id/status', updateProductStatus)
pRouter.patch('/:id/add-review', addProductReview)
pRouter.delete('/:id', userDeleteProduct)


export default pRouter
