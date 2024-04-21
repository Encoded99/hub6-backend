import { Router } from 'express'
import {
 addFeedBack
 
} from '../controller/feedback.controller.js'
import router from './index.js'

const fRouter=Router()



fRouter.post('/',addFeedBack)


 export default fRouter
