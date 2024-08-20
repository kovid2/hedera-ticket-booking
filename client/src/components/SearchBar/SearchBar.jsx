import { searchSuggestions } from '../../network/api';
import { useState } from 'react';
import './SearchBar.scss';

export default function SearchBar() {

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleSearchChange = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length >= 2) {
            try {
                const response = await searchSuggestions(term);
                console.log(response.data);
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions', error);
            }
        } else {
            setSuggestions([]);
        }
    };


    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion); // Update search term with the selected suggestion
        setSuggestions([]); // Clear suggestions after selection
    };

    return (
        <div className="search-bar">
            <div className="search-bar-text">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search for events by venue, city, artist, etc."
                />
                {suggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(suggestion.venue || suggestion.city || suggestion.country || suggestion.description || suggestion.title)}>
                                {suggestion.venue || suggestion.city || suggestion.country || suggestion.description || suggestion.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="search-bar-button">
                <button>Search</button>
            </div>
        </div>
    )
}