import { Teams } from '../../repository/'
import logger from '../../../utils/'

export const postToChannelWithTeamId = async (channel_id, team_id) => {
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) throw `Team not found with ${team_id} and ${channel_id}`

  logger.log('info', `Checking for posts every ${process.env.CHECK_INTERVAL} and sending to ${team.team_name}-${team.incoming_webhook.channel}`)

  const subscriptions = team.subscriptions;
  const webhook = team.incoming_webhook.url
  const tempSubsscriptions = [...subscriptions];
  while(tempSubsscriptions.length != 0) {
    const subscription = tempSubs.pop();
    const entry = fetchLatestEntry(subscription)
    if(!entry) throw `Entry was null with subscription name ${subscription.name}`

    
  }
}

const fetchLatestEntry = (subscription) => {
    return await Entry.findOne({label:subscription.name}).sort('-date');
}
