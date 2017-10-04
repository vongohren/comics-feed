const IncomingWebhook = require('@slack/client').IncomingWebhook;
import { Webhook } from './slack'
import logger from '../../../utils/logger'

const comics = require('../../../comics');

export const postEntryToSlackWithWebhook = async (entry, webhook, team) => {
  try {
    const hook = new Webhook(webhook);
    const comicAttachment = createAttachment(entry);
    if(entry.label === 'xkcd') {
      comicAttachment.text = `Explanation: ${entry.metadata.explanationUrl}`
      comicAttachment.fields = [
        {
          title: entry.metadata.xkcdTitle,
          short: false
        }
      ]
    }
    const hookAttachments = [comicAttachment];
    await hook.send(hookAttachments);
    logger.log('info',`Successfully posted: ${entry.url} to ${team.team_name}-${team.incoming_webhook.channel}`);
    return true;
  } catch (error) {
    logger.log('error', `Following error happend with team ${team.team_name}-${team.incoming_webhook.channel}`)
    logger.log('error', error);
    return false;
  }

}

const createAttachment = (entry) => {
  const comic = comics.available.find(comic=> {
    return comic.name === entry.label
  })

  const name = uppercaseFirst(comic.name)
  return {
              "fallback": entry.url,
              "color": "#36a64f",
              "author_name": name,
              "author_link": comic.tegneserieSideLink,
              "author_icon": 'http:'+comic.tegneserieLogo,
              "title": `Dagens ${name}`,
              "title_link": comic.stripUrl,
              "image_url": entry.url,
              "footer": comic.mediator || '',
              "footer_icon": comic.mediatorLogo || ''
          }
}

const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
