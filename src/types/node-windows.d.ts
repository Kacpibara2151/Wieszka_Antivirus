declare module 'node-windows' {
  export interface ServiceConfig {
    name: string;
    description?: string;
    script: string;
    env?: { name: string; value: string }[];
  }

  export class Service {
    constructor(config: ServiceConfig);
    on(event: 'install' | 'alreadyinstalled' | 'uninstall' | string, callback: () => void): void;
    install(): void;
    uninstall(): void;
    start(): void;
    stop(): void;
  }
}
