import { Teams } from '../../../../repository'
const mongoose = require('mongoose');
const got = require('got');
import ThankYou from './thank-you-modal.json'


const Actions = mongoose.model('actions', {
    user: {
      id: String,
      username: String,
      name: String,
      team_id: String
    },
    team: {
      id: String,
      domain: String
    },
    type: String,
    value: String
});

export default async (body, res) => {
  const actions = body.actions.map(action => {
    return {
      user: body.user,
      team: body.team,
      type: action.block_id,
      value: action.value
    }
  })
  try {
    await Actions.insertMany(actions);
    const query = {team_id: body.team.id}

    const team = await Teams.findOne(query)
    const ok = await got.post('https://slack.com/api/views.open', {
      json: {
        trigger_id: body.trigger_id ,
        view: ThankYou
      },
      headers: {Authorization: `Bearer ${team.bot.bot_access_token}`},
      responseType: 'json'
    });
    res.status(200).send();
  } catch (error) {
    console.log(error)
    res.status(500).send();
  } 
}
