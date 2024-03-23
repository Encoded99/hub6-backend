import Joi from 'joi'

const Image = Joi.object().keys({
  url: Joi.string().required(),
  type: Joi.string().required(),
  cloudId: Joi.string().required(),
  
})

const validateProduct = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    image: Joi.array().items(Image),
  // sku: Joi.number(),
    amount: Joi.number().required(),
    discount: Joi.number().optional(),
    tags: Joi.array().required(),
  })
  return Schema.validate(data)
}
export default validateProduct
