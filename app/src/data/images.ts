// Urban Sketching Bildquellen (Unsplash - kostenlos nutzbar)
export const sketchImages = [
  {
    url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920",
    city: "Paris",
  },
  {
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920",
    city: "London",
  },
  {
    url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1920",
    city: "New York",
  },
  {
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920",
    city: "Rome",
  },
  {
    url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920",
    city: "Amsterdam",
  },
  {
    url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920",
    city: "Berlin",
  },
  {
    url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1920",
    city: "Venice",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
    city: "Barcelona",
  },
  {
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920",
    city: "Tokyo",
  },
  {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920",
    city: "Paris Eiffel",
  },
];

export type SketchImage = (typeof sketchImages)[number];

// Zufälliges Bild (ohne Wiederholung des aktuellen)
export function getRandomImage(currentUrl?: string): SketchImage {
  const available = currentUrl
    ? sketchImages.filter((img) => img.url !== currentUrl)
    : sketchImages;
  return available[Math.floor(Math.random() * available.length)];
}
