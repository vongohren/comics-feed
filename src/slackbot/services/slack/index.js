const IncomingWebhook = require('@slack/client').IncomingWebhook;
import { Webhook } from './slack'
import logger from '../../../utils/logger'

const comics = require('../../../comics');

export const postEntryToSlackWithWebhook = async (entry, webhook, team) => {
  try {
    const hook = new Webhook(webhook);
    const comicAttachment = createAttachments(entry);
    if(entry.label === 'xkcd') {
      comicAttachment.push(createXkcdAttachement(entry))
    }
    await hook.send(comicAttachment);
    logger.log('info',`Successfully posted: ${entry.url} to ${team.team_name}-${team.incoming_webhook.channel}`);
    return true;
  } catch (error) {
    logger.log('error', error);
    return false;
  }

}

const createAttachments = (entry) => {
  const comic = comics.available.find(comic=> {
    return comic.name === entry.label
  })

  const name = uppercaseFirst(comic.name)
  return [
          {
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
      ]
}

const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const createXkcdAttachement = (entry) => {
  return {
    "color": "#36a64f",
    "title":"The explanation can be found here",
    "title_link": entry.metadata.explanationUrl
  }
}
