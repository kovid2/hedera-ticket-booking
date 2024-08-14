import './IconButton.scss';

export default function TextButton({ image, onClick }) {
    return (
        <button className="text-button" onClick={onClick}>
            <img src={image}></img>
        </button>
    )
}