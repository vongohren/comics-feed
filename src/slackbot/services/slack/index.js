const IncomingWebhook = require('@slack/client').IncomingWebhook;
import { Webhook } from './slack'
import logger from '../../../utils/logger'
import { Teams } from '../../repository'

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
  } catch (errObj) {
    logger.log('error', `Following error happend with team ${team.team_name}-${team.incoming_webhook.channel}`)
    if(errObj.statusCode == 404){
      await addStrikeToTeam(team);
    }
    logger.log('error', errObj.error);
    return false;
  }

}

const addStrikeToTeam = async (team) => {
  var query = { team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id };
  const result = await Teams.update(query, { strike: team.strike+1 })
  logger.log('error', `${team.team_name} got a strike!`)
}

const createAttachment = (entry) => {
  const comic = comics.available.find(comic=> {
    return comic.name === entry.label
  })

  const name = uppercaseFirst(comic.name)
  return {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `*Dagens ${name}*\n\nProdusert av <${comic.authorUrl || comic.stripUrl}|${comic.author || comic.itemDescription}>\n\n:pencil2::pencil2::pencil2::pencil2::pencil2::pencil2::pencil2::pencil2::pencil2:`
          },
          "accessory": {
            "type": "image",
            "image_url": `${comic.slackPlaceHolder || 'http:'+comic.tegneserieLogo }`,
            "alt_text": `${name} picture`
          }
        },
        {
          "type": "image",
          "image_url": entry.url,
          "alt_text": "the cartoon"
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `*Levert av*  :email:  <${comic.mediatorUrl || comic.stripUrl}|${comic.mediator || name}>`
            },
            {
              "type": "image",
              "image_url": comic.mediatorLogo || 'http:'+comic.tegneserieLogo,
              "alt_text": `${comic.mediator || name} logo`
            }
          ]
        }
      ]
  }
  
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
