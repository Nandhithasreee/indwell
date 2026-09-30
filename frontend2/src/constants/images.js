/**
 * Curated photography used throughout InDwell instead of illustrations.
 * All images are free-to-use under the Unsplash License (unsplash.com/license).
 * Helper appends Unsplash's imgix params for responsive, compressed delivery.
 */
const build = (id, w = 1600, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const IMAGES = {
  heroExterior: build("photo-1757359056339-22968344cce6", 2000), // dusk modern home exterior
  livingRoomFireplace: build("photo-1759238136854-a43787126db7", 1600), // warm living room, fireplace
  livingRoomWhite: build("photo-1768609239321-1cfe14893e80", 1600), // minimalist living room
  bedroomCozy: build("photo-1752407828685-f94b6c5377ac", 1600), // cozy modern bedroom
  kitchenWood: build("photo-1764526624453-db32c24eca55", 1600), // wooden kitchen island
  officeDesk: build("photo-1719150006656-958724675d9d", 1600), // mid-century desk & chair
};

export const VIDEOS = {
  // Free to use under the Pexels License (pexels.com/license) — no attribution required.
  aboutHero: "https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4",
  aboutHeroPoster:
    "https://images.pexels.com/videos/3773486/decoration-design-estate-furniture-3773486.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

/** Small per-room-type lookup used across Dashboard, Generate, and thumbnails. */
export const ROOM_TYPE_IMAGE = {
  Bedroom: IMAGES.bedroomCozy,
  "Living room": IMAGES.livingRoomFireplace,
  Kitchen: IMAGES.kitchenWood,
  "Home office": IMAGES.officeDesk,
  "Kids room": IMAGES.bedroomCozy,
  "Dining room": IMAGES.livingRoomWhite,
};

export function imageForRoomType(roomType) {
  return ROOM_TYPE_IMAGE[roomType] || IMAGES.livingRoomWhite;
}
