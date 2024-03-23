export default class Exception extends Error {
  constructor(message, status) {
    super()
    this.message = message
    this.status = status
  }
}
