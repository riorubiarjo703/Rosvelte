<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	let rootEl: HTMLDivElement;

	const collectionsHref = resolve('/collections');
	const membershipHref = `${resolve('/')}#membership`;
	const historyHref = `${resolve('/')}#story`;

	onMount(() => {
		const root = rootEl;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					e.target.classList.add('visible');
					observer.unobserve(e.target);
				}
			},
			{ threshold: 0.09 }
		);

		const t = window.setTimeout(() => {
			root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => observer.observe(el));
			root.querySelectorAll<HTMLElement>('.about-hero .reveal').forEach((el) => {
				window.setTimeout(() => el.classList.add('visible'), 120);
			});
		}, 100);

		return () => {
			window.clearTimeout(t);
			observer.disconnect();
		};
	});
</script>

<div class="about-root" bind:this={rootEl}>
	<!-- HERO -->
	<section class="about-hero">
		<div class="hero-left">
			<p class="eyebrow reveal">Est. 1998 · Jakarta, Indonesia</p>
			<h1 class="hero-title reveal d1">
				We Seek<br />the <em>World's</em><br />Finest Spirits
			</h1>
			<p class="hero-body reveal d2">
				MMS — Maison de Spiritueux — was founded on a single conviction: that the finest liquors in the
				world deserve to be shared with those who truly appreciate them. For over two decades, we have
				sourced, curated, and delivered exceptional spirits from 18 countries to discerning collectors
				across Indonesia and beyond.
			</p>
			<div class="hero-scroll reveal d3">
				<div class="scroll-line"></div>
				Scroll to explore our story
			</div>
		</div>
		<div class="hero-right">
			<div class="hero-right-bg">
				<svg width="500" height="700" viewBox="0 0 500 700" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g opacity="0.18">
						<rect x="48" y="30" width="14" height="18" rx="2" fill="#C9A84C" />
						<path
							d="M48 48 Q44 72 42 96 L42 220 Q42 234 55 234 Q68 234 68 220 L68 96 Q66 72 62 48Z"
							fill="#C9A84C"
							stroke="#C9A84C"
							stroke-width="0.5"
						/>
						<rect x="44" y="130" width="22" height="40" rx="0" stroke="#C9A84C" stroke-width="0.4" fill="none" />
						<rect x="118" y="60" width="12" height="15" rx="2" fill="#C9A84C" />
						<path
							d="M118 75 Q115 95 113 115 L113 220 Q113 232 124 232 Q135 232 135 220 L135 115 Q133 95 130 75Z"
							fill="#C9A84C"
						/>
						<rect x="115" y="140" width="18" height="34" rx="0" stroke="#C9A84C" stroke-width="0.3" fill="none" />
						<rect x="188" y="20" width="18" height="20" rx="2" fill="#C9A84C" />
						<path
							d="M188 40 Q183 68 180 95 L180 230 Q180 246 197 246 Q214 246 214 230 L214 95 Q211 68 206 40Z"
							fill="#C9A84C"
						/>
						<rect x="182" y="128" width="30" height="50" rx="0" stroke="#C9A84C" stroke-width="0.4" fill="none" />
						<rect x="268" y="50" width="10" height="22" rx="2" fill="#C9A84C" />
						<path
							d="M268 72 Q266 94 264 112 L264 225 Q264 234 273 234 Q282 234 282 225 L282 112 Q280 94 278 72Z"
							fill="#C9A84C"
						/>
						<rect x="334" y="35" width="15" height="16" rx="2" fill="#C9A84C" />
						<path
							d="M334 51 Q330 74 328 98 L328 228 Q328 242 341 242 Q354 242 354 228 L354 98 Q352 74 349 51Z"
							fill="#C9A84C"
						/>
						<rect x="330" y="132" width="24" height="42" rx="0" stroke="#C9A84C" stroke-width="0.3" fill="none" />
						<rect x="405" y="55" width="12" height="18" rx="2" fill="#C9A84C" />
						<path
							d="M405 73 Q402 95 400 115 L400 222 Q400 234 411 234 Q422 234 422 222 L422 115 Q420 95 417 73Z"
							fill="#C9A84C"
						/>
					</g>
					<g opacity="0.09" transform="translate(0,280)">
						<rect x="70" y="30" width="14" height="18" rx="2" fill="#C9A84C" />
						<path d="M70 48 Q66 72 64 96 L64 200 Q64 212 77 212 Q90 212 90 200 L90 96 Q88 72 84 48Z" fill="#C9A84C" />
						<rect x="148" y="50" width="18" height="20" rx="2" fill="#C9A84C" />
						<path
							d="M148 70 Q143 96 140 122 L140 210 Q140 224 157 224 Q174 224 174 210 L174 122 Q171 96 166 70Z"
							fill="#C9A84C"
						/>
						<rect x="238" y="35" width="12" height="15" rx="2" fill="#C9A84C" />
						<path d="M238 50 Q235 70 233 90 L233 200 Q233 210 244 210 Q255 210 255 200 L255 90 Q253 70 250 50Z" fill="#C9A84C" />
						<rect x="318" y="45" width="16" height="18" rx="2" fill="#C9A84C" />
						<path
							d="M318 63 Q314 86 312 108 L312 210 Q312 222 326 222 Q340 222 340 210 L340 108 Q338 86 334 63Z"
							fill="#C9A84C"
						/>
						<rect x="400" y="25" width="12" height="16" rx="2" fill="#C9A84C" />
						<path d="M400 41 Q397 62 395 82 L395 205 Q395 216 406 216 Q417 216 417 205 L417 82 Q415 62 412 41Z" fill="#C9A84C" />
					</g>
					<line x1="0" y1="260" x2="500" y2="260" stroke="rgba(201,168,76,0.08)" stroke-width="0.5" />
					<line x1="0" y1="540" x2="500" y2="540" stroke="rgba(201,168,76,0.06)" stroke-width="0.5" />
					<text
						x="250"
						y="590"
						text-anchor="middle"
						font-family="Bebas Neue,sans-serif"
						font-size="11"
						fill="rgba(201,168,76,0.2)"
						letter-spacing="6">MAISON DE SPIRITUEUX</text>
					<text
						x="250"
						y="608"
						text-anchor="middle"
						font-family="Cormorant Garamond,serif"
						font-size="8"
						fill="rgba(201,168,76,0.12)"
						letter-spacing="2">EST. MCMXCVIII · JAKARTA</text>
				</svg>
			</div>
		</div>
	</section>

	<div class="marquee-bar">
		<div class="marquee-track">
			<span class="marquee-item">Since 1998</span>
			<span class="marquee-item">18 Countries</span>
			<span class="marquee-item">200+ Labels</span>
			<span class="marquee-item">25 Years of Expertise</span>
			<span class="marquee-item">40,000 Members</span>
			<span class="marquee-item">Family-Founded</span>
			<span class="marquee-item">Since 1998</span>
			<span class="marquee-item">18 Countries</span>
			<span class="marquee-item">200+ Labels</span>
			<span class="marquee-item">25 Years of Expertise</span>
			<span class="marquee-item">40,000 Members</span>
			<span class="marquee-item">Family-Founded</span>
		</div>
	</div>

	<section class="story-section">
		<div class="story-visual reveal">
			<div class="story-img-main">
				<svg width="200" height="380" viewBox="0 0 200 380" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#3A1A08" stop-opacity="0.4" />
							<stop offset="100%" stop-color="#1A0A04" stop-opacity="0.85" />
						</linearGradient>
					</defs>
					<rect x="82" y="0" width="36" height="28" rx="3" fill="rgba(201,168,76,0.55)" stroke="rgba(201,168,76,0.8)" stroke-width="0.6" />
					<line x1="82" y1="13" x2="118" y2="13" stroke="rgba(201,168,76,0.3)" stroke-width="0.5" />
					<path
						d="M82 28 Q74 68 68 108 L68 320 Q68 344 100 344 Q132 344 132 320 L132 108 Q126 68 118 28Z"
						fill="url(#liqGrad)"
						stroke="rgba(201,168,76,0.5)"
						stroke-width="0.8"
					/>
					<rect x="72" y="152" width="56" height="96" rx="1" fill="rgba(10,6,2,0.6)" stroke="rgba(201,168,76,0.28)" stroke-width="0.5" />
					<text x="100" y="178" text-anchor="middle" font-family="Bebas Neue,sans-serif" font-size="12" fill="rgba(201,168,76,0.9)" letter-spacing="3">MMS</text>
					<line x1="78" y1="185" x2="122" y2="185" stroke="rgba(201,168,76,0.2)" stroke-width="0.4" />
					<text x="100" y="204" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="8.5" fill="rgba(201,168,76,0.5)" letter-spacing="1">MAISON DE</text>
					<text x="100" y="216" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="8.5" fill="rgba(201,168,76,0.5)" letter-spacing="1">SPIRITUEUX</text>
					<text x="100" y="234" text-anchor="middle" font-family="Bebas Neue,sans-serif" font-size="16" fill="rgba(201,168,76,0.75)" letter-spacing="2">1998</text>
					<rect x="68" y="320" width="64" height="18" rx="2" fill="rgba(201,168,76,0.1)" stroke="rgba(201,168,76,0.3)" stroke-width="0.5" />
					<path d="M84 100 Q88 200 88 310" stroke="rgba(255,255,255,0.035)" stroke-width="12" stroke-linecap="round" />
					<rect x="78" y="62" width="44" height="3" rx="1" fill="none" stroke="rgba(201,168,76,0.22)" stroke-width="0.5" />
					<rect x="76" y="80" width="48" height="2" rx="1" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="0.5" />
				</svg>
			</div>
			<div class="story-img-float">
				<span class="story-img-float-num">27</span>
				<span class="story-img-float-lbl">Years of curation</span>
			</div>
		</div>
		<div class="reveal d2">
			<p class="sec-tag">Our Story</p>
			<h2 class="story-title">Born from a<br /><em>Passion</em> for the Rare</h2>
			<div class="story-body">
				<p>
					MMS was founded in Jakarta in 1998 by the Maheswara family — a group of food and beverage professionals who
					found themselves frustrated by the lack of access to the world's finest spirits in Indonesia. What began as
					personal importing quickly became a mission.
				</p>
				<p>
					In the early years, our founder Arjuna Maheswara would travel to Scotland, France, and Japan — tasting,
					negotiating, and hand-carrying bottles back to share with a small circle of enthusiasts. By 2005, MMS had
					grown into Indonesia's first dedicated premium spirits maison.
				</p>
				<p>
					Today, we partner with over 120 distilleries and négociants across 18 countries — maintaining the same
					personal relationships and rigorous selection criteria that defined our earliest trips. Every bottle we stock
					has been tasted and approved by our panel of curators. Not a single label joins our collection by reputation
					alone.
				</p>
			</div>
			<a href={historyHref} class="read-link">Read the full history →</a>
		</div>
	</section>

	<section class="values-section">
		<div class="values-header reveal">
			<p class="sec-tag sec-tag--center">What We Stand For</p>
			<h2 class="values-title">Principles We<br /><em>Never Compromise</em></h2>
			<p class="values-sub">
				Every decision we make — from which distillery to visit, to how we package your order — is guided by the same
				set of values established in 1998.
			</p>
		</div>
		<div class="values-grid">
			<div class="value-card reveal d1">
				<span class="value-num">01</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"
						><path
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/></svg
					>
				</div>
				<h3 class="value-name">Uncompromising Authenticity</h3>
				<p class="value-desc">
					Every bottle we sell is 100% authentic, sourced directly from the producer or their authorised négociants. We
					have never and will never trade in grey-market or counterfeit spirits.
				</p>
			</div>
			<div class="value-card reveal d2">
				<span class="value-num">02</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"
						><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg
					>
				</div>
				<h3 class="value-name">Curator's Rigour</h3>
				<p class="value-desc">
					Every expression in our collection is tasted blind by our panel before approval. A great score from a
					respected publication is the beginning of our consideration — never the end of it.
				</p>
			</div>
			<div class="value-card reveal d3">
				<span class="value-num">03</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"
						><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path
							d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
						/></svg
					>
				</div>
				<h3 class="value-name">Community First</h3>
				<p class="value-desc">
					We began as a community of enthusiasts and we remain one. Our tasting events, educational programmes, and
					member allocations exist because we believe the joy of exceptional spirits is best shared.
				</p>
			</div>
			<div class="value-card reveal d1">
				<span class="value-num">04</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"
						><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg
					>
				</div>
				<h3 class="value-name">Long-Term Relationships</h3>
				<p class="value-desc">
					We have worked with many of our distillery partners for over fifteen years. These relationships give us access
					to allocations that are never available to the open market — and we protect them fiercely.
				</p>
			</div>
			<div class="value-card reveal d2">
				<span class="value-num">05</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
				</div>
				<h3 class="value-name">Patience & Perspective</h3>
				<p class="value-desc">
					Great spirits require time — and so does great curation. We take a long view on everything: from the
					distilleries we select to the customers we serve. We are not a retailer; we are a maison.
				</p>
			</div>
			<div class="value-card reveal d3">
				<span class="value-num">06</span>
				<div class="value-icon">
					<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
				</div>
				<h3 class="value-name">Responsible Service</h3>
				<p class="value-desc">
					We take the responsible service of alcohol seriously. Every member of our team is trained in responsible
					sales, and we actively promote informed, moderate enjoyment of the spirits we love.
				</p>
			</div>
		</div>
	</section>

	<section class="numbers-section">
		<div class="numbers-inner">
			<div class="reveal">
				<p class="sec-tag">By the Numbers</p>
				<h2 class="story-title story-title--sm">Two Decades of<br /><em>Quiet Excellence</em></h2>
				<p class="story-body story-body--tight">Numbers tell part of our story. The relationships behind them tell the rest.</p>
			</div>
			<div class="numbers-grid">
				<div class="number-card reveal d1">
					<span class="number-val">1998</span>
					<span class="number-lbl">Year Founded</span>
					<p class="number-desc">Established in Jakarta by the Maheswara family with 12 founding labels.</p>
				</div>
				<div class="number-card reveal d2">
					<span class="number-val">200+</span>
					<span class="number-lbl">Curated Labels</span>
					<p class="number-desc">Every single one tasted and approved by our panel of three curators.</p>
				</div>
				<div class="number-card reveal d3">
					<span class="number-val">18</span>
					<span class="number-lbl">Source Countries</span>
					<p class="number-desc">From Scotland to Japan, France to the Caribbean — we go where excellence lives.</p>
				</div>
				<div class="number-card reveal d1">
					<span class="number-val">120+</span>
					<span class="number-lbl">Distillery Partners</span>
					<p class="number-desc">Direct relationships averaging 11 years — many spanning more than two decades.</p>
				</div>
				<div class="number-card reveal d2">
					<span class="number-val">40k</span>
					<span class="number-lbl">Members Worldwide</span>
					<p class="number-desc">Collectors, connoisseurs, and curious beginners — all welcome at our table.</p>
				</div>
				<div class="number-card reveal d3">
					<span class="number-val">96.2</span>
					<span class="number-lbl">Avg. MMS Score</span>
					<p class="number-desc">The average score across our active collection. We do not stock ordinary bottles.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="team-section">
		<div class="team-header">
			<div class="reveal">
				<p class="sec-tag">The People</p>
				<h2 class="story-title story-title--md">Meet Our<br /><em>Curators</em></h2>
			</div>
			<div class="reveal d2">
				<p class="story-body story-body--flush">
					Our team brings together decades of expertise across every major spirit category. They taste, they travel,
					they write — and they argue, occasionally, about whether a 94 should really be a 95.
				</p>
			</div>
		</div>
		<div class="team-grid">
			<div class="team-card reveal d1">
				<div class="team-photo" style:background="#1A0D06">
					<div class="team-photo-bg">
						<svg width="200" height="280" viewBox="0 0 200 280" fill="none" class="team-photo-svg">
							<ellipse cx="100" cy="100" rx="70" ry="70" fill="#C9A84C" opacity="0.3" />
							<ellipse cx="100" cy="230" rx="90" ry="60" fill="#C9A84C" opacity="0.2" />
						</svg>
					</div>
					<div class="team-photo-overlay"></div>
					<div class="team-initials">JW</div>
				</div>
				<div class="team-info">
					<p class="team-name">James Whitfield</p>
					<p class="team-role">Head Curator · Scotch & Irish</p>
				</div>
				<div class="team-reveal">
					<p>
						Former brand ambassador for Diageo, 18 years in the industry. James has visited over 80 distilleries and
						holds the WSET Diploma in Wines & Spirits.
					</p>
					<span class="team-reveal-role">Specialty: Sherry-cask Scotch · Islay Peat</span>
				</div>
			</div>
			<div class="team-card reveal d2">
				<div class="team-photo" style:background="#2A1828">
					<div class="team-photo-overlay"></div>
					<div class="team-initials">CD</div>
				</div>
				<div class="team-info">
					<p class="team-name">Claire Dubois</p>
					<p class="team-role">French Spirits Curator</p>
				</div>
				<div class="team-reveal">
					<p>
						Born in Cognac, trained at BNIC, lived in Gascony for six years. Claire has more tastings of Armagnac under
						her belt than most critics have of anything.
					</p>
					<span class="team-reveal-role">Specialty: Cognac XO · Armagnac · Calvados</span>
				</div>
			</div>
			<div class="team-card reveal d3">
				<div class="team-photo" style:background="#0E0E14">
					<div class="team-photo-overlay"></div>
					<div class="team-initials">HM</div>
				</div>
				<div class="team-info">
					<p class="team-name">Hana Mori</p>
					<p class="team-role">Asian Spirits Curator</p>
				</div>
				<div class="team-reveal">
					<p>
						Tokyo-born, Jakarta-based. Hana spent four years working directly with Suntory before joining MMS. Her
						Japanese whisky allocations are the envy of the region.
					</p>
					<span class="team-reveal-role">Specialty: Japanese Malt · Shochu · Baijiu</span>
				</div>
			</div>
			<div class="team-card reveal d4">
				<div class="team-photo" style:background="#1E2A1A">
					<div class="team-photo-overlay"></div>
					<div class="team-initials">LR</div>
				</div>
				<div class="team-info">
					<p class="team-name">Lucia Reyes</p>
					<p class="team-role">Agave & Rum Curator</p>
				</div>
				<div class="team-reveal">
					<p>
						Mexico City native, certified Maestra Mezcalera. Lucia travels to Oaxaca twice a year and has relationships
						with seven artisanal mezcal producers unavailable elsewhere in Asia.
					</p>
					<span class="team-reveal-role">Specialty: Single Village Mezcal · Añejo · Rum</span>
				</div>
			</div>
		</div>
		<p class="team-hint">Hover over each card to learn more</p>
	</section>

	<section class="timeline-section">
		<div class="timeline-header reveal">
			<p class="sec-tag">Our Journey</p>
			<h2 class="story-title">Milestones That<br /><em>Shaped Us</em></h2>
		</div>
		<div class="timeline-grid">
			<div class="timeline-track">
				<div class="timeline-item reveal">
					<span class="timeline-year">1998</span>
					<p class="timeline-event">MMS Founded in Jakarta</p>
					<p class="timeline-desc">
						Arjuna Maheswara imports 12 labels from Scotland and France for a small circle of enthusiasts. The waiting
						list grows faster than the inventory.
					</p>
				</div>
				<div class="timeline-item reveal d1">
					<span class="timeline-year">2002</span>
					<p class="timeline-event">First Distillery Partnership</p>
					<p class="timeline-desc">
						MMS signs its first direct sourcing agreement with Glenfarclas in Speyside — a relationship that remains
						one of our most treasured to this day.
					</p>
				</div>
				<div class="timeline-item reveal d2">
					<span class="timeline-year">2005</span>
					<p class="timeline-event">First Physical Tasting Room</p>
					<p class="timeline-desc">
						We open a members-only tasting room in Menteng, Jakarta — the first of its kind in Indonesia. Monthly
						dinners pair food with rare pours and sell out within hours.
					</p>
				</div>
				<div class="timeline-item reveal d3">
					<span class="timeline-year">2008</span>
					<p class="timeline-event">Japan Expansion</p>
					<p class="timeline-desc">
						Hana Mori joins the team after four years at Suntory. MMS becomes one of the first Indonesian importers to
						source Japanese whisky directly from the distillery.
					</p>
				</div>
			</div>
			<div class="timeline-track">
				<div class="timeline-item reveal">
					<span class="timeline-year">2012</span>
					<p class="timeline-event">100th Label in the Collection</p>
					<p class="timeline-desc">
						A landmark moment: the MMS collection reaches 100 curated labels spanning 12 countries. We celebrate with a
						members' vertical tasting of Macallan expressions from 1988 to 2010.
					</p>
				</div>
				<div class="timeline-item reveal d1">
					<span class="timeline-year">2016</span>
					<p class="timeline-event">Digital Platform Launch</p>
					<p class="timeline-desc">
						The MMS website launches, bringing our collection to collectors across Indonesia and the wider region.
						Within six months, online orders account for 40% of revenue.
					</p>
				</div>
				<div class="timeline-item reveal d2">
					<span class="timeline-year">2019</span>
					<p class="timeline-event">Agave Programme Launches</p>
					<p class="timeline-desc">
						Lucia Reyes joins and establishes our agave spirits programme — the most comprehensive in Southeast Asia, with
						access to single village mezcal producers unavailable elsewhere in the region.
					</p>
				</div>
				<div class="timeline-item reveal d3">
					<span class="timeline-year">2024</span>
					<p class="timeline-event">40,000 Members</p>
					<p class="timeline-desc">
						MMS reaches 40,000 registered members across 22 countries. The original 12 labels have grown to 200+. The
						waiting list still fills faster than the inventory.
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="philosophy-section">
		<div class="philosophy-inner">
			<div class="reveal">
				<p class="phil-tag">How We Think</p>
				<h2 class="phil-title">Curation is a<br /><em>Responsibility</em></h2>
				<p class="phil-body">
					We believe that putting your name behind a bottle is a serious act. When MMS endorses a spirit — when we list
					it, price it, and send it to your door — we are making a claim: that this bottle is worth your time, your
					money, and your trust. We take that claim seriously.
				</p>
				<p class="phil-body">
					This is why we taste everything. This is why we visit distilleries. This is why we maintain the same
					relationships for twenty years. And it is why, when a product no longer meets our standard, we delist it —
					quietly, without drama, and without exception.
				</p>
				<div class="phil-quote">
					<p>"We are not in the business of selling alcohol. We are in the business of sharing experiences that happen to come in bottles."</p>
					<p class="phil-quote-author">— Arjuna Maheswara, Founder</p>
				</div>
			</div>
			<div class="phil-pillars reveal d2">
				<div class="pillar">
					<span class="pillar-num">01</span>
					<div>
						<p class="pillar-title">Taste Everything</p>
						<p class="pillar-desc">
							No bottle joins the MMS collection without passing a blind tasting by our full panel. Reputation is a
							starting point, not a shortcut.
						</p>
					</div>
				</div>
				<div class="pillar">
					<span class="pillar-num">02</span>
					<div>
						<p class="pillar-title">Visit the Source</p>
						<p class="pillar-desc">
							Our curators collectively visit 20–30 distilleries each year. You cannot truly understand a spirit without
							understanding the place and people that made it.
						</p>
					</div>
				</div>
				<div class="pillar">
					<span class="pillar-num">03</span>
					<div>
						<p class="pillar-title">Write Honestly</p>
						<p class="pillar-desc">
							Our tasting notes are written to inform, not to sell. If a bottle has a flaw, we name it. Our members
							trust our words because our words are always true.
						</p>
					</div>
				</div>
				<div class="pillar">
					<span class="pillar-num">04</span>
					<div>
						<p class="pillar-title">Delist Without Hesitation</p>
						<p class="pillar-desc">
							When quality drops — for any reason — we remove the product. We have done it 14 times in 27 years. We will do
							it again the moment the standard demands it.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="partners-section reveal">
		<p class="partners-label">Proud Partners & Suppliers</p>
		<div class="partners-row">
			<div class="partner-item"><p class="partner-name">Glenfarclas</p></div>
			<div class="partner-item"><p class="partner-name">Laphroaig</p></div>
			<div class="partner-item"><p class="partner-name">Rémy Martin</p></div>
			<div class="partner-item"><p class="partner-name">Suntory</p></div>
			<div class="partner-item"><p class="partner-name">Nikka</p></div>
			<div class="partner-item"><p class="partner-name">Don Julio</p></div>
			<div class="partner-item"><p class="partner-name">Diplomatico</p></div>
			<div class="partner-item"><p class="partner-name">Hennessy</p></div>
		</div>
	</section>

	<section class="cta-section">
		<p class="cta-eyebrow reveal">Join the Community</p>
		<h2 class="cta-title reveal d1">Taste What We<br /><em>Believe</em> In</h2>
		<p class="cta-sub reveal d2">
			Become a member and receive first access to rare allocations, invitations to tasting events, and the collected wisdom
			of 27 years of curation — delivered to your inbox every Tuesday.
		</p>
		<div class="cta-btns reveal d3">
			<a href={collectionsHref} class="btn-primary">Explore the Collection</a>
			<a href={membershipHref} class="btn-ghost">Become a Member</a>
		</div>
	</section>
