const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	walletId: {
		type: String,
		required: true,
		unique: true,
	},
	tickets: [
		{
			// your ticket number
			SerialNo: {
				type: String,
			},
			// what concert or event
			eventId: { 
				type: String,
				ref: 'Event',
			},
			purchaseDate: { 
				type: Date, default: Date.now 
			},
		},
		
	],

	eventsCreated: [{
		// your event id
		eventId: {
			type: String,
			ref: 'Event',
		},
	}],
	city: {
		type: String,
		default: '',
	},
	country: {
		type: String,
		default: '',
	},

	timestampCreated: {
		type: Date,
		default: Date.now,
	},

	loyaltyPoints: {
		type: Number,
		default: 0,
	},

	savedEvents: [{
		type: String,
		ref: 'Event',
	}],

	genres:[{
		type: String,
	}],

	typesOfEvents:[{
		type: String,
	}],

}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;