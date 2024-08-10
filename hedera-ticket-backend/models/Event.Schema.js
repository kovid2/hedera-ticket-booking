const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
	eventID : {
		type: String,
		required: true,
		unique: true,
	},
	organizerID: {
		type: String,
		required: true,
	},
	supplyKey: {
		type: String,
		required: true,
	},
	freezeKey: {
		type: String,
		required: true,
	},
	metadataUri: {
		type: String,
		required: true,
	},
	
	title: {
		type: String,
		required: true,
	},
	venue: {
		type: String,
		required: true,
	},
	dateAndTime: {
		type : Date,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	image: {
		type: String,
	},
	description: {
		type: String,
	},
	totalTickets: {
		type: Number,
		required: true,
	},
	ticketsSold: {
		type: Number,
		default: 0,
	},
	price: {
		type: Number,
		required: true,
	},
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
