import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import dynamic from "next/dynamic";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * MapTiler Style Configuration
 *
 * We switched from MapLibre's demo style to MapTiler's hosted map styles.
 * MapTiler provides global satellite imagery and street vector data compatible with MapLibre.
 *
 * - STYLE_HYBRID: Satellite imagery + vector road/label overlays
 * - STYLE_STREETS: Standard vector street map
 *
 * The MapTiler API key (NEXT_PUBLIC_MAPTILER_KEY) allows secure access to their style.json endpoints.
 * MapLibre consumes the style.json, which points to raster/vector tiles and fonts.
 * Changing the style URL dynamically enables a satellite <-> street view toggle.
 */
const MAPTILER_KEY =
  process.env.NEXT_PUBLIC_MAPTILER_KEY || "c4YOf9pXj6L7xe7XWpUS";
const STYLE_STREETS = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
const STYLE_HYBRID = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;

// Dynamic imports for SSR-friendly usage
const Map = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.default),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.Marker),
  { ssr: false }
);

const NavigationControl = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.NavigationControl),
  { ssr: false }
);

/**
 * MapPicker
 * Props:
 * - points: Array<{ id?: string|number, latitude: number, longitude: number }>
 * - emoji?: string (default "📍")
 * - styleUrl?: string (default MapTiler hybrid satellite; can override)
 * - height?: number|string (default 400)
 * - width?: number|string (default "100%")
 * - initialCenter?: { latitude: number, longitude: number } (used if no points)
 * - initialZoom?: number (default 11)
 * - showNavigation?: boolean (default true)
 * - onMarkerClick?: (point) => void
 */
const MapPicker = ({
  points = [],
  emoji = "📍",
  styleUrl,
  height = 400,
  width = "100%",
  initialCenter = { latitude: 51.0447, longitude: -114.0719 }, // Calgary fallback
  initialZoom = 11,
  showNavigation = true,
  onMarkerClick,
}) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [baseStyle, setBaseStyle] = useState("satellite"); // "satellite" or "streets"

  const mapStyleUrl = useMemo(() => {
    if (styleUrl) return styleUrl;
    // Default to hybrid (satellite + labels)
    return baseStyle === "satellite" ? STYLE_HYBRID : STYLE_STREETS;
  }, [styleUrl, baseStyle]);

  // Filter valid points
  const validPoints = useMemo(() => {
    return points.filter(
      (p) =>
        p &&
        Number.isFinite(p.latitude) &&
        Number.isFinite(p.longitude) &&
        p.latitude >= -90 &&
        p.latitude <= 90 &&
        p.longitude >= -180 &&
        p.longitude <= 180
    );
  }, [points]);

  // Compute a stable initial view state
  const initialViewState = useMemo(() => {
    if (validPoints.length > 0) {
      return {
        longitude: validPoints[0].longitude,
        latitude: validPoints[0].latitude,
        zoom: initialZoom,
      };
    }
    return {
      longitude: initialCenter.longitude,
      latitude: initialCenter.latitude,
      zoom: initialZoom,
    };
  }, [validPoints, initialCenter, initialZoom]);

  // Fit to bounds when points change
  const fitToPoints = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !mapLoaded || validPoints.length === 0) return;

    try {
      const bounds = new maplibregl.LngLatBounds();

      validPoints.forEach((p) => {
        bounds.extend([p.longitude, p.latitude]);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 80,
          duration: 800,
          maxZoom: 14,
        });
      }
    } catch (err) {
      console.error("Error fitting bounds:", err);
    }
  }, [validPoints, mapLoaded]);

  // Handle map load
  const handleLoad = useCallback((event) => {
    console.log("Map loaded successfully!", event);
    const map = mapRef.current?.getMap?.();

    if (map) {
      map.on("error", (err) => {
        console.error("MapLibre error:", err);
        setError(err?.error?.message || "Map error occurred");
      });
    }

    setMapLoaded(true);
  }, []);

  // Handle map error
  const handleError = useCallback((event) => {
    console.error("Map failed to load:", event);
    setError(event?.error?.message || "Failed to load map");
    // Set loaded to true anyway so we can see the error
    setMapLoaded(true);
  }, []);

  // Fit bounds after map loads and points change
  useEffect(() => {
    if (mapLoaded && validPoints.length > 0) {
      const timer = setTimeout(() => {
        fitToPoints();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, validPoints, fitToPoints]);

  // Fallback: Force load after 3 seconds if onLoad hasn't fired
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        console.warn("Map load timeout - forcing render");
        setMapLoaded(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

  if (error) {
    return (
      <div style={{ width, height, position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fee",
            color: "#c33",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚠️</div>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              Map Error
            </div>
            <div style={{ fontSize: "14px" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* Style Toggle UI */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 3,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() => setBaseStyle("satellite")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            background: baseStyle === "satellite" ? "#111" : "#fff",
            color: baseStyle === "satellite" ? "#fff" : "#111",
            border: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: baseStyle === "satellite" ? "600" : "400",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🛰 Satellite
        </button>
        <button
          onClick={() => setBaseStyle("streets")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            background: baseStyle === "streets" ? "#111" : "#fff",
            color: baseStyle === "streets" ? "#fff" : "#111",
            border: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: baseStyle === "streets" ? "600" : "400",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🗺 Streets
        </button>
      </div>

      <Map
        ref={mapRef}
        mapLib={maplibregl}
        mapStyle={mapStyleUrl}
        initialViewState={initialViewState}
        attributionControl={true}
        dragRotate={false}
        pitchWithRotate={false}
        style={{ width: "100%", height: "100%" }}
        onLoad={handleLoad}
        onError={handleError}
        reuseMaps={false}
      >
        {showNavigation && <NavigationControl position="top-right" />}

        {validPoints.map((p, idx) => {
          const key = p.id ?? `marker-${p.latitude}-${p.longitude}-${idx}`;

          const emojs = {
            roads: "🚧",
            "snow & ice": "❄️",
            "lighting & signals": "🚦",
            "waste & sanitation": "🗑️",
          };

          return (
            <Marker
              key={key}
              latitude={p.latitude}
              longitude={p.longitude}
              anchor="bottom"
            >
              <div
                onClick={() => onMarkerClick?.(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onMarkerClick?.(p);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Incident: ${p.type || "marker"}`}
                style={{
                  fontSize: "32px",
                  lineHeight: "32px",
                  width: "32px",
                  height: "32px",
                  display: "block",
                  cursor: onMarkerClick ? "pointer" : "default",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  pointerEvents: "auto",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {emojs[p.type]}
              </div>
            </Marker>
          );
        })}
      </Map>

      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                animation: "spin 2s linear infinite",
              }}
            >
              🗺️
            </div>
            <div
              style={{ color: "#6b7280", fontSize: "16px", fontWeight: 500 }}
            >
              Loading map...
            </div>
            <div
              style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}
            >
              Checking console for errors
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MapPicker;
