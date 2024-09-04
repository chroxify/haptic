<script lang="ts">
	import migrations from '$lib/database/migrations/migrations.sql?raw';
	import seed from '$lib/database/migrations/seed.sql?raw';
	import { loadSettings } from '@/api/settings';
	import Footer from '@/components/layout/footer.svelte';
	import Header from '@/components/layout/header.svelte';
	import Sidebar from '@/components/layout/sidebar.svelte';
	import Command from '@/components/shared/command-menu/command.svelte';
	import Icon from '@/components/shared/icon.svelte';
	import { db, pgClient } from '@/database/client';
	import { collection as collectionTable } from '@/database/schema';
	import { collection } from '@/store';
	import { createDeviceDetector } from '@/utils';
	import '@haptic/ui/app.web.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';

	// Device detector
	const device = createDeviceDetector();

	// Migrate database
	async function migrateDatabase() {
		try {
			await pgClient.exec(migrations);

			// Seed database
			await pgClient.exec(seed);
		} catch (error) {
			console.log('Table already exists');
		}
	}

	// Load latest collection
	async function loadLatestCollection() {
		const collections = await db.select().from(collectionTable);

		if (!collections || collections.length === 0) return;

		// Get collection with latest lastOpened date
		const latestCollection = collections.reduce((prev, current) =>
			prev.lastOpened > current.lastOpened ? prev : current
		);

		collection.set(latestCollection.path);
	}

	onMount(async () => {
		// Migrate database
		await migrateDatabase();

		console.log(await db.select().from(collectionTable));
		// Load latest collection on mount
		await loadLatestCollection();

		// Load app & collection settings
		loadSettings(true, true);
	});
</script>

<svelte:head>
	<title>Haptic</title>
	<meta
		name="description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta
		name="keywords"
		content="Haptic, Note-taking, Markdown, Local-first, Privacy-focused, Open-source, Online Markdown Editor, Fast Note-taking, Minimalistic Design"
	/>
	<meta name="author" content="Haptic" />
	<meta name="robots" content="index, follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0F0F0F" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

	<!-- Open Graph -->
	<meta property="og:site_name" content="Haptic" />
	<meta property="og:locale" content="en" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://haptic.md/" />
	<meta property="og:title" content="Haptic - Write Notes at the speed of touch" />
	<meta
		property="og:description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta property="og:image" content="https://haptic.md/landing.png" />
	<meta property="og:image:alt" content="Haptic - Markdown Editor" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="627" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://haptic.md/" />
	<meta property="twitter:title" content="Haptic - Write Notes at the speed of touch" />
	<meta
		property="twitter:description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta property="twitter:image" content="https://haptic.md/landing.png" />

	{#if import.meta.env.PROD}
		<script
			defer
			src="https://cloud.umami.is/script.js"
			data-website-id="279d8c15-20ea-4cc9-91b0-647c90767f15"
		></script>
	{/if}
</svelte:head>

{#if $device.isDesktop}
	<Command />
	<ModeWatcher />
	<Header />
	<Sidebar />
	<main class="flex min-h-screen w-full items-center justify-center">
		<slot />
	</main>
	<Footer />
{:else}
	<main class="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-5">
		<Icon name="phoneOff" class="w-9 h-9 fill-none text-secondary-foreground" />
		<div class="flex flex-col text-center gap-2">
			<h1 class="text-secondary-foreground">Seems like you're on mobile</h1>
			<p class="text-muted-foreground text-sm leading-relaxed">
				Haptic isn't yet supported on mobile devices.<br />Please try again on a desktop.
			</p>
		</div>
	</main>
{/if}

<style>
	/* Custom scrollbar */
	:global(::-webkit-scrollbar) {
		width: 14px;
	}

	:global(::-webkit-scrollbar-thumb) {
		border: 4px solid rgba(0, 0, 0, 0);
		background-clip: padding-box;
		border-radius: 50px;
		background-color: hsl(var(--border) / 1);

		&:hover {
			background-color: hsl(var(--foreground) / 0.15);
		}
	}
</style>
