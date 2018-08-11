const Alexa = require('alexa-sdk');
const request = require('request-promise');

const historyUrl = "http://54.191.146.40:8080/travel-history/";

function addNextLocation(base){
	return request({
		url: historyUrl + "history/next",
		transform: function (body){
			console.log("Next:");
			console.log(body);			
			base.next = body == "" ? {} : JSON.parse(body);
			return base;
		}
	})
}

function addCurrentLocation(base){
	return request({
		url: historyUrl + "history/current",
		transform: function (body){
			console.log("Current:");
			console.log(body);
			base.current = body == "" ? {} : JSON.parse(body);
			return base;
		}
	})
}

function generateGoingResponse(data){
	console.log("Complete:");
	console.log(data);
	if(data.next.name == undefined){
		return "William hasn't decided where to go next, he's still in " + data.current.name + ".";
	} else {
		return "William is going to fill this in later.";
	}
}

const handlers = {
    'going' : function(){
		console.log("Finding out where William's going next..");
		addNextLocation({})
		.then(data => addCurrentLocation(data))
		.then(data => this.emit(':tell', generateGoingResponse(data)));
    }
}

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
}
