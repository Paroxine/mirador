function setup(map) {
    /* Fonctions pour créer des points au format GeoJSON sur la carte */
    function newBateme(longitude, latitude, name, content) {
        let point = {
            "type": "Feature",
            "properties": {
                "name": name,
                "amenity": name,
                "popupContent": content
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    longitude,
                    latitude
                ]
            }
        };

        return point;
    }

    /* Fonctions pour créer des lignes au format  GeoJSON sur la carte */
    function newLine(lnglats, name, content) {
        let line = {
            "type": "Feature",
            "properties": {
                "Name": name,
                "amenity": name,
                "popupContent": content,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": lnglats
            }
        };

        return line;
    }

    /* Fonctions pour créer des polygones remplis au format  GeoJSON sur la carte */
    function newPolygon(lnglats, name, content) {
        let poly = {
            "type": "Feature",
            "properties": {
                "Name": name,
                "amenity": name,
                "popupContent": content
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [lnglats] // Note il faut ici un tableau de matrices de coordonnées
            }
        };

        return poly;
    }
    // Fonction et structures pour le style d'affichage

    // Pour activer les popups
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
        // Pour afficher le nom des points  (rendu pas terrible: A commenter au besoin)
        if (feature.properties && feature.properties.name) {
            layer.bindTooltip(feature.properties.name, { "permanent": true, "opacity": 0.6, "direction": "center" });
        }
    }

    // Style pour le point de depart de la mission
    var geojsonMarkerOptionsPI = {
        radius: 10,
        fillColor: "#ff40ff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Style pour les batemes terrains
    var geojsonMarkerOptions = {
        radius: 10,
        fillColor: "#00f900",
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Style pour l'objectif principal
    var geojsonMarkerOptionsO1 = {
        radius: 12,
        fillColor: "#fffb00",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Positionnement du point de départ
    var pi = newBateme(1.9003980384661678, 48.86572575845909, "PI", "Point initial");
    L.geoJSON(pi, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptionsPI);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Potiionnement des batêmes terrains entre lima delta et lima 1
    var t101 = newBateme(1.8952096010785984, 48.86451494662531, "T101", "Bateme T101");
    L.geoJSON(t101, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t102 = newBateme(1.8969353294333824, 48.865468409298174, "T102", "Bateme T102");
    L.geoJSON(t102, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t103 = newBateme(1.8965145260952863, 48.86396815924842, "T103", "Bateme T103");
    L.geoJSON(t103, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t104 = newBateme(1.898651053039966, 48.865551112707244, "T104", "Bateme T104");
    L.geoJSON(t104, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t105 = newBateme(1.8986559427967953, 48.863638329217615, "T105", "Bateme T105");
    L.geoJSON(t105, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t106 = newBateme(1.8976019798947141, 48.86414597897069, "T106", "Bateme T106");
    L.geoJSON(t106, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t107 = newBateme(1.8956307894623794, 48.86349289217694, "T107", "Bateme T107");
    L.geoJSON(t107, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Potiionnement des batêmes terrains entre lima 1 et lima 2
    var t201 = newBateme(1.892480848289626, 48.8662966123767, "T201", "Bateme T201");
    L.geoJSON(t201, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t202 = newBateme(1.8926806798026192, 48.86545317291707, "T202", "Bateme T202");
    L.geoJSON(t202, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t203 = newBateme(1.8955155525566045, 48.865327702552094, "T203", "Bateme T203");
    L.geoJSON(t203, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t204 = newBateme(1.894011025749101, 48.864949389249176, "T204", "Bateme T204");
    L.geoJSON(t204, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t205 = newBateme(1.89302394347491, 48.864461595868434, "T205", "Bateme T205");
    L.geoJSON(t205, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t206 = newBateme(1.8919623665687808, 48.86353829871584, "T206", "Bateme T206");
    L.geoJSON(t206, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t207 = newBateme(1.8905714483654934, 48.86356936299955, "T207", "Bateme T207");
    L.geoJSON(t207, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t208 = newBateme(1.892759100582704, 48.86222641181058, "T208", "Bateme T208");
    L.geoJSON(t208, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Potiionnement des batêmes terrains entre lima 2 et lima 3
    var t301 = newBateme(1.8890360330304312, 48.863069060521106, "T301", "Bateme T301");
    L.geoJSON(t301, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t302 = newBateme(1.8871512786506768, 48.861777581120165, "T302", "Bateme T302");
    L.geoJSON(t302, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t303 = newBateme(1.8876277599393603, 48.86250564246023, "T303", "Bateme T303");
    L.geoJSON(t303, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t304 = newBateme(1.887356653306071, 48.86485711441206, "T304", "Bateme T304");
    L.geoJSON(t304, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);
    var t305 = newBateme(1.8870030806996707, 48.86444546066956, "T305", "Bateme T305");
    L.geoJSON(t305, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Potiionnement des batêmes terrains au dela de lima 3
    var t401 = newBateme(1.884748671928797, 48.866320493218105, "T401", "Bateme T401");
    L.geoJSON(t401, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Positionnement de l'objectif principal
    var O1 = newBateme(1.8883959904580336, 48.86413486120035, "O1", "Objectif principal");
    L.geoJSON(O1, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptionsO1);
        }, onEachFeature: onEachFeature
    }).addTo(map);

    // Positionnement des limas
    var limaDelta = newLine([[1.9002281862403763, 48.86619643087159], [1.89946850511299, 48.86217496404879]], "Lima Delta", "Lima Delta");
    L.geoJSON(limaDelta, { "color": "#00fdff", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    var lima1 = newLine([[1.8970779506379003, 48.866777799234676], [1.8947111846351803, 48.86417029857195], [1.8937181151978115, 48.86321222990392], [1.8937998936958347, 48.862613607448274], [1.89386002521613, 48.86086274211662]], "Lima 1", "Lima 1");
    L.geoJSON(lima1, { "color": "#00fdff", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    var lima2 = newLine([[1.8919518681508363, 48.86103090687899], [1.8910473434086639, 48.861420555409296], [1.8902922887166007, 48.862073151049536], [1.8896913383930636, 48.86358014201799], [1.8900374789228638, 48.86512998669261], [1.8912849400993432, 48.86857605193831]], "Lima 2", "Lima 2");
    L.geoJSON(lima2, { "color": "#00fdff", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    var lima3 = newLine([[1.8904864535081396, 48.86873353800636], [1.8841524517822108, 48.86440998953285]], "Lima 3", "Lima 3");
    L.geoJSON(lima3, { "color": "#00fdff", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    // Positionnement des limites du terrain au Nord et au Sud
    var limiteNord = newLine([[1.9009914726010717, 48.8658186784791], [1.887358739591016, 48.86871122300829]], "Limite Nord", "Limite Nord");
    L.geoJSON(limiteNord, { "color": "#ff0000", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    var limiteSud = newLine([[1.8841154645750187, 48.86568707144434], [1.8863491630381597, 48.8603823733663], [1.8938395358996976, 48.86145835442208], [1.8937998936958347, 48.862613607448274], [1.9003415691743908, 48.86268365525327]], "Limite Sud", "Limite Sud");
    L.geoJSON(limiteSud, { "color": "#ff0000", "weight": 3, onEachFeature: onEachFeature }).addTo(map);

    // Postionement des limites des zones d'exclusion
    var zoneExclusion1 =
        newPolygon([[1.8847566934655602, 48.86412499360446], [1.886112820069873, 48.86453195115618], [1.8873358393243926, 48.86240108008908], [1.8857276324107901, 48.861823204402675]], "Zone exclusion 1", "Zone exclusion 1: Interdit à tous les satellites aériens");
    L.geoJSON(zoneExclusion1, { "color": "#ff0000", "weight": 3, "fill": "#ff0000", onEachFeature: onEachFeature }).addTo(map);

    var zoneExclusion2 = newPolygon([[1.887358739591016, 48.86871122300829], [1.8910393392764302, 48.867897726824175], [1.8902630053538214, 48.86575297529584], [1.887364147897822, 48.867083619874386]], "Zone exclusion 2", "Zone exclusion 2: Interdit à tout véhicule et satellite");
    L.geoJSON(zoneExclusion2, { "color": "#ff0000", "weight": 3, fill: "#ff0000", onEachFeature: onEachFeature }).addTo(map);

    var zoneExclusion3 = newPolygon([[1.8905062058014295, 48.863874601031576], [1.8905124590573943, 48.86357941068345], [1.8898039908699487, 48.86357277057054], [1.8895627551480632, 48.86360499218645], [1.8885573758220289, 48.863355469516364], [1.8882525877942584, 48.863659116447806], [1.889388149957079, 48.86415063032534]], "Zone exclusion 3", "Zone exclusion 3: interdit aux véhicules terrestres et aux hommes (Zone NRBC)");
    L.geoJSON(zoneExclusion3, { "color": "#ff0000", "weight": 3, fill: "#ff0000", onEachFeature: onEachFeature }).addTo(map);

    // Positionnement des limites de la zone logisitique (changement batterie des drones)
    var zoneLogistique = newPolygon([[1.9002572818575827, 48.8657460963811], [1.8997433649844104, 48.865801556603394], [1.9001754333158323, 48.866481822030295], [1.9009651889014454, 48.86626544152079]], "Zone logistique", "Zone logistique");
    L.geoJSON(zoneLogistique, { "color": "#00ff00", "weight": 3, fill: "#00ff00", onEachFeature: onEachFeature }).addTo(map);
}

export default { setup }