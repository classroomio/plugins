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

<footer class="neo-footer">
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
                class="social-btn"
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
  .neo-footer {
    border-top: 3px solid #18181b;
    background: #fde047;
    padding: 4rem 1.5rem 2rem;
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
    border: 2px solid #18181b;
    border-radius: 4px;
    background: #ffffff;
  }

  .org-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: #18181b;
  }

  .tagline {
    margin: 0 0 1.25rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #18181b;
    font-weight: 500;
  }

  .socials-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .social-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.35rem 0.65rem;
    background: #ffffff;
    color: #18181b;
    border: 2px solid #18181b;
    border-radius: 4px;
    text-decoration: none;
    box-shadow: 2px 2px 0px #18181b;
    transition: all 0.12s ease;
  }

  .social-btn:hover {
    background: #18181b;
    color: #ffffff;
  }

  .columns-wrap {
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .column {
    min-width: 140px;
  }

  .col-title {
    margin: 0 0 1rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9375rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #18181b;
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
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: #18181b;
    text-decoration: none;
  }

  .col-link:hover {
    text-decoration: underline;
  }

  .bottom-bar {
    border-top: 2px solid #18181b;
    padding-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #18181b;
  }

  .bottom-links {
    display: flex;
    gap: 1.25rem;
  }

  .bottom-link {
    color: #18181b;
    text-decoration: none;
  }

  .bottom-link:hover {
    text-decoration: underline;
  }
</style>
