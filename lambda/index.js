const Alexa = require('alexa-sdk');
const request = require('request-promise');

const historyUrl = "http://54.191.146.40:8080/travel-history/";

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Converts a day of the month into an ordinal (e.g. 1st, 2nd, 3rd).
 */
function asOrdinal(day){
	switch(day){
		case 1:
		case 21: 
		case 31:
			return day + "st";
			break;
		case 2: 
		case 22:
			return day + "nd";
			break;
		case 3: 
		case 23:
			return day + "rd";
			break;
		default:
			return day + "th";
			break;
	}
}

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

function expressDate(date, context){
	var day = asOrdinal(date.dayOfMonth);
	
	var currentMonth = new Date().getMonth() + 1;
	var month = currentMonth == date.monthOfYear ? "" : " of " + months[date.monthOfYear];
	
	return day + month;
}

function generateGoingResponse(data){
	console.log("Complete:");
	console.log(data);
	if(data.current.name == undefined){
		return "William has failed to keep this up to date!";
	}
	
	if(data.next.name == undefined){
		if(data.current.endTime == undefined){
			return "William hasn't decided where to go next, he's still in " + data.current.name + ".";
		} else {
			return "William doesn't know where he's going next, he just knows that he's leaving " + data.current.name + " on the " + expressDate(data.current.endTime, null) + ".";		
		}
	} else {
		return "William is off to " + data.next.name + ", " + data.next.country + " on the " + expressDate(data.next.startTime, null) + ".";
	}
}

function generateNowResponse(data){
	console.log("Complete:");
	console.log(data);
	if(data.current.name == undefined){
		return "William has failed to keep this up to date!";
	}
	
	var sameDay = data.current.startTime.dayOfMonth == new Date().getMonth() - 1;
	var travelling = sameDay && data.current.startTime.hourOfDay - new Date().getHours() < 6;
	
	if(travelling){
		return "William is travelling to " + data.current.name + ", " + data.current.country + ".";
	} else if(sameDay) {
		return "William has just arrived in " + data.current.name + ", " + data.current.country + ".";
	} else if(data.current.endTime == undefined){
		return "William is in " + data.current.name + ", " + data.current.country + " for the time being.";
	} else {
		return "William is in " + data.current.name + ", " + data.current.country + " until the " + expressDate(data.current.endTime, null) + ".";
	}
}

const handlers = {
    'going' : function(){
		console.log("Finding out where William's going next..");
		addNextLocation({})
		.then(data => addCurrentLocation(data))
		.then(data => this.emit(':tell', generateGoingResponse(data)));
    },
	'now' : function(){
		console.log("Finding out where William is now..");
		addCurrentLocation({})
		.then(data => this.emit(':tell', generateNowResponse(data)));
    }
}

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
}
