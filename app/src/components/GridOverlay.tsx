type GridSvgProps = {
  gridSize: number;
  color: string;
  strokeWidth: number;
};

/**
 * SVG-Komponente für Gitterlinien
 * Rendert exakte Linien ohne Rundungsfehler
 */
function GridSvg({ gridSize, color, strokeWidth }: GridSvgProps) {
  // Erzeuge Linien-Positionen (nur innere Linien, nicht am Rand)
  const positions = Array.from({ length: gridSize - 1 }, (_, i) => 
    ((i + 1) / gridSize) * 100
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Vertikale Linien */}
      {positions.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={100}
          stroke={color}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {/* Horizontale Linien */}
      {positions.map((y) => (
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={100}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

type GridOverlayProps = {
  gridSize?: number;
  opacity?: number;
  color?: string;
};

/**
 * Grid-Overlay Komponente
 * Zeichnet ein gleichmäßiges Raster über das Bild
 */
export function GridOverlay({ 
  gridSize = 3, 
  opacity = 0.5, 
  color = "white" 
}: GridOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    >
      <GridSvg gridSize={gridSize} color={color} strokeWidth={1} />
    </div>
  );
}
