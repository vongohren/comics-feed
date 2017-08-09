const IncomingWebhook = require('@slack/client').IncomingWebhook;

class Webhook {
  constructor (webhook) {
    this.hook = new IncomingWebhook(webhook);
  }
  send (attachment) {
    console.log(this.hook)
    return new Promise((resolve, reject) => {
      this.hook.send({attachments: attachment}, function(err) {
        if (err) {
          throw err
        } else {
          resolve({ 'ok': true })
        }
      });
    })
  }
}

export {
  Webhook
}
