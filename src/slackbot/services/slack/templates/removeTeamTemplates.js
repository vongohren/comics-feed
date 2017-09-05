import { showDirectOrChannel } from '../../../utils'

export const getConfirmRemovalAttachment = (team, channel_id) => {
  const attachments = [];
  const channel_id_text = !team.directmessage ? `<#${channel_id}>` : showDirectOrChannel(team.incoming_webhook.channel)

  attachments.push(createYesNoCombo(channel_id, channel_id_text))
  if(team.active) {
    attachments.push(createPauseAttachment(team, channel_id))
  }
  return {
    "attachments": attachments
  }
}

const createYesNoCombo = (channel_id, channel_id_text) => {
  return {
    "title": `Do you want to delete the subscription from channel ${channel_id_text}? 😔`,
    "callback_id": "remove-subscription",
    "color":"#f70431",
    "attachment_type": "default",
    "actions": [
      {
        "name": "yes-remove-subscription",
        "text": "Yes",
        "type": "button",
        "style": "danger",
        "value": JSON.stringify({"remove": true, "channel":channel_id})
      },
      {
        "name": "remove-subscription",
        "text": "No",
        "type": "button",
        "style": "primary",
        "value": JSON.stringify({"remove": false, "channel":channel_id})
      }
    ]
  }
}

const createPauseAttachment = (team, channel_id) => {
  const toggle_value = team.active ? "off" : "on"
  return {
    "title": "You could just pause the subscription 😇",
    "color":"#2AB27B",
    "callback_id": "pause-subscription",
    "actions": [
      {
        "name": "pause-subscription",
        "text": "Pause",
        "type": "button",
        "style": "primary",
        "value": JSON.stringify({"toggle": toggle_value, "channel":channel_id})
      }
    ]
  }

}

export const getCheerForStaying = () => {
  return {
    "text":`*Thanks for letting me stay🎉* http://gph.is/XIptPy \n*You can interact with me anytime by visiting my commands again* \nMore info at https://comics.vongohren.me`
  }
}

export const getThankYouForHavingMeAttachment = () => {
  return {
    "text":`*Thanks for having me😊* http://gph.is/1sCFZ5B \n*If you ever regret the choice, visit* https://comics.vongohren.me`
  }
}
