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

<footer class="atelier-footer">
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
  .atelier-footer {
    border-top: 1px solid rgba(214, 211, 209, 0.8);
    background: #f5f3ec;
    padding: 5rem 2rem 3rem;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 3.5rem;
    flex-wrap: wrap;
    margin-bottom: 4rem;
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
    height: 2rem;
    width: auto;
    object-fit: contain;
  }

  .org-name {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 500;
    color: #1c1917;
  }

  .tagline {
    margin: 0 0 1.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #78716c;
  }

  .socials-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .social-link {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #78716c;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .social-link:hover {
    color: #c2410c;
  }

  .columns-wrap {
    display: flex;
    gap: 3.5rem;
    flex-wrap: wrap;
  }

  .column {
    min-width: 130px;
  }

  .col-title {
    margin: 0 0 1rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #1c1917;
  }

  .col-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .col-link {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    color: #78716c;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .col-link:hover {
    color: #1c1917;
  }

  .bottom-bar {
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    padding-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    color: #78716c;
  }

  .bottom-links {
    display: flex;
    gap: 1.5rem;
  }

  .bottom-link {
    color: #78716c;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .bottom-link:hover {
    color: #1c1917;
  }
</style>
