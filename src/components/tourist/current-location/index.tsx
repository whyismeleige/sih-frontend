"use client";
import React, { useRef, useEffect } from "react";
import Radar from "radar-sdk-js";

import "radar-sdk-js/dist/radar.css";

if (!process.env.NEXT_PUBLIC_RADAR_KEY)
  throw new Error("RADAR_KEY not defined");

const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_KEY;

const RadarMap = () => {
  const radarInitialized = useRef(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    Radar.initialize(RADAR_KEY);

    const map = Radar.ui.map({
      container: "map",
      style: "radar-default-v1",
      center: [-73.9911, 40.7342],
      zoom: 14,
    });
    mapRef.current = map;

    const marker = Radar.ui
      .marker({ text: "Radar HQ" })
      .setLngLat([-73.9910078, 40.7342465])
      .addTo(map);
    markerRef.current = marker;

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.flyTo({ center: [longitude, latitude], zoom: 14 });
      markerRef.current.setLngLat([longitude, latitude]);
    });

    return () => {
      autocompleteRef.current?.remove();
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div id="map" style={{ flex: 1 }} />
    </div>
  );
};

// class RadarMap extends React.Component {
//   componentDidMount(): void {
//     Radar.initialize(RADAR_KEY);

//     const map = Radar.ui.map({
//       container: "map",
//       center: [-73.99055, 40.735225],
//       zoom: 16,
//     });

//     map.on("load", () => {
//       Radar.ui
//         .marker({
//           popup: {
//             html: `
//               <div style="text-align: center;">
//                 <h3>The Roosevelt Building</h3>
//                 <img width="100" src="https://images.ctfassets.net/f2vbu16fzuly/5VZ6BEW5Ju6kL4OeooR2YG/4e694ad24b8d57c6b9958de79976d89e/Screenshot_2024-07-15_at_9.43.45_AM.png?w=400" />
//               </div>
//             `,
//           },
//         })
//         .setLngLat([-73.9910078, 40.7342465])
//         .addTo(map);

//       const element = document
//         .getElementById("custom-popup")
//         ?.cloneNode(true) as HTMLElement;

//       if (element) {
//         element.style.visibility = "visible";
//         element.id = "custom-popup-1";

//         Radar.ui
//           .marker({
//             popup: {
//               element,
//             },
//           })
//           .setLngLat([-73.990389, 40.735862])
//           .addTo(map);
//       }

//       const element_2 = document
//         .getElementById("custom-popup-2")
//         ?.cloneNode(true) as HTMLElement;

//       if (element_2) {
//         element_2.style.visibility = "visible";
//         element_2.id = "custom-popup-2";

//         Radar.ui
//           .marker({
//             popup: {
//               element: element_2,
//             },
//           })
//           .setLngLat([-73.9920078, 40.732862])
//           .addTo(map);
//       }
//     });
//   }

//   render(): React.ReactNode {
//     return (
//       <div
//         id="map-container"
//         style={{ width: "100%", height: "100vh", position: "absolute" }}
//       >
//         <div
//           id="map"
//           style={{ height: "100%", position: "absolute", width: "100%" }}
//         />

//         {/* 👇 style must be an object, not string */}
//         <div
//           id="custom-popup"
//           style={{ visibility: "hidden", textAlign: "center" }}
//         >
//           <h3>Union Square</h3>
//           <img
//             width="100"
//             src="https://images.ctfassets.net/f2vbu16fzuly/7BUSW7MAtT2abUQY8U3Ri6/11fb8b92fd24c326bfd5da3064d67666/union_square.jpg?w=600"
//           />
//         </div>
//         <div
//           id="custom-popup-2"
//           style={{ visibility: "hidden", textAlign: "center" }}
//         >
//           <h3>Custom Item</h3>
//           <img
//             width="100"
//             src="https://images.ctfassets.net/f2vbu16fzuly/7BUSW7MAtT2abUQY8U3Ri6/11fb8b92fd24c326bfd5da3064d67666/union_square.jpg?w=600"
//           />
//         </div>
//       </div>
//     );
//   }
// }

export default RadarMap;
