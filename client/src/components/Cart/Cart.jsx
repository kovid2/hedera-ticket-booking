import React, { useEffect, useContext } from 'react';

import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { connectToMetamask } from '../../services/metamaskService';
import { fetchUser } from '../../network/api';
import { CartContext } from '../../contexts/CartContext';

import './Cart.scss';
import '../../utilities/globals.scss';

import cartIcon from '../../assets/cartBlack.svg';
import x from '../../assets/xCloseGreen.svg';
import ethereum from '../../assets/ethereum.svg';

import TextButton from '../TextButton/TextButton';

export default function Cart({ toggleCart }) {

    const { cart, removeFromCart, clearCart } = useContext(CartContext);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);


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
                        <button onClick={() => removeFromCart(item.id)}>Remove</button>
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
                            <img src={ethereum} alt="ethereum" />
                            <h1>{total} </h1>
                        </div>

                        </div>
                    

                        <TextButton text="CHECKOUT" />
                    </div>
            </div>  

            <div className="blur-bg"></div>
        </>
    );
}
