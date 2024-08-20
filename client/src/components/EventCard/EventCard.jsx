import './EventCard.scss';

import React, { useContext } from 'react';
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { CartContext } from '../../contexts/CartContext';
import { useSnackbar } from '../../contexts/SnackbarContext'; // Import the useSnackbar hook

import EventPlaceHolderImage from '../../assets/eventPlaceholderImage.png';
import cartImg from '../../assets/shoppingCart.svg';

export default function EventCard({ event }) {
    const { metamaskAccountAddress } = useContext(GlobalAppContext);
    const { addToCart , cart} = useContext(CartContext); 
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
        if (!metamaskAccountAddress) {
            showSnackbar('Please connect your wallet to add events to cart.', 'error');
            return;
        }
        else{
            //if event id is in cart say you already have this event in cart
            //if not add to cart
            console.log(event);
            if (cart.find(cartItem => cartItem.eventID === event.eventID)) {
                showSnackbar(`You already have ${event.title} in your cart! Buying is limited to one ticket per account.`, 'error');
                return;
            }
            else {
                addToCart(event);
             showSnackbar(`${event.title} added to cart!`, 'success'); 
            }
        }
    };

    return (
        <div className="event-card">
            <div className="event-card-image">
                <img  alt={"cart"} src={EventPlaceHolderImage} />
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
                        <img src={cartImg} alt="cart" />
                    </button>
                </div>
            </div>
        </div>
    );
}