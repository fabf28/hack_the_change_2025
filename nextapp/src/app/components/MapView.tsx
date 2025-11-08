'use client';

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = { center?: [number, number]; zoom?: number; styleUrl?: string; };

export default function MapView({
  center = [-114.0719, 51.0447], // Calgary
  zoom = 6,
  styleUrl = "https://demotiles.maplibre.org/style.json",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("hello", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Hello MapLibre" },
              geometry: { type: "Point", coordinates: center },
            },
          ],
        },
      });
      map.addLayer({
        id: "hello-layer",
        type: "symbol",
        source: "hello",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-offset": [0, 1.2],
          "icon-image": "marker-15",
        },
        paint: { "text-halo-color": "#fff", "text-halo-width": 1 },
      });
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [center, zoom, styleUrl]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
