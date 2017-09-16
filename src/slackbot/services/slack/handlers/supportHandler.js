const logger = require('../../../../utils/logger');

export default (body, res) => {
  const text = `Support messge: ${body.text} - From: ${body.user_name} at team: ${body.team_domain}. UserID for reply: ${body.user_id}`
  logger.log('error', `${text}`)
  res.send('Thank you for your supportmessage! We will get in touch with you! 🤘😁')
}
