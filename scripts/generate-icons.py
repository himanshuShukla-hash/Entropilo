#!/usr/bin/env python3
"""
Generates clean PNG icons for Entropilo at 16x16, 48x48, and 128x128.
Uses pure Python standard library (struct + zlib) to output valid PNG files.
"""

import os
import struct
import zlib
import math

def create_png(width, height, rgba_data):
    """Creates a PNG binary blob from raw RGBA bytes."""
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk (scanlines with filter byte 0)
    raw_scanlines = bytearray()
    for y in range(height):
        raw_scanlines.append(0) # Filter: None
        start = y * width * 4
        raw_scanlines.extend(rgba_data[start:start + width * 4])
        
    compressed = zlib.compress(bytes(raw_scanlines), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    return png

def render_entropilo_icon(size):
    """Renders the Entropilo logo: a sleek spiral/aperture representing focus & entropy."""
    buf = bytearray(size * size * 4)
    cx, cy = size / 2.0, size / 2.0
    r_max = size * 0.44
    r_inner = size * 0.16
    
    for y in range(size):
        for x in range(size):
            dx = x - cx + 0.5
            dy = y - cy + 0.5
            dist = math.sqrt(dx * dx + dy * dy)
            angle = math.atan2(dy, dx) # -pi to pi
            
            idx = (y * size + x) * 4
            
            # Anti-aliasing edge
            if dist <= r_max:
                edge_factor = min(1.0, max(0.0, r_max - dist))
                
                # Dynamic spiral pattern
                spiral = (angle + (dist / r_max) * math.pi * 2.5) % (math.pi * 2)
                intensity = 0.5 + 0.5 * math.sin(spiral * 3)
                
                # Center core: glowing teal/cyan (intent & focus)
                # Outer rings: deep indigo / violet to purple (entropy)
                t = min(1.0, max(0.0, dist / r_max))
                
                # Color gradient: Teal (34, 197, 94 / 6, 182, 212) -> Violet (99, 102, 241) -> Dark Slate
                if dist < r_inner:
                    # Focused center
                    r = int(16 + 20 * (dist / r_inner))
                    g = int(185 + 40 * (1 - dist / r_inner))
                    b = int(129 + 60 * (dist / r_inner))
                    a = int(255 * edge_factor)
                else:
                    # Outer swirl
                    r = int((79 + 50 * intensity) * (1 - t * 0.4))
                    g = int((70 + 30 * intensity) * (1 - t * 0.5))
                    b = int(229 * (1 - t * 0.2))
                    a = int(240 * edge_factor)
                
                buf[idx] = max(0, min(255, r))
                buf[idx + 1] = max(0, min(255, g))
                buf[idx + 2] = max(0, min(255, b))
                buf[idx + 3] = a
            else:
                # Transparent outside circle
                buf[idx] = 0
                buf[idx + 1] = 0
                buf[idx + 2] = 0
                buf[idx + 3] = 0
                
    return create_png(size, size, buf)

def main():
    os.makedirs("icons", exist_ok=True)
    sizes = [16, 48, 128]
    for s in sizes:
        png_data = render_entropilo_icon(s)
        path = f"icons/icon-{s}.png"
        with open(path, "wb") as f:
            f.write(png_data)
        print(f"Generated {path} ({s}x{s}, {len(png_data)} bytes)")

if __name__ == "__main__":
    main()
