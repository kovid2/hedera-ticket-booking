// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const {
	Hbar,
	Client,
	AccountId,
	PrivateKey,
	TokenType,
	TokenSupplyType,
	TokenMintTransaction,
	TransferTransaction,
	AccountBalanceQuery,
	TokenCreateTransaction,
	TokenAssociateTransaction, } = require('@hashgraph/sdk');
require('dotenv').config();
const FormData = require('form-data');
const db = require('./db');
const EventSchema = require('./models/Event.Schema');
const User = require('./models/User.Schema');
const { time } = require('console');


let DB;

const app = express();

// Set up CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

const port = process.env.PORT || 5001;

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});
const upload = multer({ storage: storage });

// Hedera client setup
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(process.env.MY_ACCOUNT_ID), PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

// Shorten URL
const shortenURL = async (longUrl) => {
	try {
		const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
		return response.data;
	} catch (error) {
		console.error('Error shortening URL:', error);
		throw new Error('Failed to shorten URL');
	}
};

// Pin file to IPFS
const pinFileToIPFS = async (filePath) => {
	const formData = new FormData();
	const file = fs.createReadStream(filePath);
	formData.append('file', file);

	const pinataMetadata = JSON.stringify({
		name: 'File name',
	});
	formData.append('pinataMetadata', pinataMetadata);

	try {
		const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
			maxBodyLength: "Infinity",
			headers: {
				'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
				Authorization: `Bearer ${process.env.PINATA_API_KEY}`
			}
		});
		console.log(res.data);
		return res.data;
	} catch (error) {
		console.log(error);
	}
}

/**************************START SERVER **********************/
app.listen(port, async () => {
	try {
		db.connectToServer();

		DB = db.getDb();
		console.log("Connected to MongoDB");

		// Ensure the database is connected before handling requests
		app.use((req, res, next) => {
			if (!DB) {
				return res.status(500).json({ error: 'Database connection not established' });
			}
			next();
		});

		console.log(`Server is running on port ${port}`);
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err);
	}
});

/*************************API ENDPOINT***************************/

// API endpoint to verify login and create a new user
app.post('/api/login', async (req, res) => {
	const { walletId } = req.body;
	const user = await User.findOne({ walletId });
	if (!user) {
		//create a new user
		const newUser = await DB.collection("users").insertOne({ walletId });
		res.status(200).json({ user: newUser });
	}
	else {
		res.status(200).json({ user });
	}
})


