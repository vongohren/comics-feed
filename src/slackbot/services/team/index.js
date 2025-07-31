import { Teams } from '../../repository/'
import { deleteAgendaForTeam } from '../agenda/'
import logger from '../../../utils/logger';

const findStrikedOutTeams = async (strikeThreshold = 3) => {
  const strike_query = { strike: { $gt: strikeThreshold } };
  return await Teams.find(strike_query).exec();
};

const removeTeamsFromDatabase = async (strikeThreshold = 3) => {
  const strike_query = { strike: { $gt: strikeThreshold } };
  return await Teams.deleteMany(strike_query).exec();
};

const deleteAgendaForTeams = async (teams) => {
  const deletePromises = teams.map(team => 
    deleteAgendaForTeam(team.team_id, team.incoming_webhook.channel_id)
  );
  await Promise.all(deletePromises);
};

export const clearStrikedOutTeams = async () => { 
  try {
    // Find teams to be removed
    const teams = await findStrikedOutTeams();
    
    if (teams.length === 0) {
      logger.log('info', 'No striked out teams found to remove');
      return { removed: 0 };
    }
    
    // Delete agenda for all teams
    await deleteAgendaForTeams(teams);
    
    // Remove teams from database
    const removeResult = await removeTeamsFromDatabase();
    
    if (removeResult.deletedCount > 0) {
      logger.log('info', `Removed ${removeResult.deletedCount} teams and their agenda jobs`);
    }
    
    return { removed: removeResult.deletedCount };
  } catch (error) {
    logger.log('error', `Error clearing striked out teams: ${error}`);
    return { removed: 0 };
  }
};
