/**
 * FITTRACK food image pipeline.
 *
 * Downloads real, freely-licensed food photographs and stores them locally:
 *  - Wikimedia Commons (free licenses, attribution recorded per image)
 *  - Open Food Facts (packaged products only; CC-BY-SA, attribution recorded)
 *
 * Every image is center-cropped to a 512x512 JPEG by scripts/process-images.ps1
 * (System.Drawing) for consistent presentation.
 * Generates:
 *  - public/images/foods/<foodId>.jpg
 *  - public/images/foods/placeholder.svg (local fallback, never broken icons)
 *  - public/images/foods/credits.json   (per-image attribution)
 *  - src/data/foodImages.ts             (centralized mapping used by the UI)
 *
 * No AI-generated images are used.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = join(process.cwd(), 'public', 'images', 'foods')
const UA = 'FITTRACK-prototype/1.0 (local development; contact: dev@fittrack.local)'

/** foodId -> Wikimedia Commons file search query (real photographs) */
const COMMONS_QUERIES = {
  roti: 'roti indian flatbread',
  'rice-white': 'steamed white rice bowl',
  'rice-brown': 'brown rice cooked',
  paratha: 'paratha flatbread',
  'paratha-aloo': 'aloo paratha',
  naan: 'naan bread',
  'dal-toor': 'toor dal bowl',
  'dal-tadka': 'dal tadka',
  rajma: 'rajma curry bowl',
  chana: 'chana masala bowl',
  milk: 'glass of milk',
  curd: 'curd dahi bowl',
  'greek-yogurt': 'greek yogurt bowl',
  'egg-boiled': 'boiled eggs peeled',
  'egg-bhurji': 'egg bhurji',
  'chicken-curry': 'chicken curry bowl',
  'chicken-breast': 'grilled chicken breast',
  'butter-chicken': 'butter chicken',
  'fish-curry': 'fish curry bowl',
  poha: 'poha breakfast',
  idli: 'idli sambar',
  dosa: 'dosa south indian',
  'dosa-masala': 'masala dosa',
  upma: 'upma breakfast',
  'oats-milk': 'oatmeal bowl milk',
  sabzi: 'indian mixed vegetable curry',
  'palak-paneer': 'palak paneer',
  'paneer-bhurji': 'paneer bhurji',
  khichdi: 'khichdi dish',
  samosa: 'samosa',
  dhokla: 'dhokla',
  banana: 'bananas fruit',
  apple: 'red apple fruit',
  mango: 'mango fruit sliced',
  tea: 'masala chai cup',
  coffee: 'milk coffee glass',
  lassi: 'lassi drink glass',
  almonds: 'almonds pile',
  peanuts: 'roasted peanuts',
}

/** foodId -> Open Food Facts search (packaged products) */
const OFF_QUERIES = {
  oats: 'rolled oats',
  biscuits: 'marie biscuits',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function downloadBinary(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 5000) throw new Error(`image too small (${buf.length} bytes): ${url}`)
  return buf
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]*>/g, '').trim()
}

/** Search Wikimedia Commons for a real photo; returns { buf, credit } */
async function fetchFromCommons(query) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
    `&gsrsearch=${encodeURIComponent('filetype:bitmap ' + query)}` +
    '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640'
  const data = await fetchJson(api)
  const pages = Object.values(data?.query?.pages ?? {})
    .filter((p) => p.imageinfo?.[0]?.thumburl)
    .sort((a, b) => a.index - b.index)

  for (const page of pages) {
    const info = page.imageinfo[0]
    try {
      const buf = await downloadBinary(info.thumburl)
      const meta = info.extmetadata ?? {}
      return {
        buf,
        credit: {
          source: 'Wikimedia Commons',
          sourceUrl: info.descriptionurl ?? info.thumburl,
          author: stripHtml(meta.Artist?.value) || 'Wikimedia Commons contributor',
          license: stripHtml(meta.LicenseShortName?.value) || 'CC BY-SA',
        },
      }
    } catch {
      // try the next candidate file
    }
  }
  throw new Error(`no Commons result for "${query}"`)
}

/** Search Open Food Facts for a packaged product photo; returns { buf, credit } */
async function fetchFromOFF(query) {
  const api =
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' +
    encodeURIComponent(query) +
    '&search_simple=1&action=process&json=1&page_size=8'
  const data = await fetchJson(api)
  const products = (data?.products ?? []).filter(
    (p) => p.image_front_url || p.image_url,
  )
  for (const p of products) {
    try {
      const url = (p.image_front_url ?? p.image_url).replace(/^http:/, 'https:')
      const buf = await downloadBinary(url)
      return {
        buf,
        credit: {
          source: 'Open Food Facts',
          sourceUrl: `https://world.openfoodfacts.org/product/${p.code ?? ''}`,
          author: `${p.brands ?? 'Open Food Facts'} (photo by OFF contributor)`,
          license: 'CC BY-SA (Open Food Facts)',
        },
      }
    } catch {
      // try next product
    }
  }
  throw new Error(`no OFF result for "${query}"`)
}

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef6f1"/>
      <stop offset="1" stop-color="#dcefe4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="256" r="118" fill="#ffffff"/>
  <g stroke="#34c77b" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(176,176) scale(6.66)">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </g>
</svg>
`

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'placeholder.svg'), PLACEHOLDER_SVG)

  const credits = {}
  const mapping = {}
  const rawDir = join(OUT_DIR, '.raw')
  mkdirSync(rawDir, { recursive: true })
  const failures = []

  const jobs = [
    ...Object.entries(COMMONS_QUERIES).map(([id, q]) => ({ id, q, src: 'commons' })),
    ...Object.entries(OFF_QUERIES).map(([id, q]) => ({ id, q, src: 'off' })),
  ]

  for (const { id, q, src } of jobs) {
    try {
      const { buf, credit } =
        src === 'off' ? await fetchFromOFF(q) : await fetchFromCommons(q)
      // save the original; scripts/process-images.ps1 crops it to 512x512 JPEG
      writeFileSync(join(rawDir, `${id}.raw`), buf)
      mapping[id] = `/images/foods/${id}.jpg`
      credits[id] = credit
      console.log(`OK   ${id}  <- ${credit.source} (${credit.license})`)
    } catch (err) {
      failures.push(id)
      console.log(`FAIL ${id}: ${err.message}`)
    }
    await sleep(150)
  }

  writeFileSync(
    join(OUT_DIR, 'credits.json'),
    JSON.stringify({ note: 'Food photographs are real photos, not AI-generated. Attribute as shown.', credits }, null, 2),
  )

  const ts = `/** Centralized food image mapping. Generated by scripts/fetch-food-images.mjs — do not edit by hand.
 *  All images are real photographs stored locally under /images/foods/. */

export interface FoodImageCredit {
  source: string
  sourceUrl?: string
  author?: string
  license?: string
}

export const FOOD_IMAGES: Record<string, string> = ${JSON.stringify(mapping, null, 2)}

export const FOOD_IMAGE_CREDITS: Record<string, FoodImageCredit> = ${JSON.stringify(credits, null, 2)}

export const FOOD_IMAGE_FALLBACK = '/images/foods/placeholder.svg'
`
  writeFileSync(join(process.cwd(), 'src', 'data', 'foodImages.ts'), ts)

  console.log(`\nDone. ${Object.keys(mapping).length} images, ${failures.length} failures: ${failures.join(', ') || 'none'}`)
  if (failures.length > 0) process.exitCode = 2
}

main()