// API endpoint to create tickets
app.post('/api/tickets', upload.fields([{ name: 'reservationImage' }, { name: 'ticketImage' }]), async (req, res) => {
	try {

		// TODO: Get more data from front end
		const { price, 
			 numTickets,
			  walletId,
			   venue, 
			   ticketTokenName,
			    city,
			    country,
				dateAndTime,
				description,
			title  } = req.body;
		const reservationImage = req.files['reservationImage'][0];
		//const ticketImage = req.files['ticketImage'][0];

		// Read the uploaded images (optional, for demonstration purposes)
		const reservationImagePath = path.join(__dirname, reservationImage.path);
		//const ticketImagePath = path.join(__dirname, ticketImage.path);
		const reservationImageData = fs.readFileSync(reservationImagePath);
		//const ticketImageData = fs.readFileSync(ticketImagePath);

		console.log("file path", reservationImagePath);
		//console.log("file path", ticketImagePath);

		// Upload images to IPFS using Pinata
		const reservationImageResult = await pinFileToIPFS(reservationImagePath);
		//const ticketImageResult = await pinFileToIPFS(ticketImagePath);

		console.log("reservationImageResult", reservationImageResult);

		// Metadata to be pushed to IPFS
		const metadata = {
			name: "Reservation Ticket for concert",
			description: "This is a ticket for a concert",
			image: `ipfs://${reservationImageResult.IpfsHash}`,
			type: "image/jpeg",
			creator: "Hedera-ticketing-system",
			venue,
		};

		// Upload metadata to IPFS using Pinata
		const metadataFilePath = path.join(__dirname, 'metadata', 'metadata.json');
		fs.writeFileSync(metadataFilePath, JSON.stringify(metadata));
		const metadataResult = await pinFileToIPFS(metadataFilePath);

		console.log("metadataResult", metadataResult);

		const supplyKey = PrivateKey.generate();
		const freezeKey = PrivateKey.generateED25519();

		const tokenCreateTx = await new TokenCreateTransaction()
			.setTokenName("EventTicket")
			.setTokenSymbol("ETK")
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setInitialSupply(0)
			.setSupplyType(TokenSupplyType.Finite)
			.setSupplyKey(supplyKey)
			.setFreezeKey(freezeKey)
			.setMaxSupply(parseInt(numTickets))
			.setTreasuryAccountId(AccountId.fromString(process.env.MY_ACCOUNT_ID))
			.freezeWith(client);

		const nftCreateTxSign = await tokenCreateTx.signWithOperator(client);
		const nftCreateSubmit = await nftCreateTxSign.execute(client);
		const nftCreateRx = await nftCreateSubmit.getReceipt(client);

		const tokenId = nftCreateRx.tokenId;
		console.log(`\nCreated NFT with Token ID: ` + tokenId);

		const maxTransactionFee = new Hbar(20);

		const metadataUri = `ipfs://${metadataResult.IpfsHash}`;
		//const metadataLink = `${process.env.PINATA_URL}/ipfs/${metadataResult.IpfsHash}`;

		//const shortenedMetadataLink = await shortenURL(metadataLink);

		// if (Buffer.byteLength(shortenedMetadataLink) > 100) {
		// 	throw new Error('Metadata too long even after shortening ' + Buffer.byteLength(shortenedMetadataLink));
		// }

		//TODO: Make event data come from the front end
		const eventData = new EventSchema({
			eventID: tokenId.toString(),
			organizerID: walletId, //for now
			supplyKey: supplyKey.toString(),
			freezeKey: freezeKey.toString(),
			metadataUri: metadataUri,
			title: title,
			venue: venue,
			dateAndTime: new Date(),
			city: city,
			country: country,
			image: `ipfs://${ticketImageResult.IpfsHash}`,
			description: description,
			totalTickets: numTickets,
			ticketsSold: 0,
			price: price,
		});
		DB = db.getDb();

		await DB.collection('events').insertOne(eventData);

		//await eventData.save();

		//update user's eventsCreated

		//if user not found create a new user

		// TODO: redundant check during production remove it once metamaks is fixed
		const user = await DB.collection("users").findOne({ walletId: walletId });
		console.log("user", user);
		if (!user) {

			console.log("Creating new user");
			const newUser = new User({
				// TODO: change it once metamask is fixed
				walletId: process.env.MY_ACCOUNT_ID, //ik we using same account for so many things lmao
				eventsCreated: [tokenId.toString()]
			});
			await DB.collection("users").insertOne(newUser);
		}
		else {
			await DB.collection("users").findOneAndUpdate({ walletId: walletId }, { $push: { eventsCreated: tokenId.toString() } });
		}

		// Mint tokens to treasuary
		for (let i = 0; i < numTickets; i++) {
			const mintNFT = new TokenMintTransaction()
				.setTokenId(tokenId)
				.setMetadata([Buffer.from(metadataUri)])
				.freezeWith(client);

			const mintNFTSign = await mintNFT.sign(supplyKey);
			const mintNFTSubmit = await mintNFTSign.execute(client);

			const mintNFTReceipt = await mintNFTSubmit.getReceipt(client);
			console.log(`Minted NFT with Token ID: ` + tokenId);
		}

		res.status(200).json({ message: 'Tickets created successfully', tokenId });
	} catch (error) {
		console.error('Error creating tickets:', error);
		res.status(500).json({ error: 'Failed to create tickets' });
	}
});

// API endpoint to get all events
app.post('/api/tickets/transfer', async (req, res) => {
	const eventId = req.body.eventId;
	const walletId = req.body.walletId;
	const SerialNo = req.body.SerialNo;
	try {
		//fetch event info 
		const event = await DB.collection('events').findOne({ eventID: eventId });
		console.log("event", event);
		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		//update user's tickets
		await DB.collection("users").findOneAndUpdate({ walletId: walletId }, { $push: { tickets: { SerialNo: SerialNo, eventId: event.eventID } } });
		//update event's ticketsSold
		await DB.collection("events").findOneAndUpdate({ eventID: event.eventID }, { $inc: { ticketsSold: 1 } });

		return res.status(200).json({ message: 'NFT transferred successfully successfully', tokenId });
	}
	catch (error) {
		return res.status(500).json({ error: 'Failed to transfer NFT' });
	}

});

// API endpoint to get specific event details
app.post('/api/event/detail', async (req, res) => {
	const eventId = req.body.eventId;
	const event = await DB.collection('events').findOne({ eventID: eventId });
	if (!event) {
		return res.status(404).json({ error: 'Event not found' });
	}
	return res.status(200).json({ event });
})


app.post('/api/ticket/reimburse', async (req, res) => {

});















