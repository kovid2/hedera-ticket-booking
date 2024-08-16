import React, { useEffect, useContext } from 'react';

import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { connectToMetamask } from '../../services/metamaskService';
import { fetchUser } from '../../network/api';

import './Cart.scss';
import '../../utilities/globals.scss';

import cart from '../../assets/cartBlack.svg';
import x from '../../assets/xCloseGreen.svg';
import ethereum from '../../assets/ethereum.svg';

import TextButton from '../TextButton/TextButton';

export default function Profile({ toggleCart }) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    let total = 0;

    return (
        <>
            <div className="cart">
                <div className="cart-container">
                    <div className="cart-header">
                        <img src={cart} alt="cart" />
                        <h1>YOUR CART</h1>
                        <button onClick={toggleCart} className="x">
                            <img src={x} alt="x" />
                        </button>
                    </div>

                    <div className="divider-tab"></div>

                    <div className="cart-content">

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
