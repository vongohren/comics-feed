const comics = require('../../../../comics');
import { showDirectOrChannel } from '../../../utils'
export {
  getConfirmRemovalAttachment,
  getThankYouForHavingMeAttachment,
  getCheerForStaying
} from './removeTeamTemplates'

export const getNoSubscriptionAttachment = () => {
  return {
    "text": "There are no subscriptions😊 If you want one visit https://comics.vongohren.me",
    "color":"#DE9E31"
  }
}


export const getListOfAllAvailableComics = () => {
  const comicFields = mapComicsToFieldValues()
  return {
    "title":"All available comics",
    "fields": comicFields,
  }
}

const mapComicsToFieldValues = () => {
  return comics.available.map(comic=> {
      return {title: uppercaseFirst(comic.name), value: comic.tegneserieSideLink}
  })
}

export const getTeamsAttachment = (teams) => {
  const teamsAttachment = mapTeamsToAttachmentsWithButtons(teams)
  const partialText = teams.length < 2 ? "a subscription" : "multiple subscriptions"
  return {
    "text": `Found ${partialText} on this team`,
    "color":"#DE9E31",
    "attachments": [
      ...teamsAttachment
    ]

  }
}

const mapTeamsToAttachmentsWithButtons = (teams) => {
  return teams.map(team=> {
      return {
        "title": `Channel - ${team.incoming_webhook.channel}`,
        "text": `Controlled by <@${team.user_id}>`,
        "attachment_type": "default",
        "callback_id": "subscription",
        "actions": [
          {
              "name": "team",
              "text": "Choose",
              "type": "button",
              "value": team.incoming_webhook.channel_id
          },
        ]
      }
  })
}

export const getSubscriptionsAttachment = (team) => {
  const subscriptionAttachment = mapSubscriptionsToAttachmentsWithButtons(team)
  const channel_id = team.incoming_webhook.channel_id
  const channel_id_text = !team.directmessage ? `<#${channel_id}>` : showDirectOrChannel(team.incoming_webhook.channel)
  return {
    "text": `Here are the current posting comics for channel: ${channel_id_text}`,
    "color":"#36A64F",
    "attachments": [
      ...subscriptionAttachment,
      createSelectSubscription(team),
      createPauseSubscription(team)
    ]
  }
}

const mapSubscriptionsToAttachmentsWithButtons = (team) => {
  return team.subscriptions.map(subscription=> {
      return {
        "title": subscription.name.upperCaseFirstLetter(),
        "attachment_type": "default",
        "callback_id": "delete-subscription",
        "actions": [
          {
              "name": "subscription",
              "text": "X",
              "type": "button",
              "style": "danger",
              "value": JSON.stringify({"name": subscription.name, "channel":team.incoming_webhook.channel_id})
          }
        ]
      }
  })
}

const createSelectSubscription = (team) => {
  return {
    "title": "Wanna add some subscriptions",
    "callback_id": "add-subscription",
    "actions": [
      {
        "name": "subscription_list",
        "text": "Pick a subscription",
        "type": "select",
        "options": mapOutOptions(comics.available, team)
      }
    ]
  }
}

const createPauseSubscription = (team) => {
  const title = team.active ? "Want to pause the entire subscription" : "Want to active the entire subscription again"
  const style = team.active ? "danger" : "primary"
  const button_text = team.active ? "Pause" : "Start"
  const toggle_value = team.active ? "off" : "on"
  return {
    "title": title,
    "callback_id": "pause-subscription",
    "actions": [
      {
        "name": "pause-subscription",
        "text": button_text,
        "type": "button",
        "style": style,
        "value": JSON.stringify({"toggle": toggle_value, "channel":team.incoming_webhook.channel_id})
      },
      {
        "name": "remove-subscription",
        "text": "Delete",
        "type": "button",
        "style": "danger",
        "value": JSON.stringify({"channel":team.incoming_webhook.channel_id})
      }
    ]
  }
}

const mapOutOptions = (comics, team) => {
  return filterOutExistingComics(comics, team).map(comic => {
    return {
      "text": comic.name.upperCaseFirstLetter(),
      "value": JSON.stringify({"name": comic.name, "channel":team.incoming_webhook.channel_id})
    }
  })
}

const filterOutExistingComics = (comics, team) => {
  return comics.filter(comic => {
    const keep = true;
    const matches = team.subscriptions.filter(entry => {
      return entry.name === comic.name
    })
    return matches.length < 1
  })
}
