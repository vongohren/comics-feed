const IncomingWebhook = require('@slack/client').IncomingWebhook;

class Webhook {
  constructor (webhook) {
    const hook = new IncomingWebhook(webhook);
  }
  send (attachment) {
    return new Promise((resolve, reject) => {
      this.hook.send({attachments: attachment}, function(err) {
        if (err) {
          reject({ 'ok': false, 'error': err })
        } else {
          resolve({ 'ok': true })
        }
      });
    })
  }
}
