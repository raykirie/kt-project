import React from 'react';
import PropTypes from 'prop-types';

function URLList({ urls, onSelect }) {
    return (
        <div className="url-list">
            <h3>Список URL:</h3>
            <ul>
                {urls.map((url, index) => (
                    <li key={index}>
                        {url}
                        <button onClick={() => onSelect(url)}>Загрузить</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

URLList.propTypes = {
    urls: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default URLList;
