'use client';

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Image from "next/image";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapViewProps, MapIssue } from "./types";

async function loadIcon(map: maplibregl.Map, id: string, url: string): Promise<void> {
  try {
    if (map.hasImage(id)) return;
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    if (map.hasImage(id)) map.removeImage(id);
    map.addImage(id, imageBitmap);
  } catch (error) {
    console.error(`Failed to load icon ${id}:`, error);
    throw error;
  }
}

export default function IssuesMap({
  center = [-114.0719, 51.0447], // Calgary
  zoom = 6,
  issues = [],
  onIssueClick,
  dataProvider,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

  // Initialize map
  useEffect(() => {
    // If no container or map already exists, skip
    if (!containerRef.current) return;
    
    // Clean up any existing map instance before creating a new one
    if (mapRef.current instanceof maplibregl.Map) {
      mapRef.current.remove();
    }
    mapRef.current = null;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

      map.on("load", async () => {
        // Load category icons
        // Create a default icon as a data URL
      const defaultIconCanvas = document.createElement('canvas');
      defaultIconCanvas.width = 22;
      defaultIconCanvas.height = 22;
      const ctx = defaultIconCanvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(11, 11, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      const defaultIconUrl = defaultIconCanvas.toDataURL();

      await Promise.all([
          loadIcon(map, "icon-water", "/icons/water.png"),
          loadIcon(map, "icon-electrical", "/icons/electrical.png"),
          loadIcon(map, "icon-road", "/icons/road.png"),
          loadIcon(map, "icon-fire", "/icons/fire.png"),
          loadIcon(map, "icon-default", defaultIconUrl),
        ]);

        if (dataProvider) {
          // Add handlers to fetch new data when map moves
          const updateData = () => {
            const bounds = map.getBounds();
            const bbox: [number, number, number, number] = [
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ];

            dataProvider.getFeatures(bbox)
              .then((data: GeoJSON.FeatureCollection) => {
                const src = map.getSource("issues") as maplibregl.GeoJSONSource;
                if (src) src.setData(data);
              })
              .catch((error: Error) => {
                console.error('Failed to fetch issues:', error);
              });
          };

          map.on("moveend", updateData);
          // Initial data fetch
          updateData();
        }

      // Add clustered source
      map.addSource("issues", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: issues.map((issue, i) => ({
            type: "Feature",
            id: issue.id ?? i,
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

        // Add a faint pulse layer for glow
      map.addLayer({
        id: "issues-pulse",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            6, 8,
            12, 14
          ],
          "circle-color": [
            "match", ["get", "category"],
            "water", "#00E5FF",
            "electrical", "#FFD166",
            "road", "#FF5C5C",
            "fire", "#FF5C5C",
            "#9CA3AF"
          ],
          "circle-opacity": 0.25,
          "circle-blur": 0.6
        }
      });

      // Add halo layer
      map.addLayer({
        id: "issues-halo",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            6, 6,
            12, 10
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "water", "#00E5FF",
            "electrical", "#FFD166",
            "road", "#FF5C5C",
            "fire", "#FF5C5C",
            /* default */ "#9CA3AF"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 1.0, 0.9
          ],
          "circle-blur": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 0.05, 0.15
          ]
        }
      });

      // Add icons layer on top
      map.addLayer({
        id: "issues-icons",
        type: "symbol",
        source: "issues",
        filter: ["!", ["has", "point_count"]], // only single features, not clusters
        layout: {
          "icon-image": [
            "match",
            ["get", "category"],
            "water", "icon-water",
            "electrical", "icon-electrical",
            "road", "icon-road",
            "fire", "icon-fire",
            /* default */ "icon-default",
          ],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6, 0.8,
            12, 1.0
          ],
          "icon-allow-overlap": true
        },
        paint: {
          "icon-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,
            0.8
          ]
        }
      });

      // Add single point halo layer (with zoom scaling and hover brightness)
      map.addLayer({
        id: "issues-halo",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            6, 6,
            12, 10
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "water", "#00E5FF",
            "electrical", "#FFD166",
            "road", "#FF5C5C",
            "fire", "#FF5C5C",
            /* default */ "#9CA3AF"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 1.0, 0.9
          ],
          "circle-blur": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 0.05, 0.15
          ]
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
          map.on("click", "issues-icons", (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties ?? {};
          const issue = props as unknown as MapIssue;
          onIssueClick(issue);
        });

          map.on("mouseenter", "issues-icons", () => {
          map.getCanvas().style.cursor = "pointer";
        });
          map.on("mouseleave", "issues-icons", () => {
          map.getCanvas().style.cursor = "";
        });
      }
      
        // Hover feature-state and tooltip
        let hoveredId: number | null = null;
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

        map.on("mousemove", "issues-icons", (e) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0];
          if (!f) return;
          const id = (f.id as number) ?? null;
          if (id === null) return;
          if (hoveredId !== null) {
            map.setFeatureState({ source: "issues", id: hoveredId }, { hover: false });
          }
          hoveredId = id;
          map.setFeatureState({ source: "issues", id }, { hover: true });

  const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
    const p = f.properties as Record<string, unknown>;
          popup
            .setLngLat(coords)
            .setHTML(`<div style="font: 12px/1.4 system-ui;"><strong>${p.title ?? "Issue"}</strong><br/><span>${p.category ?? "unknown"}</span> • <span>${p.status ?? ""}</span></div>`)
            .addTo(map);
        });

        map.on("mouseleave", "issues-icons", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId !== null) {
            map.setFeatureState({ source: "issues", id: hoveredId }, { hover: false });
            hoveredId = null;
          }
          popup.remove();
        });

        // Set initial data after layer is added
      const src = map.getSource("issues") as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: "FeatureCollection",
            features: issues.map((issue, i) => ({
              type: "Feature",
              id: issue.id ?? i,
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
  }, [center, zoom, styleUrl, onIssueClick, issues, dataProvider]);

  // Update data when issues change OR when map moves (if using dataProvider)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("issues") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;

    if (dataProvider) {
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ];

      dataProvider.getFeatures(bbox).then(data => {
        src.setData(data);
      }).catch(error => {
        console.error('Failed to fetch issues:', error);
      });
    } else if (issues) {
      const fc: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: issues.map((issue, i) => ({
          type: "Feature",
          id: issue.id ?? i,
          properties: { ...issue },
          geometry: {
            type: "Point",
            coordinates: [issue.location.lng, issue.location.lat],
          },
        })),
      };
      src.setData(fc);
    }
  }, [issues, dataProvider]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/icons/fire.png" alt="fire" width={16} height={16} />
            <span>Fire</span>
            <span style={{ marginLeft: "auto", width: 10, height: 10, background: "#EF4444", borderRadius: "50%", display: "inline-block", border: "1px solid #999" }} />
          </div>
      </div>
    </>
  );
}