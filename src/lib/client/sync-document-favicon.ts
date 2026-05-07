const ATTR = 'data-rosvelte-dynamic-favicon';

/** Move tab favicon reliably (Chromium often ignores SPA href updates on `<link rel="icon">`). */
export function syncDocumentFavicon(href: string): void {
	if (typeof document === 'undefined') return;

	for (const el of document.querySelectorAll(`link[${ATTR}]`)) {
		el.remove();
	}

	const link = document.createElement('link');
	link.setAttribute(ATTR, 'true');
	link.rel = 'icon';
	link.href = href;
	document.head.insertBefore(link, document.head.firstChild);

	/** Second pass: keep only our injected icon so earlier head entries don't win over the browser. */
	for (const el of [...document.querySelectorAll('link[rel~="icon"]')]) {
		const e = el as HTMLLinkElement;
		if (!e.hasAttribute(ATTR)) e.remove();
	}
}
