<script lang="ts">
  import type { NormalizedLandingViewModel, PublicLandingFooter } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';

  let {
    organization,
    footer
  }: {
    organization: NormalizedLandingViewModel['organization'];
    footer: PublicLandingFooter;
  } = $props();

  function handleLink(href: string, e: MouseEvent) {
    e.preventDefault();
    const isExternal =
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:');
    requestNavigation(href, isExternal ? 'new-tab' : 'self');
  }
</script>

<footer class="aurora-footer">
  <div class="footer-container">
    <div class="top-row">
      <div class="brand-col">
        <div class="brand">
          {#if organization.logoUrl}
            <img src={organization.logoUrl} alt={organization.name} class="logo" />
          {/if}
          <span class="org-name">{organization.name}</span>
        </div>
        {#if footer.tagline}
          <p class="tagline">{footer.tagline}</p>
        {/if}

        {#if footer.socials && footer.socials.length > 0}
          <div class="socials-row">
            {#each footer.socials as social}
              <a
                href={social.href}
                class="social-link"
                onclick={(e) => handleLink(social.href, e)}
              >
                <span>{social.platform}</span>
              </a>
            {/each}
          </div>
        {/if}
      </div>

      {#if footer.columns && footer.columns.length > 0}
        <div class="columns-wrap">
          {#each footer.columns as col}
            <div class="column">
              <h4 class="col-title">{col.heading}</h4>
              <ul class="col-list">
                {#each col.links as link}
                  <li>
                    <a
                      href={link.href}
                      class="col-link"
                      onclick={(e) => handleLink(link.href, e)}
                    >
                      {link.label}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="bottom-bar">
      <div class="copyright">
        <span>{footer.copyright || `© ${new Date().getFullYear()} ${organization.name}. All rights reserved.`}</span>
        {#if footer.bottomText}
          <span class="bottom-text">{footer.bottomText}</span>
        {/if}
      </div>

      {#if footer.bottomLinks && footer.bottomLinks.length > 0}
        <div class="bottom-links">
          {#each footer.bottomLinks as link}
            <a
              href={link.href}
              class="bottom-link"
              onclick={(e) => handleLink(link.href, e)}
            >
              {link.label}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</footer>

<style>
  .aurora-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #050608;
    padding: 4.5rem 1.5rem 2.5rem;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 3rem;
    flex-wrap: wrap;
    margin-bottom: 3.5rem;
  }

  .brand-col {
    max-width: 360px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .logo {
    height: 2.25rem;
    width: auto;
    object-fit: contain;
    border-radius: 6px;
  }

  .org-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
  }

  .tagline {
    margin: 0 0 1.25rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #94a3b8;
  }

  .socials-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .social-link {
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .social-link:hover {
    color: #22d3ee;
    border-color: rgba(34, 211, 238, 0.4);
  }

  .columns-wrap {
    display: flex;
    gap: 3.5rem;
    flex-wrap: wrap;
  }

  .column {
    min-width: 140px;
  }

  .col-title {
    margin: 0 0 1rem;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #ffffff;
  }

  .col-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .col-link {
    font-size: 0.875rem;
    color: #64748b;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .col-link:hover {
    color: #f8fafc;
  }

  .bottom-bar {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    color: #64748b;
  }

  .bottom-links {
    display: flex;
    gap: 1.25rem;
  }

  .bottom-link {
    color: #64748b;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .bottom-link:hover {
    color: #94a3b8;
  }
</style>
