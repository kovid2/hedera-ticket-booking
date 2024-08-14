import './SearchBar.scss';

export default function SearchBar() {
    return (
        <div className="search-bar">
            <div className="search-bar-text">
                <input type="text" placeholder="Search by Artist, Event, or Venue" />
            </div>
            <div className="search-bar-button">
                <button>Search</button>
            </div>
        </div>
    )
}