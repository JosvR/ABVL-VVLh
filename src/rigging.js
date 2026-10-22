export const MATERIALS = {
  chain: { label: 'Ketting', single: 3150, short: 'ketting', description: 'Sterk en geschikt voor veel industriële lasten.' },
  webbing: { label: 'Hijsband', single: 2000, short: 'hijsband', description: 'Bescherm de band tegen scherpe randen.' },
  wire: { label: 'Staalkabel', single: 1300, short: 'staalkabel', description: 'Let op knikken, draadbreuken en buigradius.' },
};

export const INITIAL = { weight: 1800, single: 2000, angle: 30, legs: 2, method: 'direct', material: 'webbing', symmetric: true };

// Lesbrief 7, versie 2.0 (15-02-2023), p. 7–8. De tekst en de
// voorbeelden spreken elkaar tegen op de grenswaarden. Volg hier
// conservatief voorbeeld 4 (45° in de tweede groep) en de tekst bij
// voorbeeld 5 (vanaf 60° geen toegestane waarde). Geen interpolatie.
export function calculateRigging(input) {
  const { weight, single, angle, legs, method, symmetric } = input;
  if (![weight, single, angle].every(Number.isFinite) || weight <= 0 || single <= 0 || angle < 0 || angle > 75 || ![2, 4].includes(legs) || !['direct', 'choke'].includes(method) || typeof symmetric !== 'boolean') {
    return { status: 'invalid', capacity: null, factor: null, forceKN: null, utilization: null, reason: 'Vul een geldig lastgewicht en een geldige WLL in.' };
  }
  const carryingLegs = legs === 4 ? 3 : 2;
  // Statisch rekenmodel: bij 4 lengen conservatief 3 dragende lengen.
  // Dit voorspelt niet de werkelijke verdeling over een viersprong.
  const equivalentKg = weight / (carryingLegs * Math.cos(angle * Math.PI / 180));
  const forceKN = equivalentKg * 9.81 / 1000;
  const force = { forceKN, equivalentKg, carryingLegs };
  if (!symmetric) return { ...force, status: 'unsupported', capacity: null, factor: null, utilization: null, reason: 'Zwaartepunt uit het midden: raadpleeg de gebruiksaanwijzing. Deze tabel geldt alleen bij symmetrische belasting.' };
  if (legs === 4 && method === 'choke') return { ...force, status: 'unsupported', capacity: null, factor: null, utilization: null, reason: 'Voor een gestropte viersprong verwijst de lesbrief naar de gebruiksaanwijzing. Er is hier geen algemene factor beschikbaar.' };
  if (angle >= 60) return { ...force, status: 'forbidden', capacity: null, factor: null, utilization: null, reason: 'Niet hijsen in deze oefening. Kies een buitenhoek kleiner dan 60°. Op precies 60° volgen we de voorzichtige uitleg uit de lesbrief.' };
  const baseFactor = legs === 2 ? (angle < 45 ? 1.4 : 1) : (angle < 45 ? 2.1 : 1.5);
  const chokeFactor = method === 'choke' ? 0.8 : 1;
  const factor = Number((baseFactor * chokeFactor).toFixed(2));
  const capacity = Number((single * factor).toFixed(6));
  const utilization = weight / capacity * 100;
  return { ...force, factor, baseFactor, chokeFactor, capacity, utilization, status: weight > capacity ? 'overload' : utilization >= 90 ? 'close' : 'within', reason: '' };
}

