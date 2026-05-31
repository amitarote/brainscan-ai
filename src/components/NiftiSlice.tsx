import { useEffect, useRef, useState } from "react";
import * as nifti from "nifti-reader-js";
import pako from "pako";

interface NiftiSliceProps {
  /** Raw file buffer of a .nii or .nii.gz upload */
  buffer: ArrayBuffer | null;
  /** File name (used to detect .gz) */
  fileName?: string;
  /** Axis: 0 = sagittal, 1 = coronal, 2 = axial (default) */
  axis?: 0 | 1 | 2;
  /** Brightness multiplier (default 1) */
  brightness?: number;
  className?: string;
}

/**
 * NiftiSlice — parses an uploaded NIfTI medical image client-side
 * and renders the middle slice along the chosen axis to a <canvas>.
 *
 * Falls back to a "Could not decode" message if parsing fails.
 */
const NiftiSlice = ({
  buffer,
  fileName = "",
  axis = 2,
  brightness = 1,
  className,
}: NiftiSliceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    if (!buffer) return;
    setError(null);

    try {
      // Decompress if .nii.gz
      let raw: ArrayBuffer = buffer;
      const isGz = fileName.toLowerCase().endsWith(".gz");
      if (isGz) {
        const inflated = pako.inflate(new Uint8Array(buffer));
        raw = inflated.buffer.slice(
          inflated.byteOffset,
          inflated.byteOffset + inflated.byteLength,
        ) as ArrayBuffer;
      }

      if (!nifti.isNIFTI(raw)) {
        setError("File is not a valid NIfTI volume.");
        return;
      }

      const header = nifti.readHeader(raw);
      if (!header) {
        setError("Could not read NIfTI header.");
        return;
      }
      const imageData = nifti.readImage(header, raw);

      const [, nx, ny, nz] = header.dims as number[];
      const dims = [nx, ny, nz];

      // Build typed view
      let typed: Float32Array;
      const len = nx * ny * nz;
      const dt = header.datatypeCode;
      // Common NIfTI datatype codes
      // 2: UINT8, 4: INT16, 8: INT32, 16: FLOAT32, 64: FLOAT64, 512: UINT16
      const view = (() => {
        switch (dt) {
          case 2: return new Uint8Array(imageData);
          case 4: return new Int16Array(imageData);
          case 8: return new Int32Array(imageData);
          case 16: return new Float32Array(imageData);
          case 64: return new Float64Array(imageData);
          case 256: return new Int8Array(imageData);
          case 512: return new Uint16Array(imageData);
          case 768: return new Uint32Array(imageData);
          default: return new Int16Array(imageData);
        }
      })();
      typed = new Float32Array(len);
      for (let i = 0; i < len && i < view.length; i++) typed[i] = view[i];

      // Extract middle slice along chosen axis
      const sliceIdx = Math.floor(dims[axis] / 2);
      let w = 0, h = 0;
      let pixels: Float32Array;

      if (axis === 2) {
        // axial: XY plane at z = sliceIdx
        w = nx; h = ny;
        pixels = new Float32Array(w * h);
        const zOff = sliceIdx * nx * ny;
        for (let y = 0; y < ny; y++) {
          for (let x = 0; x < nx; x++) {
            pixels[y * w + x] = typed[zOff + y * nx + x];
          }
        }
      } else if (axis === 1) {
        // coronal: XZ plane at y = sliceIdx
        w = nx; h = nz;
        pixels = new Float32Array(w * h);
        for (let z = 0; z < nz; z++) {
          for (let x = 0; x < nx; x++) {
            pixels[(nz - 1 - z) * w + x] = typed[z * nx * ny + sliceIdx * nx + x];
          }
        }
      } else {
        // sagittal: YZ plane at x = sliceIdx
        w = ny; h = nz;
        pixels = new Float32Array(w * h);
        for (let z = 0; z < nz; z++) {
          for (let y = 0; y < ny; y++) {
            pixels[(nz - 1 - z) * w + y] = typed[z * nx * ny + y * nx + sliceIdx];
          }
        }
      }

      // Normalize (robust: 1st–99th percentile)
      const sorted = Float32Array.from(pixels).sort();
      const lo = sorted[Math.floor(sorted.length * 0.01)];
      const hi = sorted[Math.floor(sorted.length * 0.99)] || 1;
      const range = Math.max(hi - lo, 1e-6);

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < pixels.length; i++) {
        let v = (pixels[i] - lo) / range;
        v = Math.max(0, Math.min(1, v)) * brightness;
        v = Math.max(0, Math.min(1, v));
        const g = Math.round(v * 255);
        img.data[i * 4] = g;
        img.data[i * 4 + 1] = g;
        img.data[i * 4 + 2] = g;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      setInfo(`${nx}×${ny}×${nz} · slice ${sliceIdx + 1}/${dims[axis]}`);
    } catch (e) {
      console.error("NIfTI decode failed", e);
      setError("Could not decode this NIfTI file.");
    }
  }, [buffer, fileName, axis, brightness]);

  if (!buffer) return null;

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 p-4 text-center">
          {error}
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ imageRendering: "auto" }}
          />
          {info && (
            <div className="absolute bottom-2 right-2 rounded border border-white/10 bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-mono text-zinc-300">
              {info}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NiftiSlice;
