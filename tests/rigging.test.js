import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRigging, INITIAL, EXERCISES } from '../src/rigging.js';
const calc = overrides => calculateRigging({ ...INITIAL, ...overrides });

test('lesbrief voorbeeld 1: ketting 3150 kg, 2-sprong, 40° → 4410 kg', () => {
  assert.equal(calc({ single: 3150, angle: 40 }).capacity, 4410);
});
test('lesbrief voorbeeld 2: hijsband 2000 kg, 2-sprong, 50° → 2000 kg', () => {
  assert.equal(calc({ angle: 50 }).capacity, 2000);
});
test('lesbrief voorbeeld 3: gestropte hijsband 2000 kg, 50° → 1600 kg', () => {
  assert.equal(calc({ angle: 50, method: 'choke' }).capacity, 1600);
});
test('lesbrief voorbeeld 4: 45° valt conservatief in de tweede hoekgroep', () => {
  assert.equal(calc({ legs: 4, angle: 45 }).capacity, 3000);
  assert.equal(calc({ legs: 4, angle: 44 }).capacity, 4200);
  assert.equal(calc({ angle: 45 }).capacity, 2000);
});
test('lesbrief voorbeeld 5 en grenswaarde: vanaf 60° geen toegestane WLL', () => {
  for (const angle of [60, 61, 70, 75]) {
    const result = calc({ angle });
    assert.equal(result.status, 'forbidden');
    assert.equal(result.capacity, null);
    assert.equal(result.factor, null);
  }
  assert.equal(calc({ angle: 59 }).capacity, 2000);
});
test('gestropte 2-sprong heeft factor 1,12 zonder afrondingsfout aan de WLL', () => {
  const result = calc({ method: 'choke', weight: 2240 });
  assert.equal(result.factor, 1.12);
  assert.equal(result.capacity, 2240);
  assert.equal(result.status, 'close');
  assert.equal(result.utilization, 100);
  assert.equal(calc({ method: 'choke', weight: 2240.01 }).status, 'overload');
});
test('WLL overschrijden, exact bereiken en 90% benutten blijven onderscheiden', () => {
  assert.equal(calc({ weight: 2801 }).status, 'overload');
  assert.equal(calc({ weight: 2800 }).status, 'close');
  assert.equal(calc({ weight: 2520 }).status, 'close');
  assert.equal(calc({ weight: 2519 }).status, 'within');
});
test('asymmetrisch heeft geen algemene factor of krachtuitkomst voor gebruik', () => {
  const result = calc({ symmetric: false });
  assert.equal(result.status, 'unsupported');
  assert.equal(result.capacity, null);
  assert.equal(result.factor, null);
});
test('gestropte viersprong vereist gebruiksaanwijzing en krijgt geen ×0,8', () => {
  const result = calc({ legs: 4, method: 'choke' });
  assert.equal(result.status, 'unsupported');
  assert.equal(result.capacity, null);
  assert.equal(result.factor, null);
});
test('ongeldige invoer krijgt geen positief oordeel', () => {
  for (const weight of [0, -1, NaN, Infinity, '1800']) assert.equal(calc({ weight }).status, 'invalid');
  for (const single of [0, -2, NaN, Infinity]) assert.equal(calc({ single }).status, 'invalid');
  for (const angle of [-1, 76, NaN]) assert.equal(calc({ angle }).status, 'invalid');
  assert.equal(calc({ legs: 3 }).status, 'invalid');
  assert.equal(calc({ method: 'basket' }).status, 'invalid');
});
test('doosvoorbeeld 9 kg: 0° → 4,5 kg equivalent; 45° → circa 6,4; 60° → 9', () => {
  assert.equal(calc({ weight: 9, angle: 0 }).equivalentKg, 4.5);
  assert.ok(Math.abs(calc({ weight: 9, angle: 45 }).equivalentKg - 6.364) < .001);
  assert.ok(Math.abs(calc({ weight: 9, angle: 60 }).equivalentKg - 9) < .001);
});
test('trekkracht neemt toe met de buitenhoek, met correcte eenheid kN', () => {
  const low = calc({ angle: 0 }), mid = calc({ angle: 30 }), high = calc({ angle: 50 });
  assert.ok(low.forceKN < mid.forceKN && mid.forceKN < high.forceKN);
  assert.ok(Math.abs(mid.forceKN - 10.19485) < .0001);
});
test('viersprong gebruikt 3 dragende lengen, niet 4', () => {
  const result = calc({ legs: 4, angle: 0 });
  assert.equal(result.carryingLegs, 3);
  assert.equal(result.equivalentKg, 600);
  assert.equal(result.factor, 2.1);
});
test('alle praktijkopdrachten komen overeen met de rekenregels', () => {
  for (const exercise of EXERCISES) {
    const result = calculateRigging(exercise.config);
    const answer = ['within', 'close'].includes(result.status) ? 'within' : result.status === 'overload' ? 'overload' : 'stop';
    assert.equal(answer, exercise.answer, exercise.id);
  }
});
