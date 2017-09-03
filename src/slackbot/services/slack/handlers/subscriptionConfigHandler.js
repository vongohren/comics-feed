import { Teams, SubscriptionsModel } from '../../../repository'
import { Webhook } from '../slack'
import {
  getTeamsAttachment,
  getSubscriptionsAttachment,
  getThankYouForHavingMeAttachment,
  getConfirmRemovalAttachment,
  getCheerForStaying,
  getNoSubscriptionAttachment
} from '../templates'
import { toggleAgendaForTeam, deleteAgendaForTeam } from '../../agenda'

export const findBasedOnTeamId = async (team_id, res) => {
  const query = {team_id: team_id}
  const teams = await Teams.find(query)
  if(teams.length > 0) sendListOfTeams(teams, res)
  else sendNoSubscriptions(res)
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

const sendNoSubscriptions = (res) => {
  const noSubscriptionAttachment = getNoSubscriptionAttachment();
  res.json(noSubscriptionAttachment)
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

export const deleteTeamSubscription = async(team_id, channel_id, res, confirmation) => {
  const query = {team_id: team_id, "incoming_webhook.channel_id": channel_id}
  if(confirmation) {
    await deleteAgendaForTeam(team_id, channel_id)
    const response = await Teams.deleteOne(query)
    const thankYouAttachment = getThankYouForHavingMeAttachment()
    res.json(thankYouAttachment)
  } else {
    const team = await Teams.findOne(query)
    const confirmAttachment = getConfirmRemovalAttachment(team, channel_id)
    res.json(confirmAttachment)
  }
}

export const cheerForStaying = async (res) => {
  res.json(getCheerForStaying())
}
