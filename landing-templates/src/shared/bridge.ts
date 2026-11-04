import type { PublicLandingPageViewModel } from './types';

export function requestNavigation(href: string, disposition: 'self' | 'new-tab' = 'self') {
  if (typeof window === 'undefined') return;

  const message = {
    type: 'LANDING_PAGE_NAVIGATE',
    action: 'landing-page:navigate',
    payload: { href, disposition }
  };

  window.parent.postMessage(message, '*');
}

export function requestAuth() {
  if (typeof window === 'undefined') return;

  const message = {
    type: 'LANDING_PAGE_AUTH',
    action: 'landing-page:auth'
  };

  window.parent.postMessage(message, '*');
}

export function sendResize(height: number) {
  if (typeof window === 'undefined') return;

  const message = {
    type: 'CIO_BRIDGE_RESIZE',
    action: 'landing-page:resize',
    height
  };

  window.parent.postMessage(message, '*');
}

export function initLandingBridge(callbacks: {
  onViewModel: (viewModel: PublicLandingPageViewModel) => void;
  onTheme?: (theme: 'light' | 'dark') => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  function handleMessage(event: MessageEvent) {
    const data = event.data;
    if (typeof data !== 'object' || data === null) return;

    if (data.type === 'CIO_BRIDGE_HANDSHAKE_ACK') {
      if (data.context?.viewModel) {
        callbacks.onViewModel(data.context.viewModel);
      }
      if (data.context?.theme && callbacks.onTheme) {
        callbacks.onTheme(data.context.theme);
      }
      return;
    }

    if (data.type === 'LANDING_PAGE_PROPS_UPDATE' && data.viewModel) {
      callbacks.onViewModel(data.viewModel);
      return;
    }
  }

  window.addEventListener('message', handleMessage);

  // Send handshake init
  const nonce = Math.random().toString(36).slice(2);
  window.parent.postMessage({ type: 'CIO_BRIDGE_HANDSHAKE_INIT', nonce }, '*');

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

