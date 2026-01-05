export function addPointLayerPopups(map, layerId) {
    const popup = new mapboxgl.Popup({ 
        closeButton: false, 
        closeOnClick: false,
        maxWidth: 'none', 
        className: 'custom-bird-popup' 
    });

    // Add a <style> block to the document head to override Mapbox defaults
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-bird-popup .mapboxgl-popup-content {
            background-color: #2c343f;
            color: #ffffff;
            padding: 0;
            border-radius: 4px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .custom-bird-popup .mapboxgl-popup-tip {
            border-top-color: #2c343f !important;
            border-bottom-color: #2c343f !important;
        }
    `;
    document.head.appendChild(style);

    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;

        const html = `
            <div style="display: inline-block; min-width: 200px; width: min-content;">
                <div style="padding: 3px 15px; border-bottom: 1px solid #3f4752; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="font-size: 24px; color: #ffffff; ">&#128330;</span>
                    <strong style="font-size: 13px; font-weight: 500; white-space: normal; color: #ffffff; line-height: 1.4; word-break: break-word;">
                        ${f.locationName}
                    </strong>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px;">
                    ${[
                        ['Total Species', f.totalSpecies],
                        ['Rarest Species', `${f.rarestSpecies} (${f.rarestSpeciesScore})`],
                        ['Date Last Visited', f.visitlast],
                        ['Top Observer', f.topObserver],
                        ['Total Records', f.totalRecords],
                        ['Total Individuals Seen', f.totalIndividualsSeen],
                        ['Visited by', f.visitedBy],
                        ['Observer Species', f.observerSpeciesCounts]
                    ].map(([label, value]) => `
                        <tr>
                            <td style="padding: 3px 20px 3px 10px; color: #9ca3af; white-space: nowrap;">${label}</td>
                            <td style="padding: 3px 15px 3px 5px; text-align: right; color: #ffffff; white-space: nowrap; font-weight: 500;">${value}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;

        popup.setLngLat(coords).setHTML(html).addTo(map);
    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}