export const EXERCISES = [
  { id: 'pump', title: 'Een pomp op zijn plek', category: 'Pompen & onderhoud', description: 'Je verplaatst een pompunit van 1.800 kg. Je gebruikt twee hijsbanden, direct aangeslagen. De WLL van één band is 2.000 kg en de buitenhoek is 30°.', config: { ...INITIAL }, answer: 'within', question: 'Past deze last binnen de WLL van het samenstel?', explanation: 'Bij 30° heeft de tweesprong factor 1,4. De WLL van het samenstel is 2.000 × 1,4 = 2.800 kg. De last van 1.800 kg blijft daaronder.' },
  { id: 'pipe', title: 'Een leidingdeel stroppen', category: 'Leidingen & montage', description: 'Een leidingdeel van 1.800 kg hangt in een gestropte tweesprong. De hijsbanden hebben elk een WLL van 2.000 kg. De buitenhoek is 50°.', config: { ...INITIAL, weight: 1800, angle: 50, method: 'choke' }, answer: 'overload', question: 'Kun je deze combinatie gebruiken?', explanation: 'Bij 50° is de basisfactor 1,0. Stroppen geeft nog factor 0,8. De WLL wordt 2.000 × 1,0 × 0,8 = 1.600 kg. De last is 200 kg te zwaar. Kies passend hijsgereedschap of een kleinere hoek als de situatie dit toelaat.' },
  { id: 'skid', title: 'Vier lengen, vier keer zo sterk?', category: 'Installaties & skids', description: 'Een skid van 6.000 kg hangt symmetrisch aan een directe viersprong. De WLL per kettingleng is 3.150 kg. De buitenhoek is 40°.', config: { ...INITIAL, weight: 6000, single: 3150, angle: 40, legs: 4, material: 'chain' }, answer: 'within', question: 'Blijft deze last binnen de WLL van het samenstel?', explanation: 'De factor is 2,1, niet 4. De WLL is 3.150 × 2,1 = 6.615 kg. Reken bij een viersprong niet op vier gelijk dragende lengen. De tabel rekent conservatief met drie.' },
  { id: 'angle', title: 'De haak hangt te laag', category: 'Hoek & krachten', description: 'Een motor van 1.200 kg hangt aan een directe tweesprong van staalkabels. De WLL per leng is 1.300 kg. De buitenhoek is 65°.', config: { ...INITIAL, weight: 1200, single: 1300, angle: 65, material: 'wire' }, answer: 'stop', question: 'Wat beslis je voordat de motor wordt gehesen?', explanation: 'Stop: 65° valt buiten de toegestane hoek in deze oefening. Een laag lastgewicht maakt een te grote buitenhoek niet goed. Verander de aanslagsituatie en controleer de gebruiksaanwijzing.' },
  { id: 'boundary', title: 'Precies op de grens', category: 'De lesbrief toepassen', description: 'Je gebruikt een directe viersprong van hijsbanden met een WLL van 2.000 kg per leng. De last weegt 3.200 kg en de buitenhoek is precies 45°.', config: { ...INITIAL, weight: 3200, legs: 4, angle: 45 }, answer: 'overload', question: 'Past de last binnen de WLL volgens deze oefening?', explanation: 'Voorbeeld 4 in de lesbrief plaatst precies 45° in de tweede hoekgroep. Daarom rekenen we met 1,5: 2.000 × 1,5 = 3.000 kg. De last is 200 kg te zwaar. In de praktijk zijn het label en de gebruiksaanwijzing leidend.' },
  { id: 'balance', title: 'Het zwaartepunt ligt opzij', category: 'Beoordelen vóór het hijsen', description: 'Een asymmetrische machine van 1.000 kg wordt met twee kettinglengen van 3.150 kg aangeslagen. De buitenhoek lijkt 30°, maar de motor zit helemaal aan één kant.', config: { ...INITIAL, weight: 1000, single: 3150, material: 'chain', symmetric: false }, answer: 'stop', question: 'Mag je de algemene factor 1,4 gebruiken?', explanation: 'Nee. De tabel geldt alleen voor symmetrische belasting. Een verschoven zwaartepunt verandert de verdeling over de lengen. Stop en raadpleeg de gebruiksaanwijzing of het hijsplan; deze app kan daarvoor geen WLL geven.' },
  { id: 'fourchoke', title: 'Een gestropte viersprong', category: 'De grenzen van een tabel', description: 'Je wilt een last van 2.000 kg met vier gestropte hijsbanden aanslaan. De WLL per leng is 2.000 kg en de buitenhoek is 35°.', config: { ...INITIAL, weight: 2000, legs: 4, method: 'choke', angle: 35 }, answer: 'stop', question: 'Kun je hier zelf factor 2,1 × 0,8 toepassen?', explanation: 'Nee. Bij een gestropte viersprong verwijst de tabel naar de gebruiksaanwijzing. Vermenigvuldig de algemene factoren hier niet zelf. Zoek de toegestane toepassing en capaciteit op voor het gebruikte samenstel.' },
  { id: 'sixty', title: 'Buitenhoek van 60°', category: 'Hoek & krachten', description: 'Een last van 900 kg hangt in een tweesprong met een WLL van 2.000 kg per leng. De buitenhoek is precies 60°.', config: { ...INITIAL, weight: 900, angle: 60 }, answer: 'stop', question: 'Wat geeft deze oefenapp als beslissing?', explanation: 'Deze app stopt vanaf 60° en volgt daarmee de voorzichtige tekst bij voorbeeld 5. De lesbrief is op deze grens niet eenduidig. Bij een echte hijs: volg het label en de gebruiksaanwijzing van het specifieke hijsgereedschap.' },
];
