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
const { connectToServer, getDb } = require('./db');
const EventSchema = require('./models/Event.Schema');
const User = require('./models/User.Schema');

const DB = getDb();

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

/*************************API ENDPOINT***************************/

// API endpoint to verify login and create a new user
app.post('/api/login', async (req, res) => {
	const { walletId } = req.body;
	const user = await User.findOne({ walletId });
	if (!user) {
		//create a new user
		const newUser = new User({
			walletId
		});
		await newUser.save();
		res.status(200).json({ user: newUser });
	}
	else {
		res.status(200).json({ user });
	}
})


// API endpoint to create tickets
app.post('/api/tickets', upload.fields([{ name: 'reservationImage' }, { name: 'ticketImage' }]), async (req, res) => {
	try {
		const { price, currency, numTickets, accountId } = req.body;
		const reservationImage = req.files['reservationImage'][0];
		const ticketImage = req.files['ticketImage'][0];

		// Read the uploaded images (optional, for demonstration purposes)
		const reservationImagePath = path.join(__dirname, reservationImage.path);
		const ticketImagePath = path.join(__dirname, ticketImage.path);
		const reservationImageData = fs.readFileSync(reservationImagePath);
		const ticketImageData = fs.readFileSync(ticketImagePath);

		console.log("file path", reservationImagePath);
		console.log("file path", ticketImagePath);

		// Upload images to IPFS using Pinata
		const reservationImageResult = await pinFileToIPFS(reservationImagePath);
		const ticketImageResult = await pinFileToIPFS(ticketImagePath);

		console.log("reservationImageResult", reservationImageResult);

		// Metadata to be pushed to IPFS
		const metadata = {
			name: "Reservation Ticket for concert",
			description: "This is a ticket for a concert",
			image: `${process.env.PINATA_URL}/ipfs/${reservationImageResult.IpfsHash}`,
			type: "image/jpeg",
			creator: "Hedera-ticketing-system"
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
		const metadataLink = `${process.env.PINATA_URL}/ipfs/${metadataResult.IpfsHash}`;

		const shortenedMetadataLink = await shortenURL(metadataLink);

		if (Buffer.byteLength(shortenedMetadataLink) > 100) {
			throw new Error('Metadata too long even after shortening ' + Buffer.byteLength(shortenedMetadataLink));
		}

		//TODO: Make event data come from the front end
		const eventData = new EventSchema({
			eventID: tokenId.toString(),
			organizerID: process.env.MY_ACCOUNT_ID, //for now
			supplyKey: supplyKey.toString(),
			metadataUri: shortenedMetadataLink,
			title: "Event Ticket",
			venue: "Online",
			date: new Date(),
			city: "Online",
			country: "Online",
			image: `${process.env.PINATA_URL}/ipfs/${ticketImageResult.IpfsHash}`,
			description: "This is a ticket for an event",
			totalTickets: numTickets,
			ticketsSold: 0,
			price: price,
		});

		await eventData.save();

		//update user's eventsCreated

		//if user not found create a new user
		const user = await User.findOne({ walletId: accountId });
		if (!user) {
			const newUser = new User({
				//TODO: change it once metamask is fixed
				walletId: process.env.MY_ACCOUNT_ID, //ik we using same account for so many things lmao
				eventsCreated: [tokenId.toString()]
			});
			await newUser.save();
		}
		else {
			await User.findOneAndUpdate({ walletId: accountId }, { $push: { eventsCreated: tokenId.toString() } });
		}


		/*************** MIGRATE THE THINGS BELOW TO THEIR SPECIFIC ROUTES ****************/
		// Mint tokens
		const mintNFT = new TokenMintTransaction()
			.setTokenId(tokenId)
			.setMetadata([Buffer.from(shortenedMetadataLink)])
			.freezeWith(client);

		const mintNFTSign = await mintNFT.sign(supplyKey);
		const mintNFTSubmit = await mintNFTSign.execute(client);

		const mintNFTReceipt = await mintNFTSubmit.getReceipt(client);
		console.log(`Minted NFT with Token ID: ` + tokenId);

		// Transfer 20 HBAR from the user's account to the treasury
		const transferHbarTx = await new TransferTransaction()
			.addHbarTransfer(process.env.ASHLEY_ACC_ID, new Hbar(-20))
			.addHbarTransfer(process.env.MY_ACCOUNT_ID, new Hbar(20))
			.freezeWith(client)
			.sign(PrivateKey.fromStringDer(process.env.ASHLEY_PRIVATE_KEY));

		const transferHbarSubmit = await transferHbarTx.execute(client);
		const transferHbarReceipt = await transferHbarSubmit.getReceipt(client);

		console.log(`\n20 HBAR transferred from user to treasury: ${transferHbarReceipt.status}\n`);

		// Associate the NFT with the user's account
		const associateTx = await new TokenAssociateTransaction()
			.setAccountId(process.env.ASHLEY_ACC_ID)
			.setTokenIds([tokenId])
			.freezeWith(client)
			.sign(PrivateKey.fromStringDer(process.env.ASHLEY_PRIVATE_KEY));

		const associateTxSubmit = await associateTx.execute(client);
		const associateTxReceipt = await associateTxSubmit.getReceipt(client);

		console.log(`NFT association with Ashley's account: ${associateTxReceipt.status}\n`);

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
			.addNftTransfer(tokenId, 1, process.env.MY_ACCOUNT_ID, process.env.ASHLEY_ACC_ID)
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

		res.status(200).json({ message: 'Tickets created successfully', tokenId });
	} catch (error) {
		console.error('Error creating tickets:', error);
		res.status(500).json({ error: 'Failed to create tickets' });
	}
});

app.post('/api/tickets/mint/:tokenId', async (req, res) => {
	const { tokenId } = req.params;
	const { accountId, accountKey } = req.body;


	const metadataLink = `${process.env.PINATA_URL}/ipfs/${metadataResult.IpfsHash}`;

	const shortenedMetadataLink = await shortenURL(metadataLink);

	if (Buffer.byteLength(shortenedMetadataLink) > 100) {
		throw new Error('Metadata too long even after shortening ' + Buffer.byteLength(shortenedMetadataLink));
	}

	// Mint tokens
	const mintNFT = new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata([Buffer.from(shortenedMetadataLink)])
		.freezeWith(client);



	//Mint tokens
});

app.listen(port, async () => {
	try {
		await connectToServer();
		console.log("Connected to MongoDB");

	}
	catch (err) {
		console.log(err);
	}
	console.log(`Server is running on port ${port}`);
});
