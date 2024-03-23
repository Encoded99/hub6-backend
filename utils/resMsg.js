const Msg = (
  res,
  data,
  message = 'request successful',
  statusCode = 200,
  status = 'success'
) => {
  res.status(statusCode).json({
    status,
    statusCode,
    message,
    data,
  })
}

export default Msg
