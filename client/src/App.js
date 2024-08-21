import React, {useContext,useEffect} from 'react';
import TicketForm from './components/TicketForm';
import TicketHome from './pages/TicketHome/TicketHome';
import { GlobalAppContext, GlobalAppContextProvider } from './contexts/GlobalAppContext';
import { CartProvider } from './contexts/CartContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import ListAllEvents from './components/ListAllEvents/ListAllEvents';
import ListAllUserTickets from './components/ListAllUserTickets';
import { Route, Routes  } from 'react-router-dom';
import NavBar from './components/Navbar/Navbar';
import CreateTickets from './pages/CreateTickets/CreateTickets';
import Footer from './components/Footer/Footer';
import SearchPage from './pages/SearchPage/SearchPage';
import MyTickets from './pages/MyTickets/MyTickets';
import Terms from './pages/TnC/Terms';
function App() {
  const { metamaskAccountAddress, setMetamaskAccountAddress } = useContext(GlobalAppContext);
  useEffect(() => {
    let addr = localStorage.getItem('address');
    if(addr){
      console.log(addr);
      setMetamaskAccountAddress(addr);
    }
  },[]);
  return (
    <SnackbarProvider>

    <CartProvider>
   
    <div className="App">
    <NavBar />
    <Routes>
      <Route path="/" element={<TicketHome />} />
      <Route path='/createTicket' element = {<CreateTickets />} />
      <Route path='/profile' element = {<MyTickets/>} />
      <Route path='/search' element = {<SearchPage />} />
      <Route path='/terms' element= {<Terms/>} />
    </Routes>
    <Footer />
    </div>
    </CartProvider>

    </SnackbarProvider>
  );
}

export default App;
