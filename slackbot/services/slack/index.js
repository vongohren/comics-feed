const IncomingWebhook = require('@slack/client').IncomingWebhook;
import { Webhook } from './slack'

export const postEntryToSlackWithWebhook = (entry, webhook) => {
  const hook = new Webhook(webhook);
  const comicAttachment = createAttachments(entry);
  const res = await hook.send(comicAttachment);
  if(!res.ok) logger.log('error', res.err);
  hook.send({attachments: comicAttachment}, function(err, res) {
      if (err) {
          logger.log('error', err);
      } else {
          logger.log('info',`Successfully posted: ${entry.url} to ${team.team_name}-${team.incoming_webhook.channel}`);
      }
  });
}
