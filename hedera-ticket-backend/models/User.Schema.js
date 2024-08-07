import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	walletId: {
		type: String,
		required: true,
		unique: true,
	},
	tickets: [
		{
			// your ticket number
			tokenID: {
				type: String,
				required: true,
			},
			// what concert or event
			eventId: { 
				type: String,
				ref: 'Event',
				required: true,
			},
			purchaseDate: { 
				type: Date, default: Date.now 
			},
		},
	],

	eventsCreated: [{
		// your event id
		eventID: {
			type: String,
			required: true,
		},
	}],
	city: {
		type: String,
	},
	country: {
		type: String,
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
		required: true,
	}],

	genres:[{
		type: String,
		required: true,
	}],

	typesOfEvents:[{
		type: String,
		required: true,
	}],

}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;
