import './Footer.scss';

import ticketByte from '../../assets/ticketByte.svg';

export default function Footer() {
    return (
        <div className="footer">

            <div className="footer-container">

                <img src={ticketByte} alt="ticketByte" />    

                <div className='divider'></div>
            </div>

        </div>
    )
}