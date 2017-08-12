import { Teams } from '../../repository'

import logger from '../../../utils/logger'
import { postEntryToSlackWithWebhook } from '../slack'
import { Entries } from '../../repository'
import moment from 'moment';

export const postToChannelWithTeamId = async (channel_id, team_id) => {
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) throw `Team not found with ${team_id} and ${channel_id}`

  logger.log('info', `Checking for posts every ${process.env.CHECK_INTERVAL} and sending to ${team.team_name}-${team.incoming_webhook.channel}`)

  const subscriptions = team.subscriptions;
  const webhook = team.incoming_webhook.url
  const tempSubsscriptions = [...subscriptions];

  let update = false;
  while(tempSubsscriptions.length != 0) {
    const subscription = tempSubsscriptions.pop();
    const entry = await fetchLatestEntry(subscription)
    if(!entry) throw `Entry was null with subscription name ${subscription.name}`

    if(!subscription.lastUrlPublished) {
      if (postEntryToSlackWithWebhook(entry, webhook, team)) {
        setSubscriptionData(subscription, entry)
        update = true
      }
    }
    if(subscription.lastUrlPublished !== entry.url) {
      const timeToPost = isTimeToPost(subscription)
      if(timeToPost) {
        if(postEntryToSlackWithWebhook(entry, webhook, team)) {
          setSubscriptionData(subscription, entry)
          update = true;
        } else {
          logger.log('info', `${subscription.name} failed to post, and did not save to mongoDB`)
        }
      }
    }

    if(update && tempSubsscriptions.length == 0) {
        var query = { team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id };
        try {
          const result = await Teams.update(query, { subscriptions: subscriptions })
          logger.log('info', `${team.team_name} updated it's subscriptions!`)
        } catch (e) {
          logger.log('error', `Something went wrong for ${team.team_name} when updating the subscriptions!`)
        }

    }
  }
}

const fetchLatestEntry = async (subscription) => {
    return await Entries.findOne({label:subscription.name}).sort('-date');
}

const setSubscriptionData = (subscription, entry) => {
  subscription.lastUrlPublished = entry.url;
  subscription.datePublished = moment().format('x')
}

const isTimeToPost = (subscription) => {
    const now = moment().tz(subscription.postTime.timeZone);
    const postTime = now.clone().hour(subscription.postTime.hour).minute(subscription.postTime.minute)
    const postInterval = postTime.clone().add(3, 'hour')
    const isBetween = now.isBetween(postTime, postInterval, null, '[]')
    logger.log('info', `${subscription.name} want to post. The time now is ${now} and postTime is ${postTime}. Is this within the intevall? ${isBetween} `)
    return isBetween
}
