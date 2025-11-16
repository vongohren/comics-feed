import { Teams } from '../../repository/'
import Agenda from './agenda'
import { postToChannelWithTeamId } from '../posting'
import logger from '../../../utils/logger';
import { getSubscriptionEnabled, getSubscriptionDisabled } from '../slack/templates'
import { clearStrikedOutTeams } from '../team'
import mongoose from 'mongoose'

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

// Direct MongoDB deletion - bypasses the Agenda library's problematic cancel() method
const deleteAgendaJobDirectly = async (team_id, channel_id) => {
  try {
    const jobName = `${team_id}-${channel_id}`;
    logger.log('info', `[deleteAgendaJobDirectly] Directly deleting agenda job ${jobName} from MongoDB...`);
    
    // Access the agendaJobs collection directly via mongoose
    const agendaJobsCollection = mongoose.connection.collection('agendaJobs');
    const result = await agendaJobsCollection.deleteMany({ name: jobName });
    
    logger.log('info', `[deleteAgendaJobDirectly] Deleted ${result.deletedCount} agenda job(s) for ${jobName}`);
    return result.deletedCount;
  } catch (error) {
    logger.log('error', `[deleteAgendaJobDirectly] Error deleting job directly: ${error.message}`);
    throw error;
  }
};

export const deleteAgendaForTeam = async (team_id, channel_id) => {
  try {
    logger.log('info', `[deleteAgendaForTeam] Deleting agenda for team ${team_id}, channel ${channel_id}`);
    
    // Try direct MongoDB deletion first (more reliable)
    try {
      const numberDeleted = await deleteAgendaJobDirectly(team_id, channel_id);
      logger.log('info', `[deleteAgendaForTeam] Successfully deleted ${numberDeleted} jobs using direct MongoDB access`);
      return numberDeleted;
    } catch (directError) {
      logger.log('warn', `[deleteAgendaForTeam] Direct deletion failed, falling back to Agenda library: ${directError.message}`);
      // Fallback to Agenda library method
      const numberDisabled = await Agenda.disableAgendaForTeam(team_id, channel_id);
      logger.log('info', `[deleteAgendaForTeam] Disabled ${numberDisabled} agenda jobs using Agenda library for team ${team_id}`);
      return numberDisabled;
    }
  } catch (error) {
    logger.log('error', `[deleteAgendaForTeam] Error deleting agenda for team ${team_id}: ${error.message}`);
    throw error;
  }
}

export const initCleanupJob = () => {
  Agenda.defineCleanupJob(clearStrikedOutTeams);
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
