const IncomingWebhook = require('@slack/client').IncomingWebhook;
import { Webhook } from './slack'
import logger from '../../../utils/logger'
import { Teams } from '../../repository'

const comics = require('../../../comics');

const STRIKE_THRESHOLD = 3;

export const postEntryToSlackWithWebhook = async (entry, webhook, team) => {
  try {
    const hook = new Webhook(webhook);
    const comicAttachment = createAttachment(entry);
    const hookAttachments = [comicAttachment];
    await hook.send(hookAttachments);
    logger.log('info',`Successfully posted: ${entry.url} to ${team.team_name}-${team.incoming_webhook.channel}, with attachment: ${JSON.stringify(hookAttachments)}`);
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
  const newStrikeCount = team.strike + 1;
  const query = { team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id };
  
  const updateData = { strike: newStrikeCount };
  if (newStrikeCount > STRIKE_THRESHOLD) {
    updateData.active = false;
    logger.log('error', `${team.team_name} exceeded strike threshold (${newStrikeCount}), disabling team`);
  } else {
    logger.log('error', `${team.team_name} got strike ${newStrikeCount}/${STRIKE_THRESHOLD}`);
  }
  
  await Teams.update(query, updateData);
}

const createAttachment = (entry) => {
  const comic = comics.available.find(comic=> {
    return comic.name === entry.label
  })

  const xkcdAddition = entry.label === 'xkcd' ?
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Explanation: ${entry.metadata.explanationUrl} \n *${entry.metadata.xkcdTitle}*`
    }
  } : null;

  const larsonsGaleVerdenAddittion = entry.label === 'larsonsgaleverden' ?
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Statement to picture: *${entry.metadata.sentence}* `
    }
  } : null;

  const name = uppercaseFirst(comic.name)
  const intro =         {
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
  }

  const image = {
    "type": "image",
    "image_url": entry.url,
    "alt_text": "the cartoon"
  }

  const context = 
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

  const blocks = [intro, image,context];
  const xkcdBlocks = [intro,xkcdAddition, image,context];
  const larsonsGaleVerdenBlocks = [intro,larsonsGaleVerdenAddittion, image,context];
  if(larsonsGaleVerdenAddittion) {
    return {
      "blocks": larsonsGaleVerdenBlocks
    }
  }
  if(xkcdAddition) {
    return {
      "blocks": xkcdBlocks
    }
  }
  else {
    return {
      "blocks": blocks
    }
  }
}

const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
