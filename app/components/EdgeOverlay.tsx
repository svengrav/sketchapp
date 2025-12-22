import { useRef, useEffect } from "react";

type EdgeOverlayProps = {
  imageUrl: string;
  opacity?: number;
  threshold?: number; // 0-255, höher = weniger Details
};

/**
 * Sobel Edge Detection Overlay mit Threshold
 * Zeichnet nur starke Kanten als weißes Overlay
 */
export function EdgeOverlay({ imageUrl, opacity = 1, threshold = 95 }: EdgeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Canvas-Größe an Bild anpassen
      canvas.width = img.width;
      canvas.height = img.height;

      // Bild zeichnen
      ctx.drawImage(img, 0, 0);

      // Pixel-Daten holen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Grayscale konvertieren
      const gray = new Float32Array(width * height);
      for (let i = 0; i < pixels.length; i += 4) {
        const idx = i / 4;
        gray[idx] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      }

      // Gaussian Blur anwenden (reduziert Rauschen/Details)
      const blurred = applyGaussianBlur(gray, width, height);

      // Sobel-Filter anwenden
      const edges = applySobel(blurred, width, height);

      // Edge-Daten als weißes Overlay mit Threshold zeichnen
      const outputData = ctx.createImageData(width, height);
      for (let i = 0; i < edges.length; i++) {
        const val = edges[i];
        const idx = i * 4;
        
        // Nur Kanten über Threshold anzeigen
        if (val > threshold) {
          const alpha = Math.min(255, (val - threshold) * 2);
          outputData.data[idx] = 255;     // R - weiß
          outputData.data[idx + 1] = 255; // G
          outputData.data[idx + 2] = 255; // B
          outputData.data[idx + 3] = alpha;
        } else {
          outputData.data[idx + 3] = 0; // Transparent
        }
      }

      ctx.putImageData(outputData, 0, 0);
    };

    img.src = imageUrl;
  }, [imageUrl, threshold]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-contain pointer-events-none bg-gray-400/10 rounded-md"
      style={{ opacity, mixBlendMode: "screen" }}
    />
  );
}

/**
 * Sobel Edge Detection Filter
 */
function applySobel(gray: Float32Array, width: number, height: number): Float32Array {
  const output = new Float32Array(width * height);

  // Sobel Kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      // 3x3 Kernel anwenden
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray[idx] * sobelX[kernelIdx];
          gy += gray[idx] * sobelY[kernelIdx];
        }
      }

      // Gradient-Magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      output[y * width + x] = magnitude;
    }
  }

  return output;
}

/**
 * Gaussian Blur (5x5 Kernel) - reduziert Rauschen und feine Details
 */
function applyGaussianBlur(gray: Float32Array, width: number, height: number): Float32Array {
  const output = new Float32Array(width * height);
  
  // 5x5 Gaussian Kernel (sigma ≈ 1.4)
  const kernel = [
    1,  4,  7,  4, 1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1,  4,  7,  4, 1
  ];
  const kernelSum = 273;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let sum = 0;
      let ki = 0;
      
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const idx = (y + ky) * width + (x + kx);
          sum += gray[idx] * kernel[ki++];
        }
      }
      
      output[y * width + x] = sum / kernelSum;
    }
  }

  return output;
}
