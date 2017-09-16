import interactiveHandlerImpl from './interactiveHandler'
import {
  findBasedOnTeamId,
  findBasedOnTeamIdAndUserId,
  deleteSubscriptionFromTeam,
  addSubscriptionFromTeam,
  pauseSubscriptionFromTeam,
  deleteTeamSubscription,
  cheerForStaying
} from './subscriptionConfigHandler'
export whoHandler from './whoHandler'
export suggestHandler from './suggestHandler'
export supportHandler from './supportHandler'

export const interactiveHandler = (body, res) => {
  let action = {}
  if(body.actions) action = body.actions[0]

  switch (body.callback_id) {
      case 'start':
        const startValue = JSON.parse(action.value)
        interactiveHandlerImpl(body, startValue.channel, res);
        break;
      case 'subscription':
        findBasedOnTeamIdAndUserId(body.team.id, action.value, body.user, res)
        break;
      case 'delete-subscription':
        const value = JSON.parse(action.value)
        const name = value.name
        const channel = value.channel
        deleteSubscriptionFromTeam(name, body.team.id, channel, res)
        break;
      case 'add-subscription':
        const addValue = JSON.parse(action.selected_options[0].value)
        const addName = addValue.name
        const addChannel = addValue.channel
        addSubscriptionFromTeam(addName, body.team.id, addChannel, res)
        break;
      case 'pause-subscription':
        const pauseValue = JSON.parse(action.value)
        const toggle = pauseValue.toggle
        const pauseChannel = pauseValue.channel
        if(action.name === 'remove-subscription') {
          deleteTeamSubscription(body.team.id, pauseChannel, res)
        } else if(action.name === 'pause-subscription') {
          pauseSubscriptionFromTeam(toggle, body.team.id, pauseChannel, res)
        } else {
          res.json({"text": "🤙"})
        }
        break;
      case 'remove-subscription':
        const removeValue = JSON.parse(action.value)
        const removeChannel = removeValue.channel
        if(removeValue.remove) {
          deleteTeamSubscription(body.team.id, removeChannel, res, true)
        } else {
          cheerForStaying(res)
        }

      default:

  }
}

export const subscriptionHandler = (body, res) => {
  findBasedOnTeamId(body.team_id, res)
}
