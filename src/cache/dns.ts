import NodeCache from "node-cache";
import { fetchDNSList } from "../utils/dns.js";

export class DNSCache {
  cache: NodeCache;
  constructor() {
    this.cache = new NodeCache({
      useClones: false,
    });
  }

  async get(topLevelDomain: string): Promise<string | null> {
    const registry = this.cache.get<string>(topLevelDomain);
    if (registry) {
      return registry;
    } else {
      let registry: string | null = null;
      const dns = await fetchDNSList();
      for (const service of dns.services) {
        for (const tld of service[0]) {
          const server = service[1][0];
          this.cache.set<string>(
            tld,
            server.endsWith("/") ? server.slice(0, -1) : server
          );
          if (tld === topLevelDomain) {
            registry = server.endsWith("/") ? server.slice(0, -1) : server;
          }
        }
      }
      return registry;
    }
  }

  async set(topLevelDomain: string, server: string) {
    this.cache.set<string>(
      topLevelDomain,
      server.endsWith("/") ? server.slice(0, -1) : server
    );
  }

  flush() {
    this.cache.flushAll();
  }
}
