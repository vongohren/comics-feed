const comics = require('../../../../comics');
import { showDirectOrChannel } from '../../../utils'
export {
  getConfirmRemovalAttachment,
  getThankYouForHavingMeAttachment,
  getCheerForStaying
} from './removeTeamTemplates'

export * from './agendaActionTemplates'

export const getNoSubscriptionAttachment = () => {
  return {
    "text": "*There are no subscriptions 😊* \n*Want to add one, visit* https://comics.vongohren.me"
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
    "text": `🔎*Found ${partialText} on this team*🔎`,
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
        "color": "#2AB27B",
        "callback_id": "subscription",
        "actions": [
          {
              "name": "team",
              "text": "Select",
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
  const attachments = selectRightOrderForAttachments(team, subscriptionAttachment)
  const textBasedOnActive = team.active ? getActiveText(channel_id_text) : getInactiveText(channel_id_text)
  return {
    "text": textBasedOnActive,
    "attachments": attachments
  }
}

const getInactiveText = (channel_id_text) => {
  return `*😔 You have paused the subscription for:* ${channel_id_text}. *But could start it again with 👇*`
}

const getActiveText = (channel_id_text) => {
  return `*✨Here are the current comics beeing posted for channel:* ${channel_id_text}✨`
}

const selectRightOrderForAttachments = (team, subscriptionAttachment) => {
  if(!team.active) {
    return [
      createPauseSubscription(team),
      ...subscriptionAttachment,
      createSelectSubscription(team)
    ]
  } else {
    return [
      ...subscriptionAttachment,
      createSelectSubscription(team),
      createPauseSubscription(team)
    ]
  }
}

const mapSubscriptionsToAttachmentsWithButtons = (team) => {
  return team.subscriptions.map(subscription=> {
    const matchingComic = comics.available.find(comic => {
      return comic.name === subscription.name
    })
    return {
      "title": `${subscription.name.upperCaseFirstLetter()} - (${matchingComic.language.upperCaseFirstLetter()})`,
      "attachment_type": "default",
      "color": "#2AB27B",
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
  const selectableComics = mapOutOptions(comics.available, team)
  if(selectableComics.length < 1) {
    return {
      "title": "🎊There are no more comics to choose from, suggest one with /suggest 🎊",
      "color": "#2AB27B",
    }
  }
  return {
    "title": "Wanna add some subscriptions",
    "callback_id": "add-subscription",
    "color": "#2AB27B",
    "actions": [
      {
        "name": "subscription_list",
        "text": "Pick a subscription",
        "type": "select",
        "options": selectableComics
      }
    ]
  }
}

const createPauseSubscription = (team) => {
  const title = team.active ? "Want to pause the entire subscription?" : "Activate the entire subscription again?"
  const style = team.active ? "danger" : "primary"
  const color = team.active ? "#f70431" : "#2AB27B"
  const button_text = team.active ? "Pause" : "Start"
  const toggle_value = team.active ? "off" : "on"
  return {
    "title": title,
    "color": color,
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
      },
      {
        "name": "cancel",
        "text": "Done",
        "type": "button",
        "style": "primary",
        "value": JSON.stringify({"channel":team.incoming_webhook.channel_id})
      }
    ]
  }
}

const mapOutOptions = (comics, team) => {
  return filterOutExistingComics(comics, team).map(comic => {
    return {
      "text": `${comic.name.upperCaseFirstLetter()} - (${comic.language.upperCaseFirstLetter()})`,
      "value": JSON.stringify({"name": comic.name, "channel":team.incoming_webhook.channel_id})
    }
  })
}

const filterOutExistingComics = (comics, team) => {
  return comics.filter(comic => {
    const matches = team.subscriptions.filter(entry => {
      return entry.name === comic.name
    })
    return matches.length < 1
  })
}
