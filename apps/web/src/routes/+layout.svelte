<script lang="ts">
	import migrations from '$lib/database/migrations.sql?raw';
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

			// Create default collection
			await db.insert(collectionTable).values({
				path: '/Playground',
				name: 'Playground',
				lastOpened: new Date()
			});
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
