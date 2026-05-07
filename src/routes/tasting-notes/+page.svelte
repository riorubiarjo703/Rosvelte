<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick, untrack } from 'svelte';
	import { mmsReveal } from '$lib/mms-tailwind';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsSiteNewsletter from '$lib/components/site/MmsSiteNewsletter.svelte';
	import MmsTastingRadar from '$lib/components/tasting/MmsTastingRadar.svelte';
	import MmsTastingBottle from '$lib/components/tasting/MmsTastingBottle.svelte';
	import MmsTastingSpiritCard from '$lib/components/tasting/MmsTastingSpiritCard.svelte';
	import {
		mmsTastingSpirits,
		MMS_TASTING_FILTER_TABS,
		MMS_TASTING_RADAR_DEMO,
		formatMmsIdrPrice,
		type MmsTastingNotesFilter,
		type MmsTastingSpirit
	} from '$lib/data/mms-tasting-notes';

	let filterCat = $state<MmsTastingNotesFilter>('all');
	let sortKey = $state<'score' | 'price-asc' | 'price-desc' | 'age' | 'name'>('score');
	let compareIds = $state<number[]>([]);
	let modalSpirit = $state<MmsTastingSpirit | null>(null);
	let compareHint = $state('');

	let io = $state<IntersectionObserver | undefined>(undefined);

	const filteredSorted = $derived.by(() => {
		let list = mmsTastingSpirits.filter((s) => filterCat === 'all' || s.cat === filterCat);
		list = [...list];
		if (sortKey === 'score') list.sort((a, b) => b.overall - a.overall);
		else if (sortKey === 'price-asc') list.sort((a, b) => a.price - b.price);
		else if (sortKey === 'price-desc') list.sort((a, b) => b.price - a.price);
		else if (sortKey === 'age') list.sort((a, b) => (b.age || 0) - (a.age || 0));
		else list.sort((a, b) => a.name.localeCompare(b.name));
		return list;
	});

	function shortName(name: string) {
		return name.split(' ').slice(0, 2).join(' ');
	}

	function toggleCompare(e: MouseEvent, id: number) {
		e.stopPropagation();
		if (compareIds.includes(id)) {
			compareIds = compareIds.filter((x) => x !== id);
		} else if (compareIds.length < 3) {
			compareIds = [...compareIds, id];
		}
	}

	function openModal(s: MmsTastingSpirit) {
		modalSpirit = s;
	}

	function closeModal() {
		modalSpirit = null;
	}

	function clearCompare() {
		compareIds = [];
		compareHint = '';
	}

	function runCompare() {
		if (compareIds.length < 2) return;
		const names = compareIds
			.map((id) => mmsTastingSpirits.find((s) => s.id === id))
			.filter(Boolean)
			.map((s) => shortName(s!.name))
			.join(' vs ');
		compareHint = `Compare view coming soon. Selected: ${names}.`;
	}

	function revealDelay(i: number) {
		const d = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-[350ms]'];
		return `${mmsReveal} ${d[i % d.length]}`;
	}

	onMount(() => {
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					(e.target as HTMLElement).classList.add('visible');
					io?.unobserve(e.target);
				}
			},
			{ threshold: 0.07 }
		);

		const t = window.setTimeout(() => {
			document
				.querySelectorAll(
					'.tasting-notes-page .page-hero .reveal, .tasting-notes-page .wheel-section .reveal, .tasting-notes-page .spirits-header.reveal'
				)
				.forEach((el) => el.classList.add('visible'));
		}, 100);

		tick().then(() => {
			document.querySelectorAll('.tasting-notes-page .mms-site-newsletter .reveal').forEach((el) => {
				io?.observe(el);
			});
		});

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeModal();
		};
		window.addEventListener('keydown', onKey);

		return () => {
			window.clearTimeout(t);
			window.removeEventListener('keydown', onKey);
			io?.disconnect();
		};
	});

	$effect(() => {
		if (!browser) return;
		if (modalSpirit) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = prev;
			};
		}
	});

	$effect(() => {
		if (!browser) return;
		void filteredSorted;
		const observer = io;
		if (!observer) return;

		tick().then(() => {
			untrack(() => {
				document.querySelectorAll('.tasting-notes-page .spirit-card.reveal').forEach((el) => {
					el.classList.remove('visible');
					observer.observe(el);
				});
			});
		});
	});
