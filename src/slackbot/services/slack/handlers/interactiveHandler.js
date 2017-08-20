import { Teams } from '../../../repository'
import { enableAgendaForKnownTeam } from '../../agenda'

export default async (body, res) => {
  const text = body.original_message.text
  const channel_id = text.slice(text.indexOf('#')+1,text.indexOf('>'))
  const query = {team_id: body.team.id, "incoming_webhook.channel_id": channel_id }
  var team = await Teams.findOneAndUpdate(query, {active:true})
  subscriptionHandler(team, body, res)
}

const subscriptionHandler = async (team, body, res) => {
    const subscriptionAction = body.actions.find(action=> {
        return action.name === 'start';
    })
    if(subscriptionAction.value==='subscribe') {
        const enabled = await enableAgendaForKnownTeam(team.team_id, team.incoming_webhook.channel_id, res);
        if(enabled) {
          const returnObject = prepareReturnObject(body)
          res.json(returnObject)
        } else {
          res.status(500).send()
        }
    }
}

const prepareReturnObject = (body)=> {
  const fixedAttachments = [];
  fixedAttachments.push(body.original_message.attachments[0]);
  const responsePart = body.original_message.attachments[1]
  delete responsePart.actions;
  delete responsePart.callback_id;
  responsePart.text = "Enjoy!";
  fixedAttachments.push(responsePart)
  const sendObject = {
          text: body.original_message.text,
          attachments: fixedAttachments
      }
  return sendObject;
}
