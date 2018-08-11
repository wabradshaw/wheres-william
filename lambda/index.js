const Alexa = require('alexa-sdk');

const handlers = {
    'going' : function(){
        this.emit(':tell', "William is going to get this working!");
    }
}

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
}
