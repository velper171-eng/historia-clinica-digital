from PIL import Image
import sys

def get_dots(img_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    dots = []
    for y in range(h):
        for x in range(w):
            r, g, b = img.getpixel((x, y))
            # Detect green dots
            if g > 150 and r < 120 and b < 120:
                dots.append((x, y))
    
    # Simple clustering
    clusters = []
    for d in dots:
        added = False
        for c in clusters:
            # If point is close to an existing cluster, average it in
            if abs(c[0]-d[0]) < 15 and abs(c[1]-d[1]) < 15:
                c[0] = (c[0]*c[2] + d[0])/(c[2]+1)
                c[1] = (c[1]*c[2] + d[1])/(c[2]+1)
                c[2] += 1
                added = True
                break
        if not added:
            clusters.append([float(d[0]), float(d[1]), 1])
    
    # Sort by Y then X to make it easier to map
    sorted_clusters = sorted(clusters, key=lambda x: (x[1] // 40, x[0]))
    
    print(f"--- Dots for {img_path} ---")
    for c in sorted_clusters:
        # Scale to 800x1000
        cx = int(c[0] * 800 / w)
        cy = int(c[1] * 1000 / h)
        print(f"{{ cx: {cx}, cy: {cy} }},")

if __name__ == "__main__":
    get_dots('public/face-male-with-dots.jpg')
    get_dots('public/face-female-with-dots.jpg')
