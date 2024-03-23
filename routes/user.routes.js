import { Router } from 'express'
import {
  signUpEmailPassword,
  signUpMagicLink,
  completeSignup,
  Login,
  updateUser,
  myAccout,
  changePassWord,
  verifySignUpEmail,
  forgotPassWord,
  verifyPassWordResetMail,

  userLogOut,
  

} from '../controller/authentication.js'
import isLoggedIn from '../middleware/authentication.js'


const userRouter = Router()

userRouter.post('/', signUpEmailPassword)
userRouter.post('/signup-link', signUpMagicLink)
userRouter.post('/complete-signup', completeSignup)
userRouter.post('/login', Login)
userRouter.get('/verify-email/:token',verifySignUpEmail )
userRouter.post('/forgot-password-email',forgotPassWord )
userRouter.patch('/reset-password/:token',verifyPassWordResetMail)

userRouter.use(isLoggedIn)
userRouter.post('/log-out', userLogOut)
userRouter.get('/my-profile', myAccout)
userRouter.patch('/update-profile', updateUser)
userRouter.patch('/change-password', changePassWord)




export default userRouter
