import React from 'react';
import TicketForm from './components/TicketForm';
import TicketHome from './pages/TicketHome/TicketHome';
import { GlobalAppContextProvider } from './contexts/GlobalAppContext';
import { CartProvider } from './contexts/CartContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import ListAllEvents from './components/ListAllEvents/ListAllEvents';
import ListAllUserTickets from './components/ListAllUserTickets';
import { Route, Routes  } from 'react-router-dom';
import NavBar from './components/Navbar/Navbar';
function App() {
  return (
    <GlobalAppContextProvider>
    <CartProvider>
    <SnackbarProvider>
    <div className="App">
    <NavBar />
    <Routes>
      <Route path="/" element={<TicketHome />} />
      <Route path='/createTicket' element = {<TicketForm />} />
      <Route path='/profile' element = {<ListAllUserTickets />} />
    </Routes>
      <h1>Hedera Ticket Booking System</h1>
      <TicketForm />
      <ListAllUserTickets />
    </div>
    </SnackbarProvider>
    </CartProvider>
    </GlobalAppContextProvider>
  );
}

export default App;
