import { model } from './models/subscriptions'
import TeamsModel from './models/slack-teams';
import EntriesModel from '../../models/comic-entry';

export const Teams = TeamsModel;
export const Entries = EntriesModel;
export const SubscriptionsModel = model
