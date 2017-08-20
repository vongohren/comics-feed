import interactiveHandlerImpl from './interactiveHandler'
import {
  findBasedOnTeamId,
  findBasedOnTeamIdAndUserId,
  deleteSubscriptionFromTeam } from './subscriptionConfigHandler'
import whoHandlerImpl from './whoHandler'
export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'start':
          interactiveHandlerImpl(body, res);
          break;
        case 'subscription':
          findBasedOnTeamIdAndUserId(body.team.id, body.actions[0].value, res)
          break;
        case 'delete-subscription':
          console.log(body)
          const value = JSON.parse(body.actions[0].value)
          const name = value.name
          const channel = value.channel

          console.log(JSON.parse(body.actions[0].value))
          deleteSubscriptionFromTeam(name, body.team.id, channel, res)
        default:

    }
}


export const subscriptionHandler = (body, res) => {
  findBasedOnTeamId(body.team_id, res)
}
export const whoHandler = (res) => {
  whoHandlerImpl(res)
}
