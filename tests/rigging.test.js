import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRigging, formatUtilization, INITIAL, EXERCISES } from '../src/rigging.js';
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

test('screenshot: 1800 kg op een samenstel van 2000 kg bij 46° is precies 90%', () => {
  const result = calc({ weight: 1800, single: 2000, angle: 46 });
  assert.equal(result.capacity, 2000);
  assert.equal(result.utilization, 90);
  assert.equal(result.status, 'close');
  assert.equal(formatUtilization(result), '90%');
  assert.ok(Math.abs(result.forceKN - 12.709) < .01);
  const smallerAngle = calc({ weight: 1800, single: 2000, angle: 30 });
  assert.equal(smallerAngle.status, 'within');
  assert.equal(formatUtilization(smallerAngle), '64,29%');
});

test('percentage afronden mag geen grens van 90% of 100% suggereren die niet bereikt is', () => {
  for (const [weight, status, display] of [
    [1799.99, 'within', '<90%'],
    [1800, 'close', '90%'],
    [1800.01, 'close', '90%'],
    [1999.99, 'close', '<100%'],
    [2000, 'close', '100%'],
    [2000.01, 'overload', '>100%'],
    [2100, 'overload', '105%'],
    [.00001, 'within', '<0,01%'],
  ]) {
    const result = calc({ weight, angle: 46 });
    assert.equal(result.status, status, String(weight));
    assert.equal(formatUtilization(result), display, String(weight));
  }
  assert.equal(formatUtilization(calc({ angle: 60 })), '—');
  assert.equal(formatUtilization(calc({ symmetric: false })), '—');
});

test('waarschuwing volgt de WLL bij iedere sliderhoek, materiaalkeuze en berekenbare aanslagwijze', () => {
  const methods = [
    { legs: 2, method: 'direct', factors: [1.4, 1] },
    { legs: 2, method: 'choke', factors: [1.12, .8] },
    { legs: 4, method: 'direct', factors: [2.1, 1.5] },
  ];
  let checked = 0;
  for (const single of [1300, 2000, 3150]) for (const setup of methods) for (let angle = 0; angle <= 75; angle++) {
    const expectedCapacity = single * setup.factors[angle < 45 ? 0 : 1];
    for (const fraction of [.2, .89999, .9, .99999, 1, 1.00001, 1.2]) {
      const weight = Number((expectedCapacity * fraction).toFixed(7));
      const result = calc({ single, angle, legs: setup.legs, method: setup.method, weight });
      const label = `${single} kg, ${setup.legs}-sprong ${setup.method}, ${angle}°, ${weight} kg`;
      if (angle >= 60) {
        assert.equal(result.status, 'forbidden', label);
        assert.equal(result.utilization, null, label);
      } else {
        assert.ok(Math.abs(result.capacity - expectedCapacity) < .000001, label);
        assert.equal(result.status, fraction > 1 ? 'overload' : fraction >= .9 ? 'close' : 'within', label);
        assert.ok(Math.abs(result.utilization - fraction * 100) < .000001, label);
      }
      checked++;
    }
  }
  assert.equal(checked, 4788);
});
