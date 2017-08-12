import { Teams } from '../../repository/'
import Agenda from './agenda'
import { postToChannelWithTeamId } from '../posting'
const logger = require('../../../utils/logger');

export const initAgendaForAllTeams = async () => {
  const teams = await Teams.find({})
  if(teams.length < 1) {
    logger.log('info', 'No teams to init agenda posting for')
  }
  else {
    teams.forEach(function(team) {
      if(team.active) {
        Agenda.initAgendaForTeam(team, postToChannelWithTeamId)
        logger.log('info', `Server just started, so trying to post to ${team.team_name} in channel ${team.incoming_webhook.channel}`)
        postToChannelWithTeamId(team.incoming_webhook.channel_id, team.team_id)
      }
    });
  }
}

export const enableAgendaForKnownTeam = async (team_id, channel_id) => {
  try {
    const awaited = await Agenda.enableAgendaForTeam(channel_id, team_id, postToChannelWithTeamId)
    return true
  } catch (e) {
    logger.log('error', `Error enabling agenda from interactive handler for team ${team_id} and channel ${channel_id}`)
    return false
  }
}

export const toggleAgendaForTeam = async (req, res) => {
  if(req.body.text === 'on') enableAgendaForTeam(req,res)
  else if(req.body.text === 'off') disableAgendaForTeam(req,res)
  else res.send('Have to use with on or off')
}

const disableAgendaForTeam = async (req, res) => {
  const team_id = req.body.team_id
  const channel_id = req.body.channel_id
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) {
    res.status(200)
    const wording = req.body.channel_name === 'directmessage' ? 'direct message' : 'channel'
    res.send(`Doesn't seem that this ${wording} has a subscription`)
  } else {
    try {
      const numberDisabled = await Agenda.disableAgendaForTeam(req.body)
      res.status(200)
      res.send(`Disabled ${numberDisabled} subscription. If you want to enable again, use /start command from specific channel`)
    } catch(e) {
      res.send({
        'response_type': 'ephemeral',
        'text': `Sorry, could not disable. Please try again.`
      })
    }
  }
}

const enableAgendaForTeam = async (req, res) => {
  const team_id = req.body.team_id
  const channel_id = req.body.channel_id
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) {
    res.status(200)
    const wording = req.body.channel_name === 'directmessage' ? 'direct message' : 'channel'
    res.send(`Doesn't seem that this ${wording} has any disabled subscriptions`)
  } else {
    try {
      await Agenda.enableAgendaForTeam(channel_id, team_id, postToChannelWithTeamId)
      res.status(200)
      res.send(`Enabled subscription.`)
    } catch (e) {
      res.send({
        'response_type': 'ephemeral',
        'text': `Sorry, could not enable. Please try again.`
      })
    }
  }
}
