<script lang="ts">
	import { onMount } from 'svelte';

	let cursorEl: HTMLDivElement;
	let ringEl: HTMLDivElement;

	onMount(() => {
		if (!window.matchMedia('(pointer: fine)').matches) return;

		const cursor = cursorEl;
		const ring = ringEl;
		const body = document.body;
		const interactiveSelector =
			'a,button,input,textarea,select,label,[role="button"],[tabindex],summary,.team-card,.value-card,.number-card,.partner-item,.timeline-item';

		let mx = 0;
		let my = 0;
		let rx = 0;
		let ry = 0;
		let raf = 0;

		const setActive = (on: boolean) => {
			cursor.style.transform = on ? 'translate(-50%,-50%) scale(2.5)' : 'translate(-50%,-50%) scale(1)';
			ring.style.opacity = on ? '0' : '1';
		};

		const onMove = (e: MouseEvent) => {
			mx = e.clientX;
			my = e.clientY;
			cursor.style.left = `${mx}px`;
			cursor.style.top = `${my}px`;
		};

		const onOver = (e: Event) => {
			const target = e.target;
			if (!(target instanceof Element)) return;
			setActive(Boolean(target.closest(interactiveSelector)));
		};

		const onLeaveDocument = () => {
			setActive(false);
		};

		const anim = () => {
			rx += (mx - rx) * 0.12;
			ry += (my - ry) * 0.12;
			ring.style.left = `${rx}px`;
			ring.style.top = `${ry}px`;
			raf = requestAnimationFrame(anim);
		};

		body.classList.add('mms-cursor-enabled');
		window.addEventListener('mousemove', onMove);
		document.addEventListener('mouseover', onOver, true);
		document.addEventListener('mouseout', onOver, true);
		document.addEventListener('mouseleave', onLeaveDocument);
		raf = requestAnimationFrame(anim);

		return () => {
			body.classList.remove('mms-cursor-enabled');
			window.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseover', onOver, true);
			document.removeEventListener('mouseout', onOver, true);
			document.removeEventListener('mouseleave', onLeaveDocument);
			cancelAnimationFrame(raf);
		};
	});
</script>

<div class="mms-cursor-dot" bind:this={cursorEl} aria-hidden="true"></div>
<div class="mms-cursor-ring" bind:this={ringEl} aria-hidden="true"></div>

<style>
	:global(body.mms-cursor-enabled),
	:global(body.mms-cursor-enabled *) {
		cursor: none !important;
	}

	.mms-cursor-dot {
		width: 10px;
		height: 10px;
		background: var(--color-mms-gold);
		border-radius: 50%;
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 9999;
		transition: transform 0.2s;
		transform: translate(-50%, -50%);
	}

	.mms-cursor-ring {
		width: 36px;
		height: 36px;
		border: 1px solid rgba(201, 168, 76, 0.5);
		border-radius: 50%;
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 9998;
		transform: translate(-50%, -50%);
		transition: opacity 0.2s;
	}
	
	@media (pointer: coarse) {
		.mms-cursor-dot,
		.mms-cursor-ring {
			display: none;
		}
	}
</style>
