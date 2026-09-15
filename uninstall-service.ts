import { Service } from 'node-windows';
import * as path from 'path';

const svc = new Service({
  name: 'WieszkaAntivirusEngine',
  script: path.join(__dirname, 'server.ts')
});

svc.on('uninstall', () => {
  console.log('Antywirus został pomyślnie odinstalowany z usług Windows.');
});

svc.uninstall();
