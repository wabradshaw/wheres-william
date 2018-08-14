const Alexa = require('alexa-sdk');
const AmazonDateParser = require('amazon-date-parser');
const request = require('request-promise');
const moment = require('moment');

const historyUrl = "http://54.191.146.40:8080/travel-history/";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

function expressList(list, separator, conjunction){
  var result = "";
  
  for(i = 0; i < list.length - 2; i++){
  	result += list[i] + separator + " ";
  }
  
  if(list.length > 1){
  	result += list[list.length-2] + " " + conjunction + " ";
  }
  
  if(list.length > 0){
  	result += list[list.length-1];
  }
  
  return result;
}

/**
 * Adds the data for the next place I'm scheduled to visit to the supplied object under the "next" object. An empty object if nowhere is planned next.
 */
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

/**
 * Adds the data for the current place I'm visiting to the supplied object under the "current" object. An empty object if I've forgotten to say where I am.
 */
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

/**
 * Adds the data for the place I was at at a specific date-time to the to the supplied object under the supplied name. An empty object if no data is available for that time.
 */
function addHistoricLocation(base, date, name){
	return request({
		url: historyUrl + "history/at?date=" + date.format("YYYY-MM-DDTHH:mm:ss.SSSZ").replace("+", "%2b"),
		transform: function (body){
			console.log("Historic for " + name + ":");
			console.log(body);
			base[name] = body == "" ? {} : JSON.parse(body);
			return base;
		}
	})
}

/**
 * Adds the data for the places where I was between two dates to the to the supplied object under the "history" object. An empty list if no data is available for that time.
 */
function addHistoricDuration(base, start, end){
	return request({
		url: historyUrl + "history/between?startDate=" + start.format("YYYY-MM-DDTHH:mm:ss.SSSZ").replace("+", "%2b") + "&endDate=" + end.format("YYYY-MM-DDTHH:mm:ss.SSSZ").replace("+", "%2b"),
		transform: function (body){
			console.log("Historic locations:");
			console.log(body);
			base.history = body == "" ? [] : JSON.parse(body);
			return base;
		}
	})
}

/**
 * Converts a date into a string of the format "31st of July", where the month only appears if it isn't the current month.
 */
function expressDate(date){
	var day = asOrdinal(date.dayOfMonth);
	
	var currentMonth = new Date().getMonth() + 1;
	var month = currentMonth == date.monthOfYear ? "" : " of " + months[date.monthOfYear];
	
	return day + month;
}

/**
 * Generates a response about where I'm going next. There are four possibilities:
 * 0. I've failed to keep this up to date...
 * 1. I haven't planned where I'm going next, at all.
 * 2. I haven't planned where I'm going next, but know when I need to be there.
 * 3. I know where I'm going next.
 */
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
			return "William doesn't know where he's going next, he just knows that he's leaving " + data.current.name + " on the " + expressDate(data.current.endTime) + ".";		
		}
	} else {
		return "William is off to " + data.next.name + ", " + data.next.country + " on the " + expressDate(data.next.startTime) + ".";
	}
}

/**
 * Generates a response about where I currently am. There are five possibilities:
 * 0. I've failed to keep this up to date...
 * 1. I'm travelling to / scheduled to arrive somewhere.
 * 2. I arrived somewhere today. 
 * 3. I arrived a while ago, but don't know when I'm leaving.
 * 4. I arrived a while ago, and I do know when I'm leaving.
 */
function generateNowResponse(data){
	console.log("Complete:");
	console.log(data);
	if(data.current.name == undefined){
		return "William has failed to keep this up to date!";
	}
	
	var sameDay = data.current.startTime.dayOfMonth == new Date().getDate() && data.current.startTime.monthOfYear == new Date().getMonth() + 1;
	var travelling = sameDay && data.current.startTime.hourOfDay - new Date().getHours() < 6;
	
	if(travelling){
		return "William is travelling to " + data.current.name + ", " + data.current.country + ".";
	} else if(sameDay) {
		return "William has just arrived in " + data.current.name + ", " + data.current.country + ".";
	} else if(data.current.endTime == undefined){
		return "William is in " + data.current.name + ", " + data.current.country + " for the time being.";
	} else {
		return "William is in " + data.current.name + ", " + data.current.country + " until the " + expressDate(data.current.endTime) + ".";
	}
}

