// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenMintTransaction } = require('@hashgraph/sdk');
require('dotenv').config();
const FormData = require('form-data')
//const { create } = require('ipfs-http-client'); 

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

// IPFS client setup
//const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// Pinata API setup
// const pinFileToIPFS = async (filePath) => {
//     const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
//     const data = new FormData();
//     data.append('file', fs.createReadStream(filePath));

//     const response = await axios.post(url, data, {
//         headers: {
//             Authorization: `Bearer ${process.env.PINATA_API_KEY}`,
//         }
//     });

//     if (response.status !== 200) {
//         throw new Error(`Pinata pinFileToIPFS request failed: ${response.statusText}`);
//     }

//     return response.data;
// };

const pinFileToIPFS = async (filePath) => {
    const formData = new FormData();
    
    const file = fs.createReadStream(filePath)
    formData.append('file', file)
    
    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${process.env.PINATA_API_KEY}`
        }
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
}


// API endpoint to create tickets
app.post('/api/tickets', upload.fields([{ name: 'reservationImage' }, { name: 'ticketImage' }]), async (req, res) => {
	try {
		//const {price, currency, numTickets, title, venue, date, city, country} = req.body;
		const {price, currency, numTickets} = req.body;
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
 
		 // Metadata to be pushed to IPFS
		 const metadata = {
			 price,
			 currency,
			 numTickets,
			 reservationImage: `${process.env.PINATA_URL}/ipfs/${reservationImageResult.IpfsHash}`,
			 ticketImage: `${process.env.PINATA_URL}/ipfs/${ticketImageResult.IpfsHash}`,
		 };

        // Upload metadata to IPFS using Pinata
        const metadataFilePath = path.join(__dirname, 'metadata', 'metadata.json');
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata));
        const metadataResult = await pinFileToIPFS(metadataFilePath);

		const supplyKey = PrivateKey.generate();

		const tokenCreateTx = await new TokenCreateTransaction()
			.setTokenName("EventTicket")
			.setTokenSymbol("ETK")
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setInitialSupply(0)
			.setSupplyType(TokenSupplyType.Finite)
			.setSupplyKey(supplyKey)
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

		const maxTransactionFee = new Hbar(20);

		// Mint tokens
		const mintNFT = new TokenMintTransaction()
			.setTokenId(tokenId)
			.setMetadata(`${process.env.PINATA_URL}/ipfs/${metadataResult.ipfsHash}`)
			.freezeWith(client)

		
		const mintNFTSign = await mintNFT.sign(supplyKey);
		const mintNFTSubmit = await mintNFTSign.execute(client);

		const mintNFTReceipt = await mintNFTSubmit.getReceipt(client);
		console.log(`Minted NFT with Token ID: ` + tokenId);

		 //Create the associate transaction and sign with Users key
		 const associateTx = new TokenAssociateTransaction()
		 .setAccountId(process.env.ASHLEY_ACC_ID)
		 .setTokenIds([tokenId])
		 .freezeWith(client)
		 .sign(process.env.ASHLEY_PRIVATE_KEY);

		 //Submit the associate transaction
		 const associateTxSubmit = await associateTx.execute(client);

		 //Get the associate transaction receipt
		 const associateTxReceipt = await associateTxSubmit.getReceipt(client);

		 console.log(
			`NFT association with Ashley's account: ${associateTxReceipt.status}\n`
		  );


		  // Check the balance before the transfer for the treasury account
			var balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.MY_ACCOUNT_ID)
			.execute(client);
			console.log(
			`Treasury balance: ${balanceCheckTx.tokens._map.get(
				tokenId.toString()
			)} NFTs of ID ${tokenId}`
			);

			// Check the balance before the transfer for the user account
			balanceCheckTx = await new AccountBalanceQuery()
			.setAccountId(process.env.ASHLEY_ACC_ID)
			.execute(client);
			console.log(
			`Ashley's balance: ${balanceCheckTx.tokens._map.get(
				tokenId.toString()
			)} NFTs of ID ${tokenId}`
			);


			


		//res.status(200).json({ message: 'Tickets created successfully', tokenId });
	} catch (error) {
		console.error('Error creating tickets:', error);
		res.status(500).json({ error: 'Failed to create tickets' });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
