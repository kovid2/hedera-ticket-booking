// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenMintTransaction } = require('@hashgraph/sdk');
require('dotenv').config();

const app = express();

//set up CORS
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
client.setOperator(AccountId.fromString(process.env.MY_ACCOUNT_ID), PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY));

// API endpoint to create tickets
app.post('/api/tickets', upload.fields([{ name: 'reservationImage' }, { name: 'ticketImage' }]), async (req, res) => {
	try {
		const { price, currency, numTickets } = req.body;
		const reservationImage = req.files['reservationImage'][0];
		const ticketImage = req.files['ticketImage'][0];

		// Read the uploaded images (optional, for demonstration purposes)
		const reservationImagePath = path.join(__dirname, reservationImage.path);
		const ticketImagePath = path.join(__dirname, ticketImage.path);
		const reservationImageData = fs.readFileSync(reservationImagePath);
		const ticketImageData = fs.readFileSync(ticketImagePath);

		// console.log('Reservation Image:', reservationImageData);
		// console.log('Ticket Image:', ticketImageData);

		// TODO: Implement NFT creation and management using Hedera SDK

		// Example: Create a new token

		const tokenCreateTx = await new TokenCreateTransaction()
			.setTokenName("EventTicket")
			.setTokenSymbol("ETK")
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setInitialSupply(0)
			.setSupplyType(TokenSupplyType.Finite)
			.setSupplyKey(PrivateKey.generate())
			.setMaxSupply(parseInt(numTickets))
			.setTreasuryAccountId(AccountId.fromString(process.env.MY_ACCOUNT_ID))
			.execute(client);

		const nftCreateTxSign = await tokenCreateTx.signWithOperator(client);
		const nftCreateSubmit = await nftCreateTxSign.execute(client);
		//Get the transaction receipt
		const nftCreateRx = await nftCreateSubmit.getReceipt(client);

		//Get the token ID
		const tokenId = nftCreateRx.tokenId;

		//Log the token ID
		console.log(`\nCreated NFT with Token ID: ` + tokenId);

		// Mint tokens
		await new TokenMintTransaction()
			.setTokenId(tokenId)
			.setAmount(parseInt(numTickets))
			.execute(client);

		res.status(200).json({ message: 'Tickets created successfully', tokenId });
	} catch (error) {
		console.error('Error creating tickets:', error);
		res.status(500).json({ error: 'Failed to create tickets' });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
