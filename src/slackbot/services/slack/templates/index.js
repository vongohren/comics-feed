const comics = require('../../../../comics');
require('../../../utils/stringPrototype')

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
  return {
    "text": "Found multiple subscriptions on this team",
    "color":"#DE9E31",
    "attachments": [
      ...teamsAttachment
    ]

  }
}

const mapTeamsToAttachmentsWithButtons = (teams) => {
  return teams.map(team=> {
      return {
        "title": team.incoming_webhook.channel,
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
  return {
    "text": "Found multiple subscriptions on this team",
    "color":"#36A64F",
    "attachments": [
      ...subscriptionAttachment,
      createSelectSubscription(team)
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
