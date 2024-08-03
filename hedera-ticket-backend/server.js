// server.js
const express = require('express');
const multer = require('multer');
const { Client, PrivateKey, AccountId, TokenCreateTransaction, TokenMintTransaction } = require('@hashgraph/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Hedera client setup
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(process.env.MY_ACCOUNT_ID), PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

// API endpoint to create tickets
app.post('/api/tickets', upload.fields([{ name: 'reservationImage' }, { name: 'ticketImage' }]), async (req, res) => {
  try {
    const { price, currency, numTickets } = req.body;
    const reservationImage = req.files['reservationImage'][0];
    const ticketImage = req.files['ticketImage'][0];

    // TODO: Implement NFT creation and management using Hedera SDK

    // Example: Create a new token
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("EventTicket")
      .setTokenSymbol("ETK")
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(AccountId.fromString(process.env.MY_ACCOUNT_ID))
      .execute(client);

    const tokenCreateReceipt = await tokenCreateTx.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;

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
