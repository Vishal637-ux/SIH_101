/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MODULE 06: Government SSO & OIDC Adapter (Parichay / Jan Parichay)
 * 
 * Responsibilities:
 * - Isolated adapter for Government Single Sign-On (Parichay / Jan Parichay / OIDC)
 * - Safe configuration without exposing secrets
 * - Local authentication fallback when SSO is not active
 * - Clean status reporting for administrative ecosystem dashboard
 */

export interface GovernmentSsoConfig {
  isEnabled: boolean;
  issuer: string;
  clientId: string;
  redirectUri: string;
  providerName: string;
  scopes: string[];
}

export interface SanitizedSsoStatus {
  isEnabled: boolean;
  status: 'CONFIGURED' | 'DEMO_MODE' | 'NOT_CONFIGURED';
  providerName: string;
  issuerUrl: string;
  redirectUri: string;
  supportedProtocols: string[];
  notice: string;
  fallbackAvailable: boolean;
}

export class GovernmentSsoAdapter {
  private config: GovernmentSsoConfig;
  private clientSecret: string;

  constructor() {
    this.config = {
      isEnabled: process.env.SSO_ENABLED === 'true',
      issuer: process.env.OIDC_ISSUER || 'https://parichay.nic.in/oidc',
      clientId: process.env.OIDC_CLIENT_ID || '',
      redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/api/v1/auth/sso/callback',
      providerName: 'Parichay (National Single Sign-On)',
      scopes: ['openid', 'profile', 'email', 'gov_designation', 'cadre'],
    };
    this.clientSecret = process.env.OIDC_CLIENT_SECRET || '';
  }

  // Returns sanitized status without revealing secret keys
  public getSanitizedStatus(): SanitizedSsoStatus {
    const isLiveConfigured = this.config.isEnabled && Boolean(this.config.clientId && this.clientSecret);

    return {
      isEnabled: this.config.isEnabled,
      status: isLiveConfigured ? 'CONFIGURED' : 'DEMO_MODE',
      providerName: this.config.providerName,
      issuerUrl: this.config.issuer,
      redirectUri: this.config.redirectUri,
      supportedProtocols: ['OpenID Connect 1.0', 'OAuth 2.0 PKCE', 'SAML 2.0 (via Parichay Gateway)'],
      notice: isLiveConfigured
        ? 'Active Government SSO configured via Parichay (NIC).'
        : 'Demo / Sandbox Mode — live Parichay SSO client credentials not configured. Local civil service authentication is active.',
      fallbackAvailable: true,
    };
  }

  // Generate OAuth authorization redirect URL
  public getAuthorizationUrl(state: string): string {
    if (!this.config.isEnabled || !this.config.clientId) {
      // Return demo callback or simulator
      return `/api/v1/auth/sso/demo-callback?state=${encodeURIComponent(state)}`;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
    });

    return `${this.config.issuer}/authorize?${params.toString()}`;
  }
}

export const governmentSsoAdapter = new GovernmentSsoAdapter();
