import { showDirectOrChannel } from '../../../utils'

export const getConfirmRemovalAttachment = (team, channel_id) => {
  const attachments = [];

  attachments.push(createYesNoCombo(channel_id))
  if(team.active) {
    attachments.push(createPauseAttachment(team, channel_id))
  }
  const channel_id_text = !team.directmessage ? `<#${channel_id}>` : showDirectOrChannel(team.incoming_webhook.channel)

  return {
    "text": `You are now about to delete the subscription from: ${channel_id_text}`,
    "color":"#36A64F",
    "attachments": attachments
  }
}

const createYesNoCombo = (channel_id) => {
  return {
    "title": `Are you sure you want to?`,
    "callback_id": "remove-subscription",
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
    "title": "You could just pause the subscription",
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
    "text": "Thanks for letting me stay🎉 \n You can interact with me anytime by visiting my commands again",
    "color":"#DE9E31",
  }
}

export const getThankYouForHavingMeAttachment = () => {
  return {
    "text": "Thanks for having me😊 If you ever regret, visit https://comics.vongohren.me",
    "color":"#DE9E31",
  }
}
