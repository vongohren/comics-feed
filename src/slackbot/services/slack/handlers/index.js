import interactiveHandlerImpl from './interactiveHandler'
import subscriptionHandlerImpl from './subscriptionConfigHandler'

export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'subscription':
            interactiveHandlerImpl(body, res);
            break;
        default:

    }
}

export const subscriptionHandler = (body, res) => {

}
