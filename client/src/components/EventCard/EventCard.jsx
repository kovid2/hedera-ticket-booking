import './EventCard.scss';

import EventPlaceHolderImage from '../../assets/eventPlaceholderImage.png';

export default function EventCard({ event }) {
    
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
    return (
        <div className="event-card">
            <div className="event-card-image">
                <img src={event.image} alt src={EventPlaceHolderImage} />
            </div>

            <div className="event-card-info">
                <p>{formattedDate}
                    <br />
                    {event.venue} | {event.city}, {event.country}
                </p> 
                <h3>{event.title}</h3>
            </div>
        </div>
    )
}

