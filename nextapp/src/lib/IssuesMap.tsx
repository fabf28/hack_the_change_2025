'use client';

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import Image from "next/image";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapViewProps, MapIssue } from "./types";

export default function IssuesMap({
  center = [-114.0719, 51.0447], // Calgary
  zoom = 6,
  issues = [],
  onIssueClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Add clustered source
      map.addSource("issues", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: issues.map((issue) => ({
            type: "Feature",
            properties: { ...issue },
            geometry: { type: "Point", coordinates: [issue.location.lng, issue.location.lat] },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        // aggregate per-category counts inside each cluster
        clusterProperties: {
          cnt_water: ["+", ["case", ["==", ["get", "category"], "water"], 1, 0]],
          cnt_electrical: ["+", ["case", ["==", ["get", "category"], "electrical"], 1, 0]],
          cnt_road: ["+", ["case", ["==", ["get", "category"], "road"], 1, 0]],
        },
      });

      // Add cluster layers first (they should appear below points)
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "issues",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": [
            "step", ["get", "point_count"],
            18, 50, 22, 200, 28, 500, 34
          ],
          "circle-color": [
            "case",
            [">=", ["get", "cnt_water"], ["max", ["get", "cnt_electrical"], ["get", "cnt_road"]]], "#3ABFF8",
            [">=", ["get", "cnt_electrical"], ["max", ["get", "cnt_water"], ["get", "cnt_road"]]], "#F59E0B",
            [">=", ["get", "cnt_road"], ["max", ["get", "cnt_water"], ["get", "cnt_electrical"]]], "#EF4444",
            "#9CA3AF"
          ],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "issues",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12
        },
        paint: { "text-color": "#ffffff" }
      });

      // Add single point halo layer
      map.addLayer({
        id: "issues-halo",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "status"],
            "open", "#00E5FF",
            "in-progress", "#FFD166",
            "resolved", "#06D6A0",
            "#00E5FF"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
          "circle-blur": 0.15,
        },
      });

      // Setup cluster click handlers
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features[0]) return;
        
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("issues") as maplibregl.GeoJSONSource;
        
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const geometry = features[0].geometry as GeoJSON.Point;
          map.easeTo({ 
            center: [geometry.coordinates[0], geometry.coordinates[1]], 
            zoom 
          });
        } catch (error) {
          console.error('Failed to expand cluster:', error);
        }
      });

      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });

      // Setup single point click handlers
      if (onIssueClick) {
        map.on("click", "issues-halo", (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties ?? {};
          const issue = props as unknown as MapIssue;
          onIssueClick(issue);
        });

        map.on("mouseenter", "issues-halo", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "issues-halo", () => {
          map.getCanvas().style.cursor = "";
        });
      }
      
      // Set initial data after layer is added
      const src = map.getSource("issues") as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: "FeatureCollection",
          features: issues.map((issue) => ({
            type: "Feature",
            properties: { ...issue },
            geometry: {
              type: "Point",
              coordinates: [issue.location.lng, issue.location.lat],
            },
          })),
        });
      }
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [center, zoom, styleUrl, onIssueClick, issues]);

  // Update data when issues change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("issues") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;

    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: issues.map((issue) => ({
        type: "Feature",
        properties: { ...issue },
        geometry: {
          type: "Point",
          coordinates: [issue.location.lng, issue.location.lat],
        },
      })),
    };
    src.setData(fc);
  }, [issues]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 12,
          zIndex: 2,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "8px 10px",
          width: 180,
          fontSize: 12,
          lineHeight: 1.4
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Legend</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Image src="/icons/water.png" alt="water" width={16} height={16} />
          <span>Water issues</span>
          <span style={{ marginLeft: "auto", width: 10, height: 10, background: "#3ABFF8", borderRadius: "50%", display: "inline-block", border: "1px solid #999" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Image src="/icons/electrical.png" alt="electrical" width={16} height={16} />
          <span>Electrical</span>
          <span style={{ marginLeft: "auto", width: 10, height: 10, background: "#F59E0B", borderRadius: "50%", display: "inline-block", border: "1px solid #999" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/icons/road.png" alt="road" width={16} height={16} />
          <span>Road</span>
          <span style={{ marginLeft: "auto", width: 10, height: 10, background: "#EF4444", borderRadius: "50%", display: "inline-block", border: "1px solid #999" }} />
        </div>
      </div>
    </>
  );
}