const mongoose = require('mongoose');
const got = require('got');

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
    const result = await Actions.insertMany(actions);
    // const team_mates = await Actions.find().where({type: })
    // console.log(result)
    // const ok = await got.post(body.response_url, {
    //   json: {
    //     text: "Thanks for your message",
    //     response_type: "ephemeral"
    //   },
    //   responseType: 'json'
    // });
    // console.log(ok);
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  } 
}
