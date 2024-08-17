import './EventCard.scss';

import React, { useContext } from 'react';
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { CartContext } from '../../contexts/CartContext';
import { useSnackbar } from '../../contexts/SnackbarContext'; // Import the useSnackbar hook

import EventPlaceHolderImage from '../../assets/eventPlaceholderImage.png';
import cart from '../../assets/shoppingCart.svg';

export default function EventCard({ event }) {
    const { metamaskAccountAddress } = useContext(GlobalAppContext);
    const { addToCart } = useContext(CartContext); 
    const { showSnackbar } = useSnackbar(); // Get the showSnackbar function

    let formattedDate = "";

    if (event.dateAndTime) {
        const date = new Date(event.dateAndTime);
        formattedDate = date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    const handleAddToCart = () => {
        addToCart(event);
        showSnackbar(`${event.title} added to cart!`, 'success'); 
    };

    return (
        <div className="event-card">
            <div className="event-card-image">
                <img src={event.image} alt src={EventPlaceHolderImage} />
            </div>

            <div className="event-card-container">
                <div className='event-card-info'>
                    <p>{formattedDate}
                        <br />
                        {event.venue} | {event.city}, {event.country}
                    </p>
                    <h3>{event.title}</h3>
                </div>
                <div className='event-card-buy'>
                    <button onClick={handleAddToCart}>
                        <img src={cart} alt="cart" />
                    </button>
                </div>
            </div>
        </div>
    );
}