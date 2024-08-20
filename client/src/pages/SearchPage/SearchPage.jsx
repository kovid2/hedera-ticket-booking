import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { searchEvents } from '../../network/api';
import EventCard from '../../components/EventCard/EventCard';
import SearchBar from '../../components/SearchBar/SearchBar';

export default function SearchPage() {
	const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
        // Parse the query parameters
        const queryParams = new URLSearchParams(location.search);
        const term = queryParams.get('search') || '';
        setSearchTerm(term);

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await searchEvents(term);
				console.log(response);
                setResults(response);
            } catch (error) {
                console.error('Error fetching search results', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (term) {
            fetchResults();
        } else {
            setResults([]);
            setIsLoading(false);
        }
    }, [location.search]);
  return (
	<>
	<SearchBar />
	<div className="search-page">
	<div className="home-content">
		        <h1>SEARCH RESULTS FOR {`${searchTerm}`}</h1>
				<div className="line-accent"></div>
				<div className="events-container">
					{isLoading ? (
						<p className="center-text"> Loading...</p>
					) : results.length > 0 ? (
						results.map((event) => (
							<div key={event.eventID} className="event-card">
								<EventCard event={event} />
							</div>
						))
					) : (
						<p className="center-text">No events found.</p>
					)}
				</div>
			</div>
			</div>
		
	</>
  )
}
