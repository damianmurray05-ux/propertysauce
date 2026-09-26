// Generic marketing photos for the two blocks of flats. Damian confirmed
// (26 Sep 2026) that within a block every flat looks the same, so one shared
// pool of real photos represents any unit in that building - it doesn't
// matter which specific flat a photo was actually taken in.
//
// Filenames are listed directly rather than read from disk at request time:
// this runs inside a bundled Vercel serverless function, and a runtime
// fs.readdirSync() against a bundled asset directory is not reliable there.

const CATTERICK_HOUSE = [
  "Catterick-flat-22-132.jpg","Catterick-flat-22-133.jpg","Catterick-flat-22-134.jpg","Catterick-flat-22-135.jpg","Catterick-flat-22-136.jpg","Catterick-flat-22-137.jpg","Catterick-flat-22-138.jpg","Catterick-flat-22-139.jpg","Catterick-flat-22-140.jpg","Catterick-flat-22-141.jpg","Catterick-flat-22-142.jpg","Catterick-flat-22-143.jpg","Catterick-flat-22-144.jpg","Catterick-flat-22-145.jpg","Catterick-flat-22-146.jpg","Catterick-flat-22-147.jpg","Catterick-flat-22-148.jpg","Catterick-flat-22-149.jpg","Catterick-flat-22-150.jpg","Catterick-flat-22-151.jpg","Catterick-flat-22-152.jpg","Catterick-flat-22-153.jpg","Catterick-flat-22-154.jpg","Catterick-flat-22-155.jpg","Catterick-flat-22-156.jpg","Catterick-flat-22-157.jpg","Catterick-flat-22-158.jpg","Catterick-flat-23-159.jpg","Catterick-flat-23-160.jpg","Catterick-flat-23-161.jpg","Catterick-flat-23-162.jpg","Catterick-flat-23-163.jpg","Catterick-flat-23-164.jpg","Catterick-flat-23-165.jpg","Catterick-flat-23-166.jpg","Catterick-flat-23-167.jpg","Catterick-flat-23-168.jpg","Catterick-flat-23-169.jpg","Catterick-flat-23-170.jpg","Catterick-flat-23-171.jpg","Catterick-flat-23-172.jpg","Catterick-flat-23-173.jpg","Catterick-flat-23-174.jpg","Catterick-flat-23-175.jpg","Catterick-flat-23-176.jpg","Catterick-flat-40-177.jpg","Catterick-flat-40-178.jpg","Catterick-flat-40-179.jpg","Catterick-flat-40-180.jpg","Catterick-flat-40-181.jpg","Catterick-flat-40-182.jpg","Catterick-flat-40-183.jpg","Catterick-flat-40-184.jpg","Catterick-flat-40-185.jpg","Catterick-flat-40-186.jpg","Catterick-flat-40-187.jpg","Catterick-flat-40-188.jpg","Catterick-flat-40-189.jpg","Catterick-flat-40-190.jpg","Catterick-flat-40-191.jpg","Catterick-flat-40-192.jpg","Catterick-flat-40-193.jpg","Catterick-flat-40-194.jpg","Catterick-flat-40-195.jpg","Catterick-flat-40-196.jpg","Catterick-flat-40-197.jpg","Catterick-flat-40-198.jpg","Catterick-flat-40-199.jpg","Catterick-flat-40-200.jpg","Catterick-flat-40-201.jpg","Catterick-flat-40-202.jpg","Catterick-flat-40-203.jpg","Catterick-flat-40-204.jpg","Catterick-flat-40-205.jpg",
];
// Best of the set: a clean, front-on, well-lit kitchen shot - Damian asked
// for the main/card image to show the kitchen rather than an empty room.
const CATTERICK_HERO = "Catterick-flat-22-138.jpg";

// From the live OpenRent advert for this building. Seven photos from the
// original set were dropped entirely (26 Sep 2026, on Damian's steer): three
// were a Google Street View screenshot and pre-renovation shots of the
// boarded-up building, and one bathroom shot had an unfinished service box
// exposed in the corner - none fit for marketing.
const LANCASTER_HOUSE = [
  "lancaster-01.jpg","lancaster-03.jpg","lancaster-04.jpg","lancaster-05.jpg","lancaster-06.jpg","lancaster-07.jpg","lancaster-08.jpg","lancaster-09.jpg","lancaster-10.jpg","lancaster-12.jpg",
];
// The best staged/furnished living-room shot.
const LANCASTER_HERO = "lancaster-05.jpg";

const BUILDINGS = [
  { match: "Catterick House", dir: "catterick-house", files: CATTERICK_HOUSE, hero: CATTERICK_HERO },
  { match: "Lancaster House", dir: "lancaster-house", files: LANCASTER_HOUSE, hero: LANCASTER_HERO },
];

// Deterministic, not random: the same address always gets the same gallery
// order, so a listing's photos don't reshuffle on every page load.
function stableIndex(seed, mod) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return mod ? h % mod : 0;
}

function forBuilding(rawAddress) {
  const address = String(rawAddress || "");
  return BUILDINGS.find((b) => address.includes(b.match)) || null;
}

// The single best photo, used on the listing card.
export function photoForAddress(rawAddress) {
  const building = forBuilding(rawAddress);
  if (!building) return "";
  return `/assets/img/${building.dir}/${building.hero}`;
}

// The full gallery for a property's detail page, hero photo first, the rest
// in a stable per-address order (so different flats in the same building
// aren't shown in an identical sequence).
export function galleryForAddress(rawAddress) {
  const building = forBuilding(rawAddress);
  if (!building) return [];
  const offset = stableIndex(String(rawAddress || ""), building.files.length);
  const rotated = [...building.files.slice(offset), ...building.files.slice(0, offset)];
  const ordered = [building.hero, ...rotated.filter((f) => f !== building.hero)];
  return ordered.map((f) => `/assets/img/${building.dir}/${f}`);
}
