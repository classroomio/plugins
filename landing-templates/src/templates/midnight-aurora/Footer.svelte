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

<footer class="obsidian-footer">
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
                title={social.platform}
                aria-label={social.platform}
                onclick={(e) => handleLink(social.href, e)}
              >
                <SocialIcon platform={social.platform} size={16} />
              </a>
            {/each}
          </div>
        {/if}
      </div>

      {#if footer.columns && footer.columns.length > 0}
        <div class="columns-wrap">
          {#each footer.columns as col}
            <div class="col">
              <h4 class="col-heading">{col.heading}</h4>
              <ul class="col-links">
                {#each col.links as link}
                  <li>
                    <a
                      href={link.href}
                      class="link"
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

    <div class="bottom-row">
      <p class="copyright">
        © {new Date().getFullYear()} {organization.name}. {footer.bottomText || messages.rightsReserved}
      </p>

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
  .obsidian-footer {
    padding: 4.5rem 1.5rem 2.5rem;
    background: #06070a;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
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
    max-width: 320px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.875rem;
  }

  .logo {
    height: 1.875rem;
    width: auto;
    object-fit: contain;
    border-radius: 4px;
  }

  .org-name {
    font-size: 1.0625rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .tagline {
    margin: 0 0 1.25rem;
    font-size: 0.84375rem;
    line-height: 1.55;
    color: #64748b;
  }

  .socials-row {
    display: flex;
    gap: 0.5rem;
  }

  .social-link {
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-color: rgba(99, 102, 241, 0.4);
  }

  .columns-wrap {
    display: flex;
    gap: 3.5rem;
    flex-wrap: wrap;
  }

  .col {
    min-width: 120px;
  }

  .col-heading {
    margin: 0 0 1rem;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #cbd5e1;
  }

  .col-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .link {
    font-size: 0.84375rem;
    color: #64748b;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .link:hover {
    color: #ffffff;
  }

  .bottom-row {
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .copyright {
    margin: 0;
    font-size: 0.8125rem;
    color: #475569;
  }

  .bottom-links {
    display: flex;
    gap: 1.5rem;
  }

  .bottom-link {
    font-size: 0.8125rem;
    color: #475569;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .bottom-link:hover {
    color: #94a3b8;
  }
</style>