app.get('/api/tickets/transfer/deprecated/gone', async (req, res) => {
	//const { tokenId } = req.params;
	const tokenId = "0.0.4666386";
	const accountId = process.env.ASHLEY_ACC_ID;

	//fetch event info 
	const event = await DB.collection('events').findOne({ eventID: tokenId });
	console.log("event", event);
	if (!event) {
		return res.status(404).json({ error: 'Event not found' });
	}


	async function bCheckerFcn(id) {
		balanceCheckTx = await new AccountBalanceQuery().setAccountId(id).execute(client);
		return [balanceCheckTx.tokens._map.get(tokenId.toString()), balanceCheckTx.hbars];
	}

	if (bCheckerFcn(accountId)[0] < event.price) {
		return res.status(400).json({ error: 'Insufficient funds' });

	}

	// Transfer HBAR from the user's account to the treasury

	// Convert event price to tinybars
	//const eventPriceInTinybars = parseInt(event.price);
	console.log("event price", event.price);

	const transferHbarTx = await new TransferTransaction()
		.addHbarTransfer(accountId, new Hbar((-1 * parseInt(event.price))))
		.addHbarTransfer(process.env.MY_ACCOUNT_ID, new Hbar(parseInt(event.price)))
		.freezeWith(client)
		.sign(PrivateKey.fromStringDer(process.env.ASHLEY_PRIVATE_KEY));



	const transferHbarSubmit = await transferHbarTx.execute(client);
	const transferHbarReceipt = await transferHbarSubmit.getReceipt(client);
	console.log(`20 HBAR transferred from user to treasury: ${transferHbarReceipt.status}`);

	// Associate the NFT with the user's account
	try {
		const associateTx = await new TokenAssociateTransaction()
			.setAccountId(accountId)
			.setTokenIds([tokenId])
			.freezeWith(client)
			.sign(PrivateKey.fromStringDer(process.env.ASHLEY_PRIVATE_KEY));

		const associateTxSubmit = await associateTx.execute(client);
		const associateTxReceipt = await associateTxSubmit.getReceipt(client);
	} catch (error) {
		console.log("NFT already associated with user");
		var balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.MY_ACCOUNT_ID)
			.execute(client);
		console.log(`Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

		// Check the balance before the transfer for the user account
		balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.ASHLEY_ACC_ID)
			.execute(client);
		console.log(`Ashley's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);


		// Transfer the NFT to the user
		const tokenTransferTx = await new TransferTransaction()
			//TODO: change the number to events.ticketsSold+1
			.addNftTransfer(tokenId, event.ticketsSold + 1, process.env.MY_ACCOUNT_ID, accountId)
			.freezeWith(client)
			.sign(PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY));

		const tokenTransferSubmit = await tokenTransferTx.execute(client);
		const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

		console.log(`\nNFT transfer from Treasury to Ashley ${tokenTransferRx.status} \n`);

		// Check the balance after the transfer for the treasury account
		balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.MY_ACCOUNT_ID)
			.execute(client);
		console.log(`Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

		// Check the balance after the transfer for the user account
		balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.ASHLEY_ACC_ID)
			.execute(client);
		console.log(`Ashley's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

		//update user's tickets
		await DB.collection("users").findOneAndUpdate({ walletId: accountId }, { $push: { tickets: { tokenId, eventId: event.eventID } } });
		//update event's ticketsSold
		await DB.collection("events").findOneAndUpdate({ eventID: event.eventID }, { $inc: { ticketsSold: 1 } });

		return res.status(200).json({ message: 'NFT transferred successfully successfully', tokenId });
	}

	//console.log(`NFT association with Ashley's account: ${associateTxReceipt.status}\n`);

	// Check the balance before the transfer for the treasury account
	var balanceCheckTx = await new AccountBalanceQuery()
		.setAccountId(process.env.MY_ACCOUNT_ID)
		.execute(client);
	console.log(`Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

	// Check the balance before the transfer for the user account
	balanceCheckTx = await new AccountBalanceQuery()
		.setAccountId(process.env.ASHLEY_ACC_ID)
		.execute(client);
	console.log(`Ashley's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);


	// Transfer the NFT to the user
	const tokenTransferTx = await new TransferTransaction()
		.addNftTransfer(tokenId, event.ticketsSold + 1, process.env.MY_ACCOUNT_ID, accountId)
		.freezeWith(client)
		.sign(PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY));

	const tokenTransferSubmit = await tokenTransferTx.execute(client);
	const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

	console.log(`\nNFT transfer from Treasury to Ashley ${tokenTransferRx.status} \n`);

	// Check the balance after the transfer for the treasury account
	balanceCheckTx = await new AccountBalanceQuery()
		.setAccountId(process.env.MY_ACCOUNT_ID)
		.execute(client);
	console.log(`Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

	// Check the balance after the transfer for the user account
	balanceCheckTx = await new AccountBalanceQuery()
		.setAccountId(process.env.ASHLEY_ACC_ID)
		.execute(client);
	console.log(`Ashley's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

	//update user's tickets
	await DB.collection("users").findOneAndUpdate({ walletId: accountId }, { $push: { tickets: { tokenId, eventId: event.eventID } } });
	//update event's ticketsSold
	await DB.collection("events").findOneAndUpdate({ eventID: event.eventID }, { $inc: { ticketsSold: 1 } });

	res.status(200).json({ message: 'NFT transferred successfully successfully', tokenId });


});

