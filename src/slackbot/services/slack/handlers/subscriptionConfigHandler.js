import { Teams } from '../../../repository'
import { Webhook } from '../slack'
import { getTeamsAttachment, getSubscriptionsAttachment } from '../templates'

export const findBasedOnTeamId = async (team_id, res) => {
  const query = {team_id: team_id}
  const teams = await Teams.find(query)
  if(teams.length > 1) sendListOfTeams(teams, res)
}

export const findBasedOnTeamIdAndUserId = async (team_id, channel_id, res) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}
  const team = await Teams.findOne(query)
  const subscriptionsAttachment = getSubscriptionsAttachment(team)
  res.json(subscriptionsAttachment)
}

const sendListOfTeams = (teams, res) => {
  const teamsAttachment = getTeamsAttachment(teams);
  console.log(JSON.stringify(teamsAttachment))
  res.json(teamsAttachment)
}

export const deleteSubscriptionFromTeam = async (name, team_id, channel_id, res) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}
  const response = await Teams.findOneAndUpdate(query, { "$pull": {subscriptions:{name:name}}}, { "new": true})
  const subscriptionsAttachment = getSubscriptionsAttachment(response)
  res.json(subscriptionsAttachment)
}
