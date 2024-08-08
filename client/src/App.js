import React from 'react';
import TicketForm from './components/TicketForm';
import { MetaMaskWallet } from './components/MetaMaskWallet';

function App() {
  return (
    <div className="App">
      <h1>Hedera Ticket Booking System</h1>
      <TicketForm />
      {/* <MetaMaskWallet /> */}
    </div>
  );
}

export default App;
