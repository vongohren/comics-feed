const postToTeam = require('./poster').postToTeam;

module.exports = (body, res) => {
    switch (body.callback_id) {
        case 'subscription':
            subscriptionHandler(body, res);
            break;
        default:

    }
}

const subscriptionHandler = (body, res) => {
    // postToTeam(body);
    const subscriptionAction = body.actions.find(action=> {
        return action.name === 'subscription';
    })
    if(subscriptionAction.value==='subscribe') {


        const fixedAttachments = [];
        fixedAttachments.push(body.original_message.attachments[0]);
        const responsePart = body.original_message.attachments[1]
        delete responsePart.actions;
        delete responsePart.callback_id;
        responsePart.text = "Enjoy!";
        fixedAttachments.push(responsePart)
        const sendObject = {
                text: body.original_message.text,
                attachments: fixedAttachments
            }
        res.status(200).json(sendObject)
    }
}