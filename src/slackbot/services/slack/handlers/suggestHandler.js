const logger = require('../../../../utils/logger');

export default (text, res) => {
  logger.log('error', `There is a suggested comic: ${text}`)
  res.send('Thank you for your suggestion! We will try to add it! 🤘😁')
}
