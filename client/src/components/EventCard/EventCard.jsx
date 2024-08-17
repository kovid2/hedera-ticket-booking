import './EventCard.scss';

import React, { useState, useContext } from 'react';
import { client } from '../../pages/TicketHome/TicketHome';
import { mainNftTranferWrapper } from '../../services/hederaService';
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { AccountId } from "@hashgraph/sdk";
import { CartContext } from '../../contexts/CartContext';

import EventPlaceHolderImage from '../../assets/eventPlaceholderImage.png';
import cart from '../../assets/shoppingCart.svg';

const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);

export default function EventCard({ event }) {
    const { metamaskAccountAddress } = useContext(GlobalAppContext);
    const { addToCart } = useContext(CartContext); 
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

    const buyTicket = async (event) => {
        alert(`Buying ticket for ${event.title}`);
        await mainNftTranferWrapper(myAccountId, metamaskAccountAddress, event, client);
    }

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
                    <button onClick={() => addToCart(event)}>
                        <img src={cart} alt="cart" />
                    </button>
                </div>
            </div>
        </div>
    )
}
