import './Navbar.scss';
import React, { useState } from 'react';

import ticketByte from '../../assets/ticketByte.svg';
import shoppingCart from '../../assets/shoppingCart.svg';
import user from '../../assets/userWhite.svg';

import Profile from '../Profile/Profile';
import Cart from '../Cart/Cart';

export default function NavBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  }

  return (
    <>
    {isProfileOpen && <Profile toggleProfile={toggleProfile} />}
    {isCartOpen && <Cart toggleCart={toggleCart} />}
    <div className="navbar">
      <div className="navbar-container">
        <a href="/Home"><img src={ticketByte} alt="ticketByte" /></a>
        

        <div className="navbar-links">
          <a href="/Events">Events</a>
          <a href="/MyTickets">My Tickets</a>
          <a href='/CreateTickets'>Create</a>
        </div>

        <div className="navbar-button-container">
          <div className="navbar-button">
            <button onClick={toggleProfile}>
              <img src={user} alt="user" />
            </button>
          </div>

          <div className="navbar-button">
            <button onClick={toggleCart}>
              <img src={shoppingCart} alt="shoppingCart" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
