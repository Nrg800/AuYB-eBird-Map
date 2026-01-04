export function addPointLayerPopups(map, layerId) {
    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        const html = `
            <strong>${f.properties.locationName}</strong><br>            
            Date Last Visited: ${f.properties.visitlast}<br>
            Total Species: ${f.properties.totalSpecies}<br>
            Top Observer: ${f.properties.topObserver}<br>
            Rarest Species: ${f.properties.rarestSpecies} (${f.properties.rarestSpeciesScore})<br>
            Total Records: ${f.properties.totalRecords}<br>
            Total Individuals Seen: ${f.properties.totalIndividualsSeen}<br>
            Visited by: ${f.properties.visitedBy}<br>
            Observer Species: ${f.properties.observerSpeciesCounts}<br>
        `;
        popup.setLngLat(f.geometry.coordinates).setHTML(html).addTo(map);
    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}