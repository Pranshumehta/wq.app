import React from 'react';
import PropTypes from 'prop-types';

export default function Map({ children }) {
    return (
        <div style={{ flex: '1', minHeight: 200 }}>
            <p>
                No map integration library loaded - use @wq/leaflet or
                @wq/mapbox.
            </p>
            {children}
        </div>
    );
}

Map.propTypes = {
    children: PropTypes.node
};
