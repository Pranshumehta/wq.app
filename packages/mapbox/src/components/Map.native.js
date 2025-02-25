import React, { useEffect, useMemo } from 'react';
import { usePlugin } from '@wq/react';
import PropTypes from 'prop-types';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { useMapState } from '@wq/map';

export default function Map({ bounds, children, mapProps, containerStyle }) {
    const {
        accessToken = null,
        dragRotate: rotateEnabled,
        pitchWithRotate: pitchEnabled = mapProps.dragRotate
    } = mapProps || {};
    useEffect(() => {
        MapboxGL.setAccessToken(accessToken);
    }, [accessToken]);

    const { ready } = usePlugin('map'),
        fitBounds = useMemo(() => {
            const [[ymin, xmin], [ymax, xmax]] = bounds;
            return { sw: [xmin, ymin], ne: [xmax, ymax] };
        }, [bounds]),
        state = useMapState(),
        basemap = state && state.basemaps.filter(basemap => basemap.active)[0];

    let style;
    if (basemap) {
        if (basemap.type === 'vector-tile') {
            style = basemap.url;
        } else if (basemap.type === 'tile') {
            const urls = [];
            if (basemap.url.match('{s}')) {
                (basemap.subdomains || ['a', 'b', 'c']).forEach(s =>
                    urls.push(basemap.url.replace('{s}', s))
                );
            } else {
                urls.push(basemap.url);
            }
            style = {
                version: 8,
                sources: {
                    [basemap.name]: {
                        type: 'raster',
                        tiles: urls
                    }
                },
                layers: [
                    {
                        id: basemap.name,
                        type: 'raster',
                        source: basemap.name
                    }
                ]
            };
        }
    } else {
        style = null;
    }

    const mapRef = React.useRef(),
        setRef = React.useCallback(ref => {
            mapRef.current = ref;
            ready(ref);
        }, []);

    containerStyle = {
        flex: 1,
        minHeight: 200,
        ...containerStyle
    };

    return (
        <MapboxGL.MapView
            styleURL={style}
            ref={setRef}
            rotateEnabled={rotateEnabled}
            pitchEnabled={pitchEnabled}
            attributionEnabled={!!accessToken}
            logoEnabled={!!accessToken}
            style={containerStyle}
        >
            <MapboxGL.Camera
                bounds={fitBounds}
                ref={ref => (mapRef.current.camera = ref)}
                animationDuration={0}
            />
            {children}
        </MapboxGL.MapView>
    );
}

Map.propTypes = {
    bounds: PropTypes.array,
    children: PropTypes.node,
    mapProps: PropTypes.object,
    containerStyle: PropTypes.object
};
