import interactiveHandlerImpl from './interactiveHandler'
import {
  findBasedOnTeamId,
  findBasedOnTeamIdAndUserId,
  deleteSubscriptionFromTeam,
  addSubscriptionFromTeam,
  pauseSubscriptionFromTeam
} from './subscriptionConfigHandler'
import whoHandlerImpl from './whoHandler'

export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'start':
          interactiveHandlerImpl(body, res);
          break;
        case 'subscription':
          findBasedOnTeamIdAndUserId(body.team.id, body.actions[0].value, body.user, res)
          break;
        case 'delete-subscription':
          const value = JSON.parse(body.actions[0].value)
          const name = value.name
          const channel = value.channel
          deleteSubscriptionFromTeam(name, body.team.id, channel, res)
          break;
        case 'add-subscription':
          const addValue = JSON.parse(body.actions[0].selected_options[0].value)
          const addName = addValue.name
          const addChannel = addValue.channel
          addSubscriptionFromTeam(addName, body.team.id, addChannel, res)
          break;
        case 'pause-subscription':
          const pauseValue = JSON.parse(body.actions[0].value)
          const toggle = pauseValue.toggle
          const pauseChannel = pauseValue.channel
          pauseSubscriptionFromTeam(toggle, body.team.id, pauseChannel, res)
          break;
        default:

    }
}

export const subscriptionHandler = (body, res) => {
  findBasedOnTeamId(body.team_id, res)
}
export const whoHandler = (res) => {
  whoHandlerImpl(res)
}
