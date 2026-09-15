import { Service } from 'node-windows';
import * as path from 'path';

// Konfiguracja usługi antywirusa
const svc = new Service({
  name: 'WieszkaAntivirusEngine',
  description: 'Silnik głębokiego skanowania oraz monitorowania CPU/RAM dla Antywirusa Wieszka.',
  script: path.join(__dirname, 'server.ts'),
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

// Logika po pomyślnej instalacji
svc.on('install', () => {
  console.log('Sukces: Antywirus został zainstalowany jako usługa Windows!');
  svc.start();
  console.log('Silnik antywirusa został pomyślnie uruchomiony w tle.');
});

svc.on('alreadyinstalled', () => {
  console.log('Ta usługa jest już zainstalowana w systemie.');
});

// Uruchomienie instalacji
svc.install();
