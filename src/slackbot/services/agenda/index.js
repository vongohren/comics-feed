import { Teams } from '../../repository/'
import Agenda from './agenda'
import { postToChannelWithTeamId } from '../posting'
import logger from '../../../utils/logger';
import { getSubscriptionEnabled, getSubscriptionDisabled } from '../slack/templates'

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

export const toggleAgendaForTeam = async (toggle, team_id, channel_id, res) => {
  if(toggle === 'on') enableAgendaForTeam(team_id, channel_id, res)
  else if(toggle === 'off') disableAgendaForTeam(team_id, channel_id, res)
}

export const deleteAgendaForTeam = async (team_id, channel_id) => {
  const numberDisabled = await Agenda.disableAgendaForTeam(team_id, channel_id)
  console.log(numberDisabled)
}

const disableAgendaForTeam = async (team_id, channel_id, res) => {
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) {
    res.status(200)
    const wording = req.body.channel_name === 'directmessage' ? 'direct message' : 'channel'
    res.send(`Doesn't seem that this ${wording} has a subscription`)
  } else {
    try {
      const numberDisabled = await Agenda.disableAgendaForTeam(team_id, channel_id)
      await Teams.update(team_query, { active: false })
      res.status(200)
      res.json(getSubscriptionDisabled())
    } catch(e) {
      logger.log('error', `Could not disable agenda for team ${team_id} and channel ${channel_id}`)
      res.send({
        'response_type': 'ephemeral',
        'text': `Sorry, could not disable. Please try again.`
      })
    }
  }
}



const enableAgendaForTeam = async (team_id, channel_id, res) => {
  const team_query = { team_id: team_id, 'incoming_webhook.channel_id': channel_id }
  const team = await Teams.findOne(team_query).exec();
  if(!team) {
    res.status(200)
    const wording = req.body.channel_name === 'directmessage' ? 'direct message' : 'channel'
    res.send(`Doesn't seem that this ${wording} has any disabled subscriptions`)
  } else {
    try {
      await Agenda.enableAgendaForTeam(channel_id, team_id, postToChannelWithTeamId)
      await Teams.update(team_query, { active: true })
      res.status(200)
      res.json(getSubscriptionEnabled())
    } catch (e) {
      logger.log('error', `Could not enable agenda for team ${team_id} and channel ${channel_id}`)
      res.send({
        'response_type': 'ephemeral',
        'text': `Sorry, could not enable. Please try again.`
      })
    }
  }
}
