import React from 'react';
import TicketForm from './components/TicketForm';
import TicketHome from './pages/TicketHome/TicketHome';
import { GlobalAppContextProvider } from './contexts/GlobalAppContext';
import ListAllEvents from './components/ListAllEvents/ListAllEvents';
import ListAllUserTickets from './components/ListAllUserTickets';

function App() {
  return (
    <GlobalAppContextProvider>
    <div className="App">
      <TicketHome/>
      <h1>Hedera Ticket Booking System</h1>
      <TicketForm />
      <ListAllEvents />
      <ListAllUserTickets />
    </div>
    </GlobalAppContextProvider>
  );
}

export default App;
