// Cart.js
import React, { useEffect, useContext } from 'react';
import { AccountId } from "@hashgraph/sdk";
import { CartContext } from '../../contexts/CartContext';
import { mainNftTranferWrapper } from '../../services/hederaService';
import { GlobalAppContext } from "../../contexts/GlobalAppContext";
import { client } from '../../pages/TicketHome/TicketHome';

import './Cart.scss';
import '../../utilities/globals.scss';

import cartIcon from '../../assets/cartBlack.svg';
import x from '../../assets/xCloseGreen.svg';
import ethereum from '../../assets/ethereum.svg';

import TextButton from '../TextButton/TextButton';
import { useSnackbar } from '../../contexts/SnackbarContext'; // Import the useSnackbar hook

const myAccountId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);

export default function Cart({ toggleCart }) {
    const { metamaskAccountAddress } = useContext(GlobalAppContext);
    const { cart, removeFromCart, clearCart } = useContext(CartContext);
    const { showSnackbar } = useSnackbar(); // Get the showSnackbar function
    const [disableButton, setDisableButton] = React.useState(false);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const buyTicket = async (event) => {
        try{
           
            showSnackbar(`Buying ticket for ${event.title}`, 'success'); // Use snackbar for buying ticket
            await mainNftTranferWrapper(myAccountId, metamaskAccountAddress, event, client);
            showSnackbar(`Ticket for ${event.title} bought successfully!`, 'success'); // Use snackbar for buying ticket success
        }
        catch (error) {
            showSnackbar(`There was an error buying ticket for ${event.title}`, 'error'); // Use snackbar for buying ticket error
        } 
    };

    const checkout = async () => {
        setDisableButton(true);
        if (!metamaskAccountAddress) {
            showSnackbar("You need to connect your MetaMask wallet.", 'error'); // Show snackbar if MetaMask is not connected
            return;
        }

        try {
            for (let item of cart) {
                await buyTicket(item);
            }
            clearCart();
            showSnackbar("Thank you for buying tickets with ticketByte!", 'success'); // Use snackbar for checkout success
        } catch (error) {
            showSnackbar("There was an error with your purchase.", 'error'); // Use snackbar for errors
        } finally
        {
            setDisableButton(false);
        }
    };

    return (
        <>
            <div className="cart">
                <div className="cart-container">
                    <div className="cart-header">
                        <img src={cartIcon} alt="cart" />
                        <h1>YOUR CART</h1>
                        <button onClick={toggleCart} className="x">
                            <img src={x} alt="x" />
                        </button>
                    </div>
                    <p>We don't batch all the trasactions together. So when you are buying the tickets you will have to approve each transaction seperately. You maybe asked for additional approvals if ticket token is not associated with your account.</p>
                    <div className="divider-tab"></div>
                    <div className="cart-content">
                        {cart.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id}>
                                    <h4>{item.title}</h4>
                                    <p>Price: ${item.price}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <button disabled={disableButton} onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="cart-footer">
                    <div className="cart-footer-text">
                        <div className="total">
                            <h1>TOTAL</h1>
                        </div>
                        <div className="amount">
                            <img style={{
                                width: '30px'
                            }} src={ethereum} alt="ethereum" />
                            <h1>{total}</h1>
                        </div>
                    </div>
                    <button onClick={checkout} className="submit-button" disabled={disableButton}>
        {disableButton ? 'Processing...' : 'Checkout'}
      </button>
                </div>
            </div>

            <div className="blur-bg"></div>
        </>
    );
}