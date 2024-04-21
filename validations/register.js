import Joi from 'joi'

// validate users info
export const registerValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    telephone: Joi.string().min(11).max(14).required(),
    role: Joi.string().optional(),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(1024).required(),
    address: Joi.object({
     
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
    }),
  })
  return schema.validate(data)
}
// validate login details info
export const LoginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    telephone:Joi.string(),
    password: Joi.string().min(8).max(1024).required(),
  })
  return schema.validate(data)
}

export const EmailValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
  })
  return schema.validate(data)
}
