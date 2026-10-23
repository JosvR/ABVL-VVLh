import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const PUBLIC_URL = 'https://josvr.github.io/ABVL-VVLh/';
async function decodeQR(path) {
  const png = PNG.sync.read(await readFile(path));
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
}

test('simulator reacts to mass, angles, method and unsupported combinations', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const result = page.locator('.result-panel');
  await expect(result.getByText('Binnen de WLL', { exact: true })).toBeVisible();
  await expect(page.locator('.capacity-value')).toHaveText('2.800 kg');
  await page.getByLabel('Gewicht van de last').fill('3000');
  await expect(result.getByText('WLL overschreden', { exact: true })).toBeVisible();
  await page.getByLabel('Herstel beginwaarden').click();
  await page.getByRole('button', { name: 'Gestropt' }).click();
  await expect(page.locator('.capacity-value')).toHaveText('2.240 kg');
  await page.getByRole('button', { name: '45°', exact: true }).click();
  await expect(page.locator('.capacity-value')).toHaveText('1.600 kg');
  await page.getByRole('button', { name: '60°', exact: true }).click();
  await expect(result.getByText('Stop · hoek te groot', { exact: true })).toBeVisible();
  await expect(page.locator('.capacity-value')).toHaveText('— kg');
  await page.getByRole('button', { name: '4-sprong', exact: true }).click();
  await expect(result.getByText('Eerst de gebruiksaanwijzing', { exact: true })).toBeVisible();
  await page.getByLabel('Herstel beginwaarden').click();
  await page.getByLabel('Symmetrische belasting').uncheck();
  await expect(result.getByText('Eerst de gebruiksaanwijzing', { exact: true })).toBeVisible();
  await page.getByLabel('Gewicht van de last').fill('');
  await expect(result.getByText('Controleer je invoer', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('practice feedback, retry, score and local progress work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start een oefening' }).click();
  await page.getByRole('button', { name: 'Binnen de WLL', exact: true }).click();
  await expect(page.getByText('Goed beoordeeld.')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Start een oefening' }).click();
  await expect(page.getByText('Goed beoordeeld.')).toBeVisible();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await page.getByRole('button', { name: 'Binnen de WLL', exact: true }).click();
  await expect(page.getByText('Bekijk deze keuze nog eens.')).toBeVisible();
  await page.getByRole('button', { name: 'Opnieuw proberen' }).click();
  await page.getByRole('button', { name: 'WLL overschreden', exact: true }).click();
  await expect(page.getByText('Goed beoordeeld.')).toBeVisible();
  await page.getByRole('button', { name: 'Onderzoek dit in de simulator' }).click();
  await expect(page.locator('.capacity-value')).toHaveText('1.600 kg');
  await expect(page.getByLabel('Gewicht van de last')).toHaveValue('1800');
});

test('share creates a QR, copies URL, and downloads presentation + QR', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Delen & QR-code' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByAltText(/^QR-code voor/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Kopieer de link' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('https://josvr.github.io/ABVL-VVLh/');
  const qrPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Alleen QR-code' }).click();
  const qrDownload = await qrPromise;
  expect(qrDownload.suggestedFilename()).toBe('hijsinzicht-qr.png');
  await qrDownload.saveAs('/tmp/hijsinzicht-qr-download.png');
  expect(await decodeQR('/tmp/hijsinzicht-qr-download.png')).toBe(PUBLIC_URL);
  const slidePromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download presentatiedia' }).click();
  const slide = await slidePromise;
  expect(slide.suggestedFilename()).toBe('hijsinzicht-presentatie-1920x1080.png');
  await slide.saveAs('/tmp/hijsinzicht-presentatie-1920x1080.png');
  expect(await decodeQR('/tmp/hijsinzicht-presentatie-1920x1080.png')).toBe(PUBLIC_URL);
  await dialog.getByLabel('Openbaar adres van de app').fill('javascript:alert(1)');
  await expect(dialog.getByRole('alert')).toContainText('geldig openbaar HTTPS-adres');
  await expect(dialog.getByRole('button', { name: 'Alleen QR-code' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('classroom mode toggles and source PDF is available', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lesmodus voor tv', exact: true }).click();
  await expect(page.locator('.app-shell')).toHaveClass(/class-mode/);
  await page.getByRole('button', { name: 'Verlaat lesmodus' }).click();
  await expect(page.locator('.app-shell')).not.toHaveClass(/class-mode/);
  await page.getByRole('button', { name: 'Hoe moet ik dit lezen?' }).click();
  await expect(page.getByRole('dialog')).toContainText('bij precies 45° geldt de lagere factor');
  const response = await page.request.get('/lesbrief-7.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});

test('desktop, projector and phone stay within the screen', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1080 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: `/tmp/hijsinzicht-${viewport.width}.png`, fullPage: true });
    const nav = page.getByRole('navigation', { name: viewport.width < 761 ? 'Tabbladen' : 'Hoofdnavigatie' });
    await nav.getByRole('button', { name: viewport.width < 761 ? 'Oefenen' : 'Praktijkopdrachten' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await nav.getByRole('button', { name: viewport.width < 761 ? 'Uitleg' : 'Zo werkt het' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  }
});

test('downloadable public QR and slide both encode the publication address', async () => {
  expect(await decodeQR('public/hijsinzicht-qr.png')).toBe(PUBLIC_URL);
  expect(await decodeQR('public/hijsinzicht-presentatie.png')).toBe(PUBLIC_URL);
});

test('mobile persistent result responds to angle changes and opens full assessment', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const summary = page.locator('.mobile-result-bar');
  await expect(summary).toContainText('2.800 kg');
  await page.getByRole('button', { name: '60°', exact: true }).click();
  await expect(summary).toContainText('Stop · hoek te groot');
  await summary.click();
  await expect(page.getByRole('heading', { name: 'Beoordeel je hijs' })).toBeInViewport();
});

test('numeric readings stay clear of the cables and arrows on TV and phone', async ({ page }) => {
  for (const [width, height, classroom] of [[1920, 1080, true], [1280, 720, true], [390, 844, false]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    if (classroom) await page.getByRole('button', { name: 'Lesmodus voor tv', exact: true }).click();
    for (const angle of [0, 30, 45, 46, 60, 75]) {
      await page.getByRole('button', { name: `${angle === 46 ? 45 : angle}°`, exact: true }).click();
      if (angle === 46) { await page.locator('#angle').focus(); await page.locator('#angle').press('ArrowRight'); }
      await expect(page.locator('.angle-reading strong')).toHaveText(`${angle}°`);
      const legend = await page.locator('.diagram-readings').boundingBox();
      const drawing = await page.locator('.rig-diagram > svg').boundingBox();
      expect(legend.y + legend.height).toBeLessThanOrEqual(drawing.y);
      await expect(page.locator('.diagram-force-arrow')).toHaveCount(2);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        allVisible: [...document.querySelectorAll('.simulator-grid > .panel')].every(e => e.getBoundingClientRect().bottom <= innerHeight),
      }));
      expect(layout.overflow).toBe(false);
      if (classroom) expect(layout.allVisible).toBe(true);
    }
  }
});

test('WLL warning and percentage update together when mass, WLL and angle change', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '45°', exact: true }).click();
  await page.locator('#angle').focus(); await page.locator('#angle').press('ArrowRight');
  await expect(page.locator('.status-card')).toHaveClass(/close/);
  await expect(page.locator('.status-card')).toContainText('90% van de WLL van het samenstel.');
  await expect(page.locator('.utilization-label strong')).toHaveText('90%');
  await expect(page.locator('.utilization-formula')).toHaveText('1.800 ÷ 2.000 × 100 = 90%');
  await page.getByLabel('Gewicht van de last').fill('1799.99');
  await expect(page.locator('.status-card')).toHaveClass(/within/);
  await expect(page.locator('.utilization-label strong')).toHaveText('<90%');
  await page.getByLabel('Gewicht van de last').fill('2000');
  await expect(page.locator('.utilization-label strong')).toHaveText('100%');
  await expect(page.locator('.margin-label')).toContainText('WLL volledig benut');
  await page.getByLabel('Gewicht van de last').fill('2000.01');
  await expect(page.locator('.status-card')).toHaveClass(/overload/);
  await expect(page.locator('.utilization-label strong')).toHaveText('>100%');
  await page.getByRole('button', { name: '30°', exact: true }).click();
  await expect(page.locator('.status-card')).toHaveClass(/within/);
  await expect(page.locator('.utilization-label strong')).toHaveText('71,43%');
  await page.getByLabel('WLL van één enkele leng').fill('1000');
  await expect(page.locator('.status-card')).toHaveClass(/overload/);
  await expect(page.locator('.utilization-label strong')).toHaveText('142,86%');
  await page.getByRole('button', { name: '60°', exact: true }).click();
  await expect(page.locator('.status-card')).toHaveClass(/forbidden/);
  await expect(page.locator('.utilization-label')).toHaveCount(0);
});
