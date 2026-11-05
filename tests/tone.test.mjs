// Light theme tone mapping of the thermal background (src/scripts/thermal/tone.ts):
// the butterfly is spread over the heat scale instead of crowding into one colour,
// the strong warmth of a trail is raised, faint warmth is kept as it is.
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  butterflyLevels,
  cellSamples,
  lightWarmth,
  plateauEqualize
} from '../src/scripts/thermal/tone.ts'

/** Temperatures 0–255 crowded around the middle, like the butterfly's (bell curve). */
function crowded(count = 4000) {
  const samples = new Uint8Array(count)
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count
    // inverse of a logistic distribution centred on 170
    samples[i] = Math.max(0, Math.min(255, Math.round(170 + 14 * Math.log(u / (1 - u)))))
  }
  return samples
}

/** Largest share of the samples taken by one of the 11 colours of the scale. */
function largestShare(samples, level) {
  const counts = new Array(11).fill(0)
  for (const value of samples) counts[Math.round(level(value) * 10)]++
  return Math.max(...counts) / samples.length
}

test('the butterfly no longer crowds into one colour', () => {
  const samples = crowded()
  const levels = plateauEqualize(samples, 0.25, 0.95, 0.04)
  const linear = largestShare(samples, (value) => Math.min(1, 0.2 + (0.8 * value) / 255))
  const equalized = largestShare(samples, (value) => levels[value])
  assert.ok(linear > 0.4, `linear mapping: ${linear}`)
  assert.ok(equalized < 0.2, `light mapping: ${equalized}`)
})

test('equalized levels go up with the temperature, from the floor to the top', () => {
  const levels = plateauEqualize(crowded(), 0.25, 0.95, 0.04)
  for (let v = 1; v < 256; v++) assert.ok(levels[v] >= levels[v - 1], `level of ${v}`)
  assert.ok(levels[0] >= 0.25)
  // the hottest temperature (and any above it) is the top of the scale
  const hottest = Math.max(...crowded())
  assert.equal(levels[hottest], 1)
  assert.equal(levels[255], 1)
  assert.ok(levels[hottest - 1] <= 0.95)
})

test('equal amounts of temperatures get equal bands of the scale', () => {
  const samples = Uint8Array.from({ length: 800 }, (_, i) => 20 * (i % 8))
  const levels = plateauEqualize(samples, 0, 1, 1)
  for (let k = 0; k < 7; k++) assert.ok(Math.abs(levels[20 * k] - (k + 0.5) / 8) < 1e-6)
})

test('the plateau keeps a large even area from taking a whole band', () => {
  // half of the samples share one temperature (like the wing rim)
  const samples = Uint8Array.from({ length: 2000 }, (_, i) => (i % 2 ? 128 : (i / 2) % 256))
  const capped = plateauEqualize(samples, 0, 1, 0.04)
  const uncapped = plateauEqualize(samples, 0, 1, 1)
  assert.ok(uncapped[129] - uncapped[127] > 0.4)
  assert.ok(capped[129] - capped[127] < 0.1)
})

test('no samples: everything at the top of the scale', () => {
  assert.ok(plateauEqualize(new Uint8Array(0), 0.25, 0.95, 0.04).every((level) => level === 1))
})

test('cell samples keep, in each cell, the sample of highest material', () => {
  // 12 × 24 texture = 2 × 2 cells of 6 × 12: membrane (1) everywhere in the left
  // column of cells, a vein (2) crossing the top-left cell, nothing on the right
  const width = 12
  const height = 24
  const material = new Uint8Array(width * height)
  const heat = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < 6; x++) {
      material[y * width + x] = 1
      heat[y * width + x] = 100
    }
  }
  for (let x = 0; x < 6; x++) {
    material[6 * width + x] = 2
    heat[6 * width + x] = 180
  }
  assert.deepEqual([...cellSamples({ width, height, material }, heat)], [180, 100])
})

test('the butterfly levels come from its light-theme heat', () => {
  const width = 6
  const height = 12
  const material = new Uint8Array(width * height).fill(1)
  const heat = new Uint8Array(width * height).fill(50)
  const heatLight = new Uint8Array(width * height).fill(200)
  const levels = butterflyLevels({ width, height, material, heat, heatLight })
  assert.equal(levels[200], 1)
  assert.ok(levels[50] < 1)
})

test('trail warmth: faint warmth kept, strong warmth raised to the warm end', () => {
  assert.equal(lightWarmth(0), 0)
  assert.equal(lightWarmth(1), 1)
  for (const warmth of [0.02, 0.05, 0.08]) assert.equal(lightWarmth(warmth), warmth)
  let previous = 0
  for (let i = 1; i <= 100; i++) {
    const warmth = i / 100
    const raised = lightWarmth(warmth)
    assert.ok(raised >= warmth && raised <= 1, `warmth ${warmth}`)
    assert.ok(raised >= previous, `warmth ${warmth}`)
    previous = raised
  }
  // the middle of a moving trail (warmth about 0.45) gets close to the top
  assert.ok(lightWarmth(0.45) > 0.8)
})
