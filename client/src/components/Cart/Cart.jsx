import React, { useEffect, useContext } from 'react';

import { GlobalAppContext } from '../../contexts/GlobalAppContext';
import { connectToMetamask } from '../../services/metamaskService';
import { fetchUser } from '../../network/api';

import './Cart.scss';
import '../../utilities/globals.scss';

import cart from '../../assets/cartBlack.svg';
import x from '../../assets/xCloseGreen.svg';
import metamask from '../../assets/metaMaskLogo.png';

import TextButton from '../TextButton/TextButton';

export default function Profile({ toggleCart }) {

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
            </div>  

            <div className="blur-bg"></div>
        </>
    );
}
