import logger from '../../../../utils/logger';

export default (body, res) => {
  const text = `Suggested comic: ${body.text} - From: ${body.user_name} at team: ${body.team_domain}. UserID for reply: ${body.user_id}`
  logger.log('error', `${text}`)
  res.send('Thank you for your suggestion! We will try to add it! 🤘😁')
}