</script>

<svelte:head>
	<title>Tasting notes — MMS</title>
	<meta
		name="description"
		content="Curator tasting notes and five-axis scores for spirits in the MMS collection."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="tasting-notes-page min-h-dvh overflow-x-hidden bg-mms-ink pb-24 font-mms-sans text-mms-cream antialiased"
	class:pb-44={compareIds.length > 0}
>
	<MmsSiteHeader />

	<section
		class="page-hero relative overflow-hidden border-b border-mms-gold/10 px-6 pb-12 pt-28 md:px-16 md:pb-20 md:pt-36"
	>
		<p
			class="pointer-events-none absolute -right-[1%] bottom-[-10%] whitespace-nowrap font-mms-logo text-[20vw] leading-none tracking-[0.05em] text-mms-gold/[0.025]"
			aria-hidden="true"
		>
			TASTE
		</p>
		<div class="relative z-[1] grid items-end gap-8 md:grid-cols-2 md:gap-16">
			<div class={mmsReveal}>
				<p
					class="mb-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold"
				>
					MMS Curator Reviews
				</p>
				<h1 class="font-mms-display text-[clamp(3rem,5vw,5rem)] font-light leading-[0.95] tracking-tight text-mms-cream">
					Every Sip<br />Tells a <em class="italic text-mms-gold-light">Story</em>
				</h1>
			</div>
			<div class={`${mmsReveal} delay-100`}>
				<p class="mb-10 text-[0.85rem] font-light leading-[1.9] text-mms-muted">
					Our master curators evaluate every expression in the MMS collection across five dimensions — nose,
					palate, finish, balance, and complexity — so you can find the spirit that speaks to you.
				</p>
				<div class="flex flex-wrap gap-2">
					{#each MMS_TASTING_FILTER_TABS as tab}
						<button
							type="button"
							class="border px-4 py-2 font-mms-sans text-[0.62rem] uppercase tracking-[0.18em] transition hover:border-mms-gold hover:text-mms-gold {filterCat === tab.filter
								? 'border-mms-gold text-mms-gold'
								: 'border-mms-gold/20 bg-transparent text-mms-muted'}"
							onclick={() => (filterCat = tab.filter)}
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section
		class="wheel-section grid items-center gap-8 border-b border-mms-gold/[0.08] px-6 py-12 md:grid-cols-2 md:gap-16 md:px-16 md:py-16"
	>
		<div class={mmsReveal}>
			<p
				class="mb-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold"
			>
				The MMS Flavour Map
			</p>
			<h2 class="mb-4 font-mms-display text-[clamp(2rem,3.5vw,3rem)] font-light leading-tight text-mms-cream">
				How We <em class="italic text-mms-gold-light">Read</em><br />a Spirit
			</h2>
			<p class="mb-8 text-[0.82rem] font-light leading-[1.85] text-mms-muted">
				Our five-axis scoring system was developed over two decades of tasting across 40+ countries. Each score
				reflects an objective assessment by our panel of three independent curators — averaged and weighted by
				category.
			</p>
			<div class="flex flex-col gap-3">
				<div class="flex items-center gap-3 text-[0.72rem] text-mms-muted">
					<span class="size-2.5 shrink-0 rounded-full bg-mms-gold"></span> Nose — aroma complexity and clarity
				</div>
				<div class="flex items-center gap-3 text-[0.72rem] text-mms-muted">
					<span class="size-2.5 shrink-0 rounded-full bg-[#8ABAEF]"></span> Palate — texture, flavour depth and
					development
				</div>
				<div class="flex items-center gap-3 text-[0.72rem] text-mms-muted">
					<span class="size-2.5 shrink-0 rounded-full bg-[#9FE1CB]"></span> Finish — length, warmth and aftertaste
					quality
				</div>
				<div class="flex items-center gap-3 text-[0.72rem] text-mms-muted">
					<span class="size-2.5 shrink-0 rounded-full bg-[#F5C4B3]"></span> Balance — harmony of all components
				</div>
				<div class="flex items-center gap-3 text-[0.72rem] text-mms-muted">
					<span class="size-2.5 shrink-0 rounded-full bg-[#CECBF6]"></span> Complexity — layers, evolution and
					surprise
				</div>
			</div>
		</div>
		<div class={`flex items-center justify-center ${mmsReveal} delay-100`}>
			<MmsTastingRadar scores={MMS_TASTING_RADAR_DEMO} box={340} />
		</div>
	</section>

	<section class="spirits-section px-6 py-12 md:px-16 md:py-16">
		<div
			class={`spirits-header mb-10 flex flex-wrap items-center justify-between gap-4 ${mmsReveal}`}
		>
			<p
				class="flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold"
			>
				Curator Tasting Notes
			</p>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-muted">Sort by</span>
				<label class="sr-only" for="tasting-sort">Sort tasting notes</label>
				<select
					id="tasting-sort"
					bind:value={sortKey}
					class="cursor-pointer appearance-none border border-mms-gold/20 bg-transparent py-2.5 pl-3 pr-8 font-mms-sans text-[0.65rem] uppercase tracking-[0.12em] text-mms-cream"
					style:background-image={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238B6E2F'/%3E%3C/svg%3E")`}
					style:background-repeat="no-repeat"
					style:background-position="right 0.6rem center"
				>
					<option value="score" class="bg-mms-ink2 text-mms-cream">Highest Score</option>
					<option value="price-asc" class="bg-mms-ink2 text-mms-cream">Price: Low → High</option>
					<option value="price-desc" class="bg-mms-ink2 text-mms-cream">Price: High → Low</option>
					<option value="age" class="bg-mms-ink2 text-mms-cream">Oldest First</option>
					<option value="name" class="bg-mms-ink2 text-mms-cream">Alphabetical</option>
				</select>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-px bg-mms-gold/15 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredSorted as s, i (s.id)}
				<MmsTastingSpiritCard
					spirit={s}
					inCompare={compareIds.includes(s.id)}
					revealClass="reveal {revealDelay(i)}"
					onopencard={() => openModal(s)}
					oncompareclick={(e) => toggleCompare(e, s.id)}
					onnotesclick={(e) => {
						e.stopPropagation();
						openModal(s);
					}}
				/>
			{/each}
		</div>
	</section>

	<MmsSiteNewsletter />

	<div
		class="pointer-events-none fixed inset-x-0 bottom-0 z-[150] border-t border-mms-gold/20 bg-mms-ink3 px-6 py-4 transition-transform duration-300 md:px-16 {compareIds.length > 0
			? 'translate-y-0'
			: 'translate-y-full'}"
		class:pointer-events-auto={compareIds.length > 0}
		aria-hidden={compareIds.length === 0}
	>
		<div class="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
			<div class="flex flex-wrap items-center gap-4 sm:gap-6">
				<span class="text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold">Comparing</span>
				<div class="flex flex-wrap gap-2">
					{#each compareIds as id}
						{@const s = mmsTastingSpirits.find((x) => x.id === id)}
						{#if s}
							<span class="border border-mms-gold/15 px-3 py-1.5 text-[0.72rem] text-mms-muted">{shortName(
								s.name
							)}</span>
						{/if}
					{/each}
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="bg-mms-gold px-5 py-2.5 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-mms-ink transition hover:bg-mms-gold-light"
					onclick={runCompare}>Compare now</button>
				<button
					type="button"
					class="border border-mms-gold/20 bg-transparent px-5 py-2.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.18em] text-mms-muted transition hover:border-mms-gold hover:text-mms-gold"
					onclick={clearCompare}>Clear</button>
			</div>
		</div>
		{#if compareHint}
			<p class="mx-auto mt-3 max-w-6xl text-center text-[0.75rem] text-mms-muted">{compareHint}</p>
		{/if}
	</div>

	{#if modalSpirit}
		{@const s = modalSpirit}
		<div
			class="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-mms-ink/92 px-4 pb-8 pt-24 md:px-8 md:pt-28"
			role="presentation"
			onclick={(e) => {
				if (e.target === e.currentTarget) closeModal();
			}}
		>
			<div
				class="relative w-full max-w-[860px] animate-[slideUp_0.35s_ease] bg-mms-ink2"
				role="dialog"
				aria-modal="true"
				aria-labelledby="tasting-modal-title"
			>
				<button
					type="button"
					class="absolute right-4 top-4 z-10 flex size-9 items-center justify-center border border-mms-gold/20 text-mms-muted transition hover:border-mms-gold hover:text-mms-gold md:right-6 md:top-6"
					onclick={closeModal}
					aria-label="Close"
				>✕</button>
				<div class="grid bg-mms-ink3 md:grid-cols-[220px_1fr]">
					<div
						class="relative flex min-h-[200px] items-center justify-center overflow-hidden p-8 md:min-h-0"
						style:background-color={s.color}
					>
						<MmsTastingBottle color={s.color} height={180} />
					</div>
					<div class="flex flex-col justify-center p-6 pl-4 md:p-10 md:pl-6">
						<p
							class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-[18px] before:bg-mms-gold"
						>
							{s.origin} · {s.style}
						</p>
						<h2 id="tasting-modal-title" class="font-mms-display text-4xl font-light leading-none text-mms-cream md:text-[2.2rem]">
							{s.name}
						</h2>
						<p class="mb-6 mt-2 text-[0.8rem] text-mms-muted">
							{s.region}{s.age ? ` · ${s.age} year old` : ' · NAS'} · {s.abv}% ABV
						</p>
						<div class="flex flex-wrap items-center gap-6">
							<div>
								<div class="font-mms-display text-5xl font-light leading-none text-mms-gold md:text-[3.5rem]">
									{s.overall}
								</div>
								<div class="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-mms-muted">MMS Score</div>
							</div>
							<MmsTastingRadar scores={s.scores} box={120} showLabels={false} />
						</div>
						<div class="mt-6 flex flex-wrap gap-6 border-t border-mms-gold/[0.08] pt-5">
							{#each ['nose', 'palate', 'finish', 'balance', 'complexity'] as k}
								<div>
									<span class="font-mms-display block text-xl text-mms-cream">{s.scores[k as keyof typeof s.scores]}</span>
									<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">{k}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<div class="p-6 md:p-10">
					<div class="grid gap-10 md:grid-cols-2 md:gap-10">
						<div>
							{#each ['nose', 'palate', 'finish'] as part}
								<div class="mb-8">
									<p
										class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10"
									>
										{part}
									</p>
									<p class="font-mms-display text-[1.05rem] font-light italic leading-relaxed text-mms-cream">
										{part === 'nose' ? s.nose : part === 'palate' ? s.palate : s.finish}
									</p>
								</div>
							{/each}
						</div>
						<div>
							<div class="mb-8">
								<p
									class="mb-3 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10"
								>
									Flavour profile
								</p>
								{#each s.flavours as f}
									<div class="mb-3 grid grid-cols-[90px_1fr_28px] items-center gap-2.5">
										<span class="text-[0.65rem] uppercase tracking-wide text-mms-muted">{f.l}</span>
										<div class="relative h-[3px] rounded-sm bg-mms-gold/[0.08]">
											<div class="absolute left-0 top-0 h-full rounded-sm bg-mms-gold" style:width="{f.v}%"></div>
										</div>
										<span class="text-right text-[0.7rem] text-mms-muted">{f.v}</span>
									</div>
								{/each}
							</div>
							<div class="mb-8">
								<p
									class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10"
								>
									Character tags
								</p>
								<div class="flex flex-wrap gap-2">
									{#each s.tags as t}
										<span
											class="border border-mms-gold/18 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-mms-muted">{t}</span>
									{/each}
								</div>
							</div>
							<div>
								<p
									class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10"
								>
									Curator's verdict
								</p>
								<div class="mt-2 border-l-2 border-mms-gold-dim bg-mms-ink3 p-6">
									<p class="font-mms-display text-[1.05rem] font-light italic leading-relaxed text-mms-cream">
										{s.verdict}
									</p>
									<p class="mt-3 text-[0.65rem] tracking-wide text-mms-gold-dim">— {s.author}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					class="flex flex-wrap items-center justify-between gap-4 border-t border-mms-gold/[0.08] px-6 py-5 md:px-10"
				>
					<div class="font-mms-display text-3xl font-light text-mms-gold">{formatMmsIdrPrice(s.price)}</div>
					<div class="flex flex-wrap gap-3">
						<button
							type="button"
							class="bg-mms-gold px-7 py-3 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light"
						>Add to cart</button>
						<button
							type="button"
							class="border border-mms-gold/25 bg-transparent px-6 py-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold transition hover:border-mms-gold"
						>Wishlist</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<MmsSiteFooter />
</div>

<style>
	@keyframes slideUp {
		from {
			transform: translateY(30px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
