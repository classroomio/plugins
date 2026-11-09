<script lang="ts">
  import type { NormalizedLandingViewModel, PublicLandingFooter } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import { getMessages } from '../../shared/i18n';
  import SocialIcon from '../../shared/SocialIcon.svelte';

  let {
    organization,
    footer,
    locale
  }: {
    organization: NormalizedLandingViewModel['organization'];
    footer: PublicLandingFooter;
    locale: string;
  } = $props();

  const messages = $derived(getMessages(locale));

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
                class="social-icon-btn"
                aria-label={social.platform}
                onclick={(e) => handleLink(social.href, e)}
              >
                <SocialIcon platform={social.platform} size={15} />
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
        <span>{footer.copyright || `© ${new Date().getFullYear()} ${organization.name}. ${messages.rightsReserved}`}</span>
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
    border-top: 1px solid rgba(17, 17, 20, 0.08);
    background: #ffffff;
    padding: 5rem 2rem 3rem;
  }

  .footer-container {
    max-width: 1240px;
    margin: 0 auto;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 4rem;
    padding-bottom: 3.5rem;
    border-bottom: 1px solid rgba(17, 17, 20, 0.06);
    flex-wrap: wrap;
  }

  .brand-col {
    max-width: 380px;
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
    border-radius: 4px;
  }

  .org-name {
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: 1.35rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #111114;
  }

  .tagline {
    margin: 0 0 1.5rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #71717a;
  }

  .socials-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .social-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    background: #f4f4f5;
    color: #52525b;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .social-icon-btn:hover {
    background: #111114;
    color: #ffffff;
    transform: translateY(-1px);
  }

  .columns-wrap {
    display: flex;
    gap: 4rem;
    flex-wrap: wrap;
  }

  .col-title {
    margin: 0 0 1.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #111114;
  }

  .col-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .col-link {
    color: #71717a;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.15s ease;
  }

  .col-link:hover {
    color: #111114;
  }

  .bottom-bar {
    padding-top: 2.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    color: #a1a1aa;
  }

  .copyright {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .bottom-text {
    color: #71717a;
  }

  .bottom-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .bottom-link {
    color: #71717a;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .bottom-link:hover {
    color: #111114;
  }

  @media (max-width: 768px) {
    .atelier-footer {
      padding: 3.5rem 1.25rem 2.5rem;
    }

    .top-row {
      flex-direction: column;
      gap: 2.5rem;
    }

    .columns-wrap {
      gap: 2.5rem;
    }
  }
</style>
