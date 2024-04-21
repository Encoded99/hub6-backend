import Exception from '../utils/exception.js'
import Msg from '../utils/resMsg.js'

export default function HomePage(req, res, next) {
  try {
    const location = req?.ip_info?.country ?? 'Unknown location'
    Msg(res, { data: `You are browsing from ${location}` }, 'homepage')
  } catch (error) {
    next(new Exception(error.message, error.status))
  }
}
