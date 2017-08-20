import { Teams, SubscriptionsModel } from '../../../repository'
import { Webhook } from '../slack'
import { getTeamsAttachment, getSubscriptionsAttachment } from '../templates'
import { toggleAgendaForTeam } from '../../agenda'

export const findBasedOnTeamId = async (team_id, res) => {
  const query = {team_id: team_id}
  const teams = await Teams.find(query)
  if(teams.length > 1) sendListOfTeams(teams, res)
}

export const findBasedOnTeamIdAndUserId = async (team_id, channel_id, user, res) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}

  const team = await Teams.findOne(query)
  if(team.user_id === user.id) {
    res.json(getSubscriptionsAttachment(team))
  } else {
    const query = {team_id: team_id}
    const teams = await Teams.find(query)
    const teamsAttachment = getTeamsAttachment(teams);
    teamsAttachment.text = `*Unfortunately you dont have access to this subscription* \nIt is controlled by <@${team.user_id}>. \nSelect one you own or ask him for changes \nDon't own any? Add your own subscription: https://comics.vongohren.me/`
    res.json(teamsAttachment)
  }

}

const sendListOfTeams = (teams, res) => {
  const teamsAttachment = getTeamsAttachment(teams);
  res.json(teamsAttachment)
}

export const deleteSubscriptionFromTeam = async (name, team_id, channel_id, res) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}
  const response = await Teams.findOneAndUpdate(query, { "$pull": {subscriptions:{name:name}}}, { "new": true})
  const subscriptionsAttachment = getSubscriptionsAttachment(response)
  res.json(subscriptionsAttachment)
}

export const addSubscriptionFromTeam = async (name, team_id, channel_id, res) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}
  const subscription = new SubscriptionsModel({name:name, lastUrlPublished:""})
  const response = await Teams.findOneAndUpdate(query, { "$push": {subscriptions:subscription}}, { "new": true})
  const subscriptionsAttachment = getSubscriptionsAttachment(response)
  res.json(subscriptionsAttachment)
}

export const pauseSubscriptionFromTeam = async (toggle, team_id, channel_id, res) => {
  toggleAgendaForTeam(toggle, team_id, channel_id, res)
}
