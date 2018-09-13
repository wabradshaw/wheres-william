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

### Examples


## Going
### Description

### Examples


## Been
### Description

### Examples

## Help
### Description

### Examples


# Architecture

The project contains an AWS skill which connects to a Node.js endpoint that describes where William is by calling the travel-history restful endpoint.
