import "../styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { geistSans, geistMono } from "../lib/constants";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
