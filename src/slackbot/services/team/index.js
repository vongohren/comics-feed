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
  const deletePromises = teams.map(async team => {
    try {
      return await deleteAgendaForTeam(team.team_id, team.incoming_webhook.channel_id);
    } catch (error) {
      // Log but don't fail - we still want to clean up the database records
      logger.log('warn', `[deleteAgendaForTeams] Failed to delete agenda for team ${team.team_id}, but continuing: ${error.message}`);
      return 0;
    }
  });
  
  const results = await Promise.all(deletePromises);
  const totalDeleted = results.reduce((sum, num) => sum + num, 0);
  logger.log('info', `[deleteAgendaForTeams] Total agenda jobs deleted: ${totalDeleted}`);
  return totalDeleted;
};

export const clearStrikedOutTeams = async () => { 
  try {
    logger.log('info', '[clearStrikedOutTeams] Starting cleanup process...');
    
    // Find teams to be removed
    logger.log('info', '[clearStrikedOutTeams] Querying database for striked out teams...');
    const teams = await findStrikedOutTeams();
    logger.log('info', `[clearStrikedOutTeams] Found ${teams.length} striked out teams`);
    
    if (teams.length === 0) {
      logger.log('info', '[clearStrikedOutTeams] No striked out teams found to remove');
      return { removed: 0, success: true };
    }
    
    // Try to delete agenda for all teams (but don't fail if this doesn't work)
    let agendaJobsDeleted = 0;
    try {
      logger.log('info', `[clearStrikedOutTeams] Attempting to delete agenda jobs for ${teams.length} teams...`);
      agendaJobsDeleted = await deleteAgendaForTeams(teams);
      logger.log('info', `[clearStrikedOutTeams] Agenda deletion completed. ${agendaJobsDeleted} jobs removed.`);
    } catch (error) {
      logger.log('warn', `[clearStrikedOutTeams] Could not delete all agenda jobs (${error.message}), but continuing with database cleanup...`);
    }
    
    // Remove teams from database - this should always succeed
    logger.log('info', '[clearStrikedOutTeams] Removing teams from database...');
    const removeResult = await removeTeamsFromDatabase();
    logger.log('info', `[clearStrikedOutTeams] Database removal completed. Deleted: ${removeResult.deletedCount}`);
    
    if (removeResult.deletedCount > 0) {
      logger.log('info', `[clearStrikedOutTeams] Successfully removed ${removeResult.deletedCount} teams (${agendaJobsDeleted} agenda jobs)`);
    }
    
    return { 
      removed: removeResult.deletedCount, 
      agendaJobsDeleted: agendaJobsDeleted,
      success: true 
    };
  } catch (error) {
    logger.log('error', `[clearStrikedOutTeams] Error clearing striked out teams: ${error.message}`);
    logger.log('error', `[clearStrikedOutTeams] Stack trace: ${error.stack}`);
    throw error; // Re-throw so the endpoint can handle it
  }
};