/**
 * Generates a response about where I was on a certain day. There are four possibilities:
 * 0. I wasn't tracking my location then.
 * 1. There's a gap in my data tracking, so I know where I was at the start of the day but not the end.
 * 2. I was staying in the same place for the whole day.
 * 3. I was travelling between two different places that day.
 */
function generateHistoricResponse(data){
	console.log("Complete:");
	console.log(data);
	if(data.start == null && data.end == null){
		return "William wasn't tracking his location then.";
	} else if (data.end == null){
		// This can only happen if there is something wrong with the data.
		return "William was staying in " + data.end.name + ", " + data.end.country + ".";
	} else if (data.start == null || data.start.name == data.end.name) {
		return "William was staying in " + data.start.name + ", " + data.start.country + ".";
	} else {
		const firstCountry = data.start.country == data.end.country ? "" : ", " + data.start.country;
		return "William was travelling between " + data.start.name + firstCountry + " and " + data.end.name + ", " + data.end.country + ".";
	}
}

/**
 * Generates a response about where I was on a certain day. There are four possibilities:
 * 0. I wasn't tracking my location then.
 * 1. There's a gap in my data tracking, so I know where I was at the start of the day but not the end.
 * 2. I was staying in the same place for the whole day.
 * 3. I was travelling between two different places that day.
 */
function generateHistoricVisitsResponse(data){
	console.log("Complete:");
	console.log(data);
	places = data.history;
	if(places == null || places == undefined || places == []){
		return "William wasn't tracking his location then.";
	} else if (places.length == 1){		
		return "William was staying in " + places[0].name + ", " + places[0].country + ".";
	} else {
		var uniquePlaces = new Set();
		var pastLocations = [];
		var currentLocations = [];
		var last = null;

		for(i = 0; i < places.length; i++){
			var target = places[i];
			var name = target.name;
			if(uniquePlaces.has(target.name)){
				name += " again";
			} else {
				uniquePlaces.add(target.name);
			}
			
			if(last != null && last != target.country){    	
				pastLocations.push({list: currentLocations, country: last});
			  currentLocations = [];
			}
				
			currentLocations.push(name);	
			
			last = target.country;
		}

		if(currentLocations.length > 0){
			pastLocations.push({list: currentLocations, country: last});
		}

		var named = pastLocations.map(data => expressList(data.list, ",", "and") + " " + data.country);

		return "William visited " + expressList(named, ";", "; then he visited") + ".";
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
    },
	'been' : function(){
		console.log("Finding out where William's been..");
		const dateSlot = this.event.request.intent.slots.date.value;
		
		if(dateSlot == null || dateSlot == undefined){
			this.emit(":tell", "I'm sorry, I don't know when you're asking about. Please try again.");
		} else {
			const dateObject = new AmazonDateParser(dateSlot);
			
			const start = moment(dateObject.startDate);
			start.utcOffset(0);
			start.startOf('Day');
			
			const end = moment(dateObject.endDate);
			end.utcOffset(0);
			end.endOf('Day');
			
			while(start.isAfter(moment())){
				start.subtract(1, "year"); 
				end.subtract(1, "year"); 
			}
			
			if(start.format("YYYYMMDD") == end.format("YYYYMMDD")){
				addHistoricLocation({}, start, "start")
				.then(data => addHistoricLocation(data, end, "end"))
				.then(data => this.emit(':tell', generateHistoricResponse(data)));
			} else {
				addHistoricDuration({}, start, end)
				.then(data => this.emit(':tell', generateHistoricVisitsResponse(data)));
			}
			
		}
	}
}

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
}
