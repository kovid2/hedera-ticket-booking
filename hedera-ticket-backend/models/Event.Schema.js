import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
	eventID : {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
		required: true,
	},
	venue: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
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