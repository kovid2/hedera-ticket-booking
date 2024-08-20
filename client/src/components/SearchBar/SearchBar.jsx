import { searchSuggestions } from '../../network/api';
import { useState } from 'react';
import './SearchBar.scss';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    let debounceTimeout;

    const handleSearchChange = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length >= 2) {
            setIsLoading(true);
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                try {
                    const response = await searchSuggestions(term);
                    console.log(suggestions);
                    setSuggestions(response);
                } catch (error) {
                    console.error('Error fetching suggestions', error);
                } finally {
                    setIsLoading(false);
                }
            }, 300); // 300ms debounce
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion); // Update search term with the selected suggestion
        setSuggestions([]); // Clear suggestions after selection
        navigate(`/search?search=${encodeURIComponent(suggestion)}`); // Navigate to search results
    };

    const handleSearchButtonClick = () => {
        navigate(`/search?search=${encodeURIComponent(searchTerm)}`); // Navigate to search results with the current search term
    };

    const highlightText = (text, term) => {
        if (term.length === 0) {
            return "";
        }
        if (!text) {
            return "";
        }
        //strip whitespace
        term = term.trim();
        text = text.trim();

        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return parts.map((part, index) => (
            <span
                key={index}
                style={
                    part.toLowerCase() === term.toLowerCase()
                        ? { fontWeight: 'bold', color: '#0066cc' }
                        : {}
                }
            >
                {part}
            </span>
        ));
    };

    return (
        <>
        <div className="search-container">
            <div className="search-bar">
                <div className="search-bar-text">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for events by venue, city, artist, etc."
                    />

                </div>
                <div className="search-bar-button">
                    <button onClick={handleSearchButtonClick}>Search</button>
                </div>
            </div>
            {isLoading && <div className="no-suggestions">Loading...</div>}
            {suggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
             
                    {suggestions.map((suggestion, index) => (
                        <>
                            {suggestion.description &&
                                <li key={`${index}-desc`} onClick={() => handleSuggestionClick(suggestion.description)}>
                                    {highlightText(suggestion.description, searchTerm)}
                                </li>
                            }
                            {suggestion.venue &&
                                <li key={`${index}-venue`} onClick={() => handleSuggestionClick(suggestion.venue)}>
                                    {highlightText(suggestion.venue, searchTerm)}
                                </li>
                            }
                            {suggestion.city &&
                                <li key={`${index}-city`} onClick={() => handleSuggestionClick(suggestion.city)}>
                                    {highlightText(suggestion.city, searchTerm)}
                                </li>
                            }
                            {suggestion.country &&
                                <li key={`${index}-country`} onClick={() => handleSuggestionClick(suggestion.country)}>
                                    {highlightText(suggestion.country, searchTerm)}
                                </li>
                            }
                            {suggestion.title &&
                                <li key={`${index}-title`} onClick={() => handleSuggestionClick(suggestion.title)}>
                                    {highlightText(suggestion.title, searchTerm)}
                                </li>
                            }
                        </>
                    ))}
                </ul>
            )}
            {suggestions && suggestions.length === 0 && !isLoading && searchTerm.length >= 2 && (
                <div className="no-suggestions">No suggestions found</div>
            )}
            </div>
        </>
    );
}
