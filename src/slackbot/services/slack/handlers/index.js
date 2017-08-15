import subscriptionHandler from './subscriptionHandler'
import whoHandlerImpl from './whoHandler'

export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'subscription':
            subscriptionHandler(body, res);
            break;
        default:

    }
}

export const whoHandler = (res) => {
  whoHandlerImpl(res)
}