</div>

<style>
	.about-root {
		font-family: var(--font-mms-sans), sans-serif;
		background: var(--color-mms-ink);
		color: var(--color-mms-cream);
		overflow-x: hidden;
	}

	.about-hero {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
		position: relative;
		overflow: hidden;
	}

	.hero-left {
		padding: 10rem 4rem 5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 2;
	}

	.hero-right {
		position: relative;
		overflow: hidden;
		background: var(--color-mms-ink2);
	}

	.hero-right-bg {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-right::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(270deg, rgba(13, 11, 8, 0) 60%, rgba(13, 11, 8, 0.8) 100%);
	}

	.eyebrow {
		font-size: 0.65rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--color-mms-gold);
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.eyebrow::before {
		content: '';
		display: block;
		width: 40px;
		height: 1px;
		background: var(--color-mms-gold);
	}

	.hero-title {
		font-family: var(--font-mms-display), serif;
		font-size: clamp(3rem, 5.5vw, 5.5rem);
		font-weight: 300;
		line-height: 0.92;
		letter-spacing: -0.01em;
		margin-bottom: 2rem;
	}

	.hero-title em {
		font-style: italic;
		color: var(--color-mms-gold-light);
	}

	.hero-body {
		font-size: 0.88rem;
		color: var(--color-mms-muted);
		line-height: 1.9;
		font-weight: 300;
		max-width: 440px;
		margin-bottom: 2.5rem;
	}

	.hero-scroll {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-mms-muted);
	}

	.scroll-line {
		width: 40px;
		height: 1px;
		background: var(--color-mms-gold-dim);
		animation: mms-scroll-line 2s ease-in-out infinite alternate;
	}

	.marquee-bar {
		overflow: hidden;
		padding: 0.85rem 0;
		background: var(--color-mms-gold);
	}

	.marquee-track {
		display: flex;
		gap: 3rem;
		animation: mms-marquee 20s linear infinite;
		width: max-content;
	}

	.marquee-item {
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 1rem;
		letter-spacing: 0.25em;
		color: var(--color-mms-ink);
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 3rem;
	}

	.marquee-item::after {
		content: '◆';
		font-size: 0.4rem;
	}

	.story-section {
		padding: 8rem 4rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6rem;
		align-items: center;
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.story-visual {
		position: relative;
	}

	.story-img-main {
		background: var(--color-mms-ink2);
		height: 480px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.story-img-main::before {
		content: '1998';
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 9rem;
		color: rgba(201, 168, 76, 0.04);
		position: absolute;
		bottom: -1rem;
		right: -1rem;
		line-height: 1;
		letter-spacing: 0.05em;
	}

	.story-img-float {
		position: absolute;
		bottom: -2rem;
		right: -2rem;
		background: var(--color-mms-gold);
		padding: 2rem 2.5rem;
		z-index: 2;
	}

	.story-img-float-num {
		font-family: var(--font-mms-display), serif;
		font-size: 3rem;
		font-weight: 300;
		color: var(--color-mms-ink);
		line-height: 1;
		display: block;
	}

	.story-img-float-lbl {
		font-size: 0.58rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(13, 11, 8, 0.65);
	}

	.sec-tag {
		font-size: 0.62rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--color-mms-gold);
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.sec-tag--center {
		justify-content: center;
	}

	.sec-tag::before {
		content: '';
		display: block;
		width: 25px;
		height: 1px;
		background: var(--color-mms-gold);
	}

	.story-title {
		font-family: var(--font-mms-display), serif;
		font-size: clamp(2.2rem, 3.5vw, 3.2rem);
		font-weight: 300;
		line-height: 1.05;
		margin-bottom: 1.5rem;
	}

	.story-title--sm {
		font-size: clamp(2rem, 3vw, 2.8rem);
	}

	.story-title--md {
		font-size: clamp(2.2rem, 3.5vw, 3rem);
	}

	.story-title em {
		font-style: italic;
		color: var(--color-mms-gold-light);
	}

	.story-body {
		font-size: 0.84rem;
		color: var(--color-mms-muted);
		line-height: 1.95;
		font-weight: 300;
		margin-bottom: 2rem;
	}

	.story-body p {
		margin-bottom: 1rem;
	}

	.story-body p:last-child {
		margin-bottom: 0;
	}

	.story-body--tight {
		margin-bottom: 0;
		max-width: 280px;
	}

	.story-body--flush {
		margin-bottom: 0;
	}

	.read-link {
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-mms-gold);
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		transition: gap 0.2s;
	}

	.read-link:hover {
		gap: 1rem;
	}

	.values-section {
		padding: 8rem 4rem;
		background: var(--color-mms-ink2);
	}

	.values-header {
		text-align: center;
		max-width: 600px;
		margin: 0 auto 5rem;
	}

	.values-title {
		font-family: var(--font-mms-display), serif;
		font-size: clamp(2.5rem, 4vw, 3.8rem);
		font-weight: 300;
		line-height: 0.95;
		margin-bottom: 1rem;
	}

	.values-title em {
		font-style: italic;
		color: var(--color-mms-gold-light);
	}

	.values-sub {
		font-size: 0.84rem;
		color: var(--color-mms-muted);
		line-height: 1.85;
		font-weight: 300;
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5px;
	}

	.value-card {
		background: var(--color-mms-ink3);
		padding: 3rem 2.5rem;
		position: relative;
		overflow: hidden;
		transition: background 0.3s;
		cursor: default;
	}

	.value-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-mms-gold);
		transform: scaleX(0);
		transition: transform 0.4s ease;
		transform-origin: left;
	}

	.value-card:hover {
		background: #26231d;
	}

	.value-card:hover::before {
		transform: scaleX(1);
	}

	.value-num {
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 5rem;
		color: rgba(201, 168, 76, 0.06);
		line-height: 1;
		margin-bottom: -0.5rem;
		letter-spacing: 0.05em;
	}

	.value-icon {
		width: 44px;
		height: 44px;
		border: 1px solid rgba(201, 168, 76, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.value-icon svg {
		width: 20px;
		height: 20px;
		stroke: var(--color-mms-gold-dim);
		fill: none;
		stroke-width: 1.5;
	}

	.value-name {
		font-family: var(--font-mms-display), serif;
		font-size: 1.6rem;
		font-weight: 400;
		margin-bottom: 0.8rem;
		line-height: 1.1;
	}

	.value-desc {
		font-size: 0.78rem;
		color: var(--color-mms-muted);
		line-height: 1.8;
		font-weight: 300;
	}

	.numbers-section {
		padding: 7rem 4rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.numbers-inner {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: 5rem;
		align-items: center;
	}

	.numbers-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5px;
	}

	.number-card {
		background: var(--color-mms-ink2);
		padding: 2.5rem 2rem;
		border-top: 1px solid rgba(201, 168, 76, 0.12);
		transition: background 0.3s;
	}

	.number-card:hover {
		background: var(--color-mms-ink3);
	}

	.number-val {
		font-family: var(--font-mms-display), serif;
		font-size: 3.5rem;
		font-weight: 300;
		color: var(--color-mms-gold);
		line-height: 1;
		display: block;
		margin-bottom: 0.5rem;
	}

	.number-lbl {
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-mms-muted);
	}

	.number-desc {
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--color-mms-muted) 85%, transparent);
		margin-top: 0.5rem;
		line-height: 1.6;
		font-weight: 300;
	}

	.team-section {
		padding: 8rem 4rem;
		background: var(--color-mms-ink2);
	}

	.team-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: end;
		margin-bottom: 5rem;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5px;
	}

	.team-card {
		background: var(--color-mms-ink3);
		overflow: hidden;
		position: relative;
		cursor: pointer;
		transition: background 0.3s;
	}

	.team-card:hover {
		background: #26231d;
	}

	.team-card:hover .team-reveal {
		opacity: 1;
		transform: translateY(0);
	}

	.team-photo {
		height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.team-photo-bg {
		position: absolute;
		inset: 0;
	}

	.team-photo-svg {
		opacity: 0.15;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.team-photo-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(0deg, rgba(13, 11, 8, 0.8) 0%, transparent 60%);
	}

	.team-initials {
		position: relative;
		z-index: 2;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: rgba(201, 168, 76, 0.15);
		border: 1px solid rgba(201, 168, 76, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mms-display), serif;
		font-size: 1.8rem;
		color: rgba(201, 168, 76, 0.7);
	}

	.team-info {
		padding: 1.5rem;
	}

	.team-name {
		font-family: var(--font-mms-display), serif;
		font-size: 1.3rem;
		font-weight: 400;
		margin-bottom: 0.3rem;
	}

	.team-role {
		font-size: 0.62rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-mms-gold-dim);
	}

	.team-reveal {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(13, 11, 8, 0.95);
		padding: 1.5rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.35s ease;
		border-top: 1px solid rgba(201, 168, 76, 0.15);
	}

	.team-reveal p {
		font-size: 0.75rem;
		color: var(--color-mms-muted);
		line-height: 1.7;
		font-weight: 300;
		margin-bottom: 0.8rem;
	}

	.team-reveal-role {
		font-size: 0.58rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-mms-gold-dim);
	}

	.team-hint {
		font-size: 0.7rem;
		color: var(--color-mms-muted);
		text-align: center;
		margin-top: 2rem;
		letter-spacing: 0.1em;
	}

	.timeline-section {
		padding: 8rem 4rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.timeline-header {
		max-width: 500px;
		margin-bottom: 5rem;
	}

	.timeline-track {
		position: relative;
		padding-left: 3rem;
	}

	.timeline-track::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.4rem;
		bottom: 0;
		width: 1px;
		background: rgba(201, 168, 76, 0.15);
	}

	.timeline-item {
		position: relative;
		margin-bottom: 3rem;
		cursor: default;
		transition: opacity 0.2s;
	}

	.timeline-item::before {
		content: '';
		position: absolute;
		left: -3rem;
		top: 0.35rem;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--color-mms-ink2);
		border: 1.5px solid var(--color-mms-gold-dim);
		transform: translateX(-4px);
		transition:
			border-color 0.2s,
			background 0.2s;
	}

	.timeline-item:hover::before {
		background: var(--color-mms-gold);
		border-color: var(--color-mms-gold);
	}

	.timeline-year {
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 1rem;
		letter-spacing: 0.2em;
		color: var(--color-mms-gold);
		display: block;
		margin-bottom: 0.4rem;
	}

	.timeline-event {
		font-family: var(--font-mms-display), serif;
		font-size: 1.3rem;
		font-weight: 400;
		margin-bottom: 0.4rem;
		color: var(--color-mms-cream);
	}

	.timeline-desc {
		font-size: 0.78rem;
		color: var(--color-mms-muted);
		line-height: 1.75;
		font-weight: 300;
		max-width: 520px;
	}

	.timeline-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 6rem;
	}

	.philosophy-section {
		padding: 8rem 4rem;
		background: var(--color-mms-cream2);
		position: relative;
		overflow: hidden;
	}

	.philosophy-section::before {
		content: 'MMS';
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 22vw;
		color: rgba(13, 11, 8, 0.04);
		position: absolute;
		right: -1%;
		top: 50%;
		transform: translateY(-50%);
		line-height: 1;
		letter-spacing: 0.05em;
		pointer-events: none;
	}

	.philosophy-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6rem;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	.phil-tag {
		font-size: 0.62rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--color-mms-gold-dim);
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.phil-tag::before {
		content: '';
		display: block;
		width: 20px;
		height: 1px;
		background: var(--color-mms-gold-dim);
	}

	.phil-title {
		font-family: var(--font-mms-display), serif;
		font-size: clamp(2.2rem, 3.5vw, 3.2rem);
		font-weight: 300;
		line-height: 1.05;
		color: var(--color-mms-ink);
		margin-bottom: 1.5rem;
	}

	.phil-title em {
		font-style: italic;
		color: var(--color-mms-gold-dim);
	}

	.phil-body {
		font-size: 0.84rem;
		color: rgba(13, 11, 8, 0.6);
		line-height: 1.95;
		font-weight: 300;
		margin-bottom: 2rem;
	}

	.phil-quote {
		border-left: 2px solid var(--color-mms-gold-dim);
		padding: 1.2rem 1.5rem;
		background: rgba(13, 11, 8, 0.04);
	}

	.phil-quote p {
		font-family: var(--font-mms-display), serif;
		font-size: 1.15rem;
		font-weight: 300;
		color: var(--color-mms-ink);
		font-style: italic;
		line-height: 1.7;
	}

	.phil-quote-author {
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-mms-gold-dim);
		margin-top: 0.8rem;
	}

	.phil-pillars {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.pillar {
		padding: 1.8rem 0;
		border-bottom: 1px solid rgba(13, 11, 8, 0.08);
		display: grid;
		grid-template-columns: 60px 1fr;
		gap: 1rem;
		align-items: start;
	}

	.pillar:last-child {
		border-bottom: none;
	}

	.pillar-num {
		font-family: var(--font-mms-logo), sans-serif;
		font-size: 2rem;
		color: rgba(13, 11, 8, 0.12);
		line-height: 1;
	}

	.pillar-title {
		font-size: 0.78rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(13, 11, 8, 0.7);
		margin-bottom: 0.4rem;
	}

	.pillar-desc {
		font-size: 0.78rem;
		color: rgba(13, 11, 8, 0.5);
		line-height: 1.7;
		font-weight: 300;
	}

	.partners-section {
		padding: 6rem 4rem;
		border-top: 1px solid rgba(201, 168, 76, 0.08);
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.partners-label {
		font-size: 0.62rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--color-mms-muted);
		text-align: center;
		margin-bottom: 3rem;
	}

	.partners-row {
		display: flex;
		gap: 0;
		flex-wrap: wrap;
	}

	.partner-item {
		flex: 1;
		min-width: 120px;
		padding: 2rem 1.5rem;
		background: var(--color-mms-ink2);
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid rgba(201, 168, 76, 0.06);
		transition: background 0.2s;
		cursor: pointer;
	}

	.partner-item:last-child {
		border-right: none;
	}

	.partner-item:hover {
		background: var(--color-mms-ink3);
	}

	.partner-name {
		font-family: var(--font-mms-display), serif;
		font-size: 1.1rem;
		font-weight: 400;
		color: var(--color-mms-muted);
		letter-spacing: 0.05em;
		transition: color 0.2s;
	}

	.partner-item:hover .partner-name {
		color: var(--color-mms-gold-light);
	}

	.cta-section {
		padding: 8rem 4rem;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.cta-section::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 70%);
	}

	.cta-eyebrow {
		font-size: 0.62rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--color-mms-gold);
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.cta-eyebrow::before,
	.cta-eyebrow::after {
		content: '';
		display: block;
		width: 30px;
		height: 1px;
		background: var(--color-mms-gold);
	}

	.cta-title {
		font-family: var(--font-mms-display), serif;
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		font-weight: 300;
		line-height: 0.95;
		margin-bottom: 1.5rem;
	}

	.cta-title em {
		font-style: italic;
		color: var(--color-mms-gold-light);
	}

	.cta-sub {
		font-size: 0.85rem;
		color: var(--color-mms-muted);
		max-width: 420px;
		margin: 0 auto 3rem;
		line-height: 1.85;
		font-weight: 300;
	}

	.cta-btns {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: var(--color-mms-gold);
		color: var(--color-mms-ink);
		font-size: 0.7rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		padding: 1rem 2.4rem;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.25s;
		display: inline-block;
	}

	.btn-primary:hover {
		background: var(--color-mms-gold-light);
	}

	.btn-ghost {
		background: transparent;
		color: var(--color-mms-cream);
		font-size: 0.7rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		padding: 1rem 2.4rem;
		text-decoration: none;
		border: 1px solid rgba(201, 168, 76, 0.25);
		transition: all 0.25s;
		display: inline-block;
	}

	.btn-ghost:hover {
		border-color: var(--color-mms-gold);
		color: var(--color-mms-gold);
	}

	.reveal {
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 0.6s ease,
			transform 0.6s ease;
	}

	.reveal:global(.visible) {
		opacity: 1;
		transform: translateY(0);
	}

	.d1 {
		transition-delay: 0.06s;
	}
	.d2 {
		transition-delay: 0.12s;
	}
	.d3 {
		transition-delay: 0.18s;
	}
	.d4 {
		transition-delay: 0.24s;
	}
	@media (max-width: 900px) {
		.about-hero {
			grid-template-columns: 1fr;
			min-height: auto;
		}
		.hero-left {
			padding: 7rem 1.5rem 3rem;
		}
		.hero-right {
			display: none;
		}
		.story-section {
			grid-template-columns: 1fr;
			padding: 4rem 1.5rem;
			gap: 3rem;
		}
		.story-img-float {
			position: relative;
			bottom: auto;
			right: auto;
			display: inline-block;
			margin-top: 1.5rem;
		}
		.values-section {
			padding: 5rem 1.5rem;
		}
		.values-grid {
			grid-template-columns: 1fr;
		}
		.numbers-section {
			padding: 4rem 1.5rem;
		}
		.numbers-inner {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		.numbers-grid {
			grid-template-columns: 1fr 1fr;
		}
		.team-section {
			padding: 5rem 1.5rem;
		}
		.team-header {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		.team-grid {
			grid-template-columns: 1fr 1fr;
		}
		.timeline-section {
			padding: 5rem 1.5rem;
		}
		.timeline-grid {
			grid-template-columns: 1fr;
		}
		.philosophy-section {
			padding: 5rem 1.5rem;
		}
		.philosophy-inner {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
		.partners-section {
			padding: 4rem 1.5rem;
		}
		.cta-section {
			padding: 5rem 1.5rem;
		}
	}

	@media (max-width: 500px) {
		.numbers-grid {
			grid-template-columns: 1fr;
		}
		.team-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
