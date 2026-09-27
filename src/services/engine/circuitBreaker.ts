import { ProviderHealth, ProviderId, CircuitState } from '../../types';
import { INITIAL_PROVIDERS } from './seedData';

export class CircuitBreakerRegistry {
  private providers: Map<ProviderId, ProviderHealth> = new Map();

  constructor() {
    INITIAL_PROVIDERS.forEach(p => {
      this.providers.set(p.id, { ...p });
    });
  }

  public getAllProviders(): ProviderHealth[] {
    return Array.from(this.providers.values());
  }

  public getProvider(id: ProviderId): ProviderHealth | undefined {
    return this.providers.get(id);
  }

  public tripCircuit(id: ProviderId): ProviderHealth | undefined {
    const p = this.providers.get(id);
    if (p) {
      p.circuitState = 'OPEN';
      p.status = 'down';
      p.failureRate5m = 0.45;
      p.lastChecked = new Date().toISOString();
    }
    return p;
  }

  public resetCircuit(id: ProviderId): ProviderHealth | undefined {
    const p = this.providers.get(id);
    if (p) {
      p.circuitState = 'CLOSED';
      p.status = 'healthy';
      p.failureRate5m = 0.005;
      p.lastChecked = new Date().toISOString();
    }
    return p;
  }

  public testProviderHealth(id: ProviderId): ProviderHealth | undefined {
    const p = this.providers.get(id);
    if (p) {
      p.latencyMs = Math.floor(Math.random() * 200 + 250);
      p.lastChecked = new Date().toISOString();
      if (p.circuitState === 'CLOSED') {
        p.status = 'healthy';
      }
    }
    return p;
  }
}

export const circuitBreakers = new CircuitBreakerRegistry();
