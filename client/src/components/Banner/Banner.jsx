import './Banner.scss';

export default function Banner({ image, eventName, eventOrganizer }) {

    return (
        <div className="banner">
            
            <img src={image} alt="banner" />

            <div className="banner-text">
                <h1>{eventOrganizer}</h1>
                <h3>{eventName}</h3>
                
                <button>Find Tickets</button>
            </div>
        </div>
    )
}
