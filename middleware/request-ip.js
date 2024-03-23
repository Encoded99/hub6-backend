import * as publicIp from 'public-ip'
import iplocate from 'node-iplocate'
import Exception from '../utils/exception.js'

const RequestIp = async (req, res, next) => {
  try {
    const ipAddress = await publicIp.publicIpv4()
    const results = await iplocate(ipAddress, {
      apikey: process.env.IP_API_KEY,
    })
    req.ip_info = results
    next()
  } catch (err) {
    next(new Exception(err.message, 400))
  }
}

export default RequestIp
