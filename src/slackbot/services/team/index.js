import { Teams } from '../../repository/'
import { deleteAgendaForTeam } from '../agenda/'
const logger = require('../../../utils/logger');

export const clearStrikedOutTeams = async () => {
  const strike_query = { strike: { $gt : 3 } }
  const teams = await Teams.find(strike_query).exec();
  for(var team of teams) {
    await deleteAgendaForTeam(team.team_id, team.incoming_webhook.channel_id)
  }
  const removedSuccesful = await Teams.find(strike_query).remove().exec();
  if(removedSuccesful.result.n > 0){
    logger.log('info', `Removed ${removedSuccesful.result.n} team and agendaJobs`)
  }
  return { removed : removedSuccesful.result.n }
}
