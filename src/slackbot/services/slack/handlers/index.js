import subscriptionHandler from './subscriptionHandler'

export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'subscription':
            subscriptionHandler(body, res);
            break;
        default:

    }
}
