import { createNamespace, getNamespace, Namespace } from 'cls-hooked';

export const REQUEST_CONTEXT_NAMESPACE = 'REQUEST_CONTEXT';

export const contextNamespace: Namespace =
  getNamespace(REQUEST_CONTEXT_NAMESPACE) || createNamespace(REQUEST_CONTEXT_NAMESPACE);

export class RequestContextService {
  static get<T = any>(key: string): T {
    return contextNamespace.get(key);
  }

  static set<T = any>(key: string, value: T): void {
    contextNamespace.set(key, value);
  }

  static run(callback: (...args: any[]) => void) {
    contextNamespace.run(callback);
  }
}