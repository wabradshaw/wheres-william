# Wheres William
I travel a lot. So much so that it can be difficult for friends and family to know where I am at any point. As such I created Where's William. 

Where's William is an Alexa skill that tracks where I am at any given time. With this, it's easy to find out where I am at any point. The skill can tell you where I am, where I'm going next, and where I was historically. Historical queries can be either for a particular date (e.g. last Tuesday), or for a date range (e.g. last month). See below for a full list of commands.

Currently Where's William is in beta, please let me know at w.a.bradshaw@gmail.com if you would like to be included.

- [Commands](#commands)
  * [Now](#now)
  * [Going] (#going)
  * [Been] (#been)
- [Architecture](#architecture)
  
# Commands

## Now
### Description

The Now intent is the primary use of Where's William. If you try "Alexa ask where's william?", you'll get told where I'm staying at the moment. It will also tell you if I've just arrived, or if I'm moving on soon. 

### Examples

"Alexa ask where's william?"
> William is in Prague, Czechia until the 16th.

"Alexa ask where's william now?"
> William is travelling to London, England.

"Alexa ask where's william at the moment?"
> William has just arrived in Tirana, Albania.

## Going
### Description

The Going intent is used to find out where I am planning to go next. Of course, this does rely on me knowing where I'm off to next. If I know, Where's William will tell you where I'm going to go next, otherwise it will tell you where I am, and if I know when I need to move on.

### Examples

"Alexa ask where's william going?"
> William is off to Garrigill, England on the 2nd of November.

"Alexa ask where's william travelling to?"
> William doesn't know where he's going next, he just knows that he's leaving Durham on the 4th.

"Alexa ask where's william going next?"
> William hasn't decided where to go next, he's still in Rome.

## Been
### Description

The Been intent is the most complex intent, letting you find out where I was at any point in the past (provided the data supports it). It can be used to find out where I was on a particular day, or where I was in a particular time period.

### Examples

"Alexa ask where's william been in the last week?"
> William was in Durham, Coxhoe and London in England.

"Alexa ask where's william visited on the 24th of April?"
> William was staying in Milan, Italy.

"Alexa ask where's william been in May?"
> William visited Salerno in Italy; Vienna and Salzburg in Austria; Bratislava in Slovakia; Budapest in Hungary; then he visited Garrigill in England.

## Help
### Description

The Help intent can be used if you can't remember what other intents are on offer. If you ask for Help it will list the three intents above.

# Architecture

The project contains an AWS skill which connects to a Node.js endpoint that describes where William is by calling the travel-history restful endpoint.
