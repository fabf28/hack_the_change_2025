'use client';

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import type { MapViewProps, MapIssue } from "./types";

export default function IssuesMap({
  center = [-114.0719, 51.0447], // Calgary
  zoom = 6,
  issues = [],
  onIssueClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Add issues source
      map.addSource("issues", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: issues.map((issue) => ({
            type: "Feature",
            properties: { ...issue },
            geometry: {
              type: "Point",
              coordinates: [issue.location.lng, issue.location.lat],
            },
          })),
        },
      });

      // Add issues layer
      map.addLayer({
        id: "issues-layer",
        type: "circle",
        source: "issues",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "match",
            ["get", "status"],
            "open", "#ef4444",
            "in-progress", "#f59e0b",
            "resolved", "#22c55e",
            "#ef4444"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        },
      });

      // Add click handler
      if (onIssueClick) {
        map.on("click", "issues-layer", (e) => {
          if (!e.features?.[0]) return;
          const issue = e.features[0].properties as MapIssue;
          onIssueClick(issue);
        });

        // Change cursor on hover
        map.on("mouseenter", "issues-layer", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "issues-layer", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [center, zoom, issues, onIssueClick]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}