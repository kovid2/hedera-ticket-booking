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
import CreateTickets from './pages/CreateTickets/CreateTickets';
import Footer from './components/Footer/Footer';
import SearchPage from './pages/SearchPage/SearchPage';
function App() {
  return (
    <SnackbarProvider>
    <GlobalAppContextProvider>
    <CartProvider>
   
    <div className="App">
    <NavBar />
    <Routes>
      <Route path="/" element={<TicketHome />} />
      <Route path='/createTicket' element = {<CreateTickets />} />
      <Route path='/profile' element = {<ListAllUserTickets />} />
      <Route path='/search' element = {<SearchPage />} />
    </Routes>
    <Footer />
    </div>
 
    </CartProvider>
    </GlobalAppContextProvider>
    </SnackbarProvider>
  );
}

export default App;
