import React from 'react';
import PropTypes from 'prop-types';

function DownloadStatus({ status }) {
    return (
        <div className="download-status">
            <h3>Статус загрузки для {status.url}:</h3>
            <p>Размер: {status.receivedSize} KB</p>
            <p>Прогресс: {status.downloadProgress}%</p>
        </div>
    );
}

DownloadStatus.propTypes = {
    status: PropTypes.shape({
        url: PropTypes.string.isRequired,
        receivedSize: PropTypes.number.isRequired,
        downloadProgress: PropTypes.number.isRequired,
    }).isRequired,
};

export default DownloadStatus;
