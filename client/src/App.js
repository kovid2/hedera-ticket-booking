import React from 'react';
import TicketForm from './components/TicketForm';
import TicketHome from './TicketHome';
import { GlobalAppContextProvider } from './contexts/GlobalAppContext';
import ListAllEvents from './components/ListAllEvents';
import ListAllUserTickets from './components/ListAllUserTickets';

function App() {
  return (
    <GlobalAppContextProvider>
    <div className="App">
      <h1>Hedera Ticket Booking System</h1>
      <TicketForm />
      <TicketHome/>
      <ListAllEvents />
      <ListAllUserTickets />
    </div>
    </GlobalAppContextProvider>
  );
}

export default App;
