import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class SeoMetadataStrategy extends TitleStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);

  // The router invokes this after navigation, both during prerendering and in the browser.
  // Only metadata is updated: the existing document title stays unchanged.
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const route = snapshot.root.firstChild;
    const description = route?.data['description'] as string | undefined;
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!description) {
      this.meta.removeTag('name="description"');
      canonical?.remove();
      return;
    }

    this.meta.updateTag({ name: 'description', content: description });
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = `https://tutor-website-717e5.web.app/${route?.routeConfig?.path ?? ''}`;
  }
}
