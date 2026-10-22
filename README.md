# Hijsinzicht · ABVL / VVLh

Nederlandstalige oefenapp over het aanslaan van lasten, buitenhoeken, werklastfactoren en trekkracht. Voor individueel gebruik op een telefoon en klassikaal op een scherm. Gebouwd met React en Vite; geen backend, accounts, analytics of API-sleutels nodig. Lettertypen zijn lokaal meegebundeld.

## Ontwikkelen

Node.js 24 en npm zijn getest.

```sh
npm ci
npm run dev
```

De devserver gebruikt poort 5173. Bij een npm-cache zonder schrijfrechten: `npm ci --cache /tmp/abvl-npm-cache`.

```sh
npm test           # Berekeningen, lesbriefvoorbeelden, grenzen, oefenantwoorden
npm run build     # Zelfstandige website in dist/
npm run preview   # Productiebundel op poort 4173
npm run test:e2e  # Chromium: bediening, voortgang, QR, downloads en schermformaten
```

De browsertests gebruiken standaard `/usr/bin/chromium`. Stel `CHROMIUM_PATH` in voor een andere geïnstalleerde Chromium-binary. Gebruik voor CI desgewenst `npx playwright install --with-deps chromium` en pas `executablePath` aan naar de geïnstalleerde browser; de Pages-workflow draait de rekentests en build.

## Gebruik in de les

- **Hijssimulator:** stel lastgewicht, materiaal, WLL van één leng, aantal lengen en methode in. Verander de buitenhoek en vergelijk WLL met trekkracht.
- **Praktijkopdrachten:** acht situaties met feedback en lokaal opgeslagen voortgang. Geen gezamenlijke uitslagen of gegevensuitwisseling tussen apparaten.
- **Lesmodus:** vergroot de uitleg en resultaten, verbergt de zijbalk en probeert fullscreen te activeren. Werkt ook als fullscreen niet beschikbaar is.
- **Delen & QR-code:** kopieer de link, download een QR-code of een presentatiedia van 1920 × 1080. Het URL-veld kan worden aangepast voor andere hosting. Downloads bevatten hetzelfde adres als het invoerveld.
- Telefoon: de beoordeling blijft onderaan zichtbaar. Tik erop om naar de volledige uitkomst te springen.

## Publiceren op GitHub Pages

Beoogd adres: **https://josvr.github.io/ABVL-VVLh/**. Dit adres werkt pas nadat publicatie is geslaagd.

1. Plaats deze bestanden in de `main`-branch van `JosvR/ABVL-VVLh`.
2. Kies in GitHub **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. De workflow **Test en publiceer Hijsinzicht** draait bij een push op `main`; start hem zo nodig handmatig onder **Actions**.
4. Controleer of de deployment groen is en open het publieke adres op een telefoon voordat je de QR-code in de les gebruikt.

`vite.config.js` gebruikt relatieve assetpaden. De inhoud van `dist/` kan daardoor ook op andere statische hosting worden geplaatst. `npm run build` maakt geen publicatie; alleen het uitvoeren van de Pages-workflow publiceert.

## Inhoudelijke rekenafspraken

Bron: *Lesbrief 7 – Verminderingsfactoren 2- en 4-sprongen*, WBC VVL, versie 2.0, 15 februari 2023, © SSVV / VCA Examenbank. De aangeleverde bron staat in `public/lesbrief-7.pdf` en is vanuit de app te openen.

De tekst en de tabel spreken elkaar tegen op de grenswaarden. De app kiest expliciet conservatief, conform voorbeeld 4 en de tekst bij voorbeeld 5 op pagina 8:

| Buitenhoek β t.o.v. verticaal | 2-sprong direct | 4-sprong direct |
| --- | --- | --- |
| 0° ≤ β < 45° | 1,4 | 2,1 |
| 45° ≤ β < 60° | 1,0 | 1,5 |
| β ≥ 60° | Geen toegestane WLL in de oefening | Geen toegestane WLL in de oefening |

Gestropt: alleen bij de tweesprong wordt nog factor 0,8 toegepast. Voor de gestropte viersprong en voor asymmetrische belasting verwijst de app naar de gebruiksaanwijzing en geeft hij geen WLL of bruikbaar krachtresultaat. Het materiaaltype kiest uitsluitend een voorbeeld-WLL; materiaal bepaalt niet zelfstandig de capaciteit.

De krachtpijlen tonen een statisch onderwijsmodel: `T = massa × 9,81 / (n × cos β) / 1000` in kN. Voor de tweesprong is `n = 2`, voor de viersprong conservatief `n = 3`. De werkelijke verdeling bij een viersprong kan afwijken. De kracht is **geen aanvullende WLL**. De SVG is schematisch en geen hijsplan.

Alleen voor onderwijs. Label, gebruiksaanwijzing en hijsplan zijn leidend voor een echte hijs. Laat de rekenafspraken en oefenteksten door de cursusverantwoordelijke beoordelen vóór structureel lesgebruik. De vormgeving gebruikt marineblauw en oranje als aansluiting op de gevraagde industriële uitstraling; dit is geen officiële huisstijlcertificering.
