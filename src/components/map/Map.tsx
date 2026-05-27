"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { WORLD_VIEWBOX } from "@/lib/world-layout";
import GridBackground from "./GridBackground";
import Airport from "./Airport";

export default function Map() {
  return (
    <TransformWrapper
      minScale={0.3}
      maxScale={4}
      initialScale={0.5}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
    >
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: "100%", height: "100%" }}
      >
        <svg
          viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <GridBackground />
          <Airport />
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}
