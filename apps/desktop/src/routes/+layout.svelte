<script lang="ts">
	import Header from '@/components/layout/header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Footer from '@/components/layout/footer.svelte';
	import Sidebar from '@/components/layout/sidebar.svelte';
	import { collection } from '@/store';
	import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
	import Command from '@/components/shared/command-menu/command.svelte';
	import { loadSettings } from '@/api/settings';
	import { onMount } from 'svelte';
	import { validateHapticFolder } from '@/utils';

	// Prevent right-clicking in production
	// TODO: Test if this even works in production (not sure if tauri has access to env variables)
	if (process.env.NODE_ENV !== 'development') {
		document.addEventListener('contextmenu', (event) => event.preventDefault());
	}

	// Load latest collection
	async function loadLatestCollection() {
		const collections = await readTextFile('collections.json', {
			dir: BaseDirectory.AppData
		}).catch(() => null);

		if (!collections) return;

		// Get collection with latest lastOpened date
		const latestCollection = JSON.parse(collections).sort(
			(a: { lastOpened: string | number | Date }, b: { lastOpened: string | number | Date }) => {
				return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
			}
		)[0];

		collection.set(latestCollection.path);
	}

	onMount(async () => {
		// Load latest collection on mount
		await loadLatestCollection();

		// Validate haptic folder
		await validateHapticFolder($collection);

		// Load app & collection settings
		loadSettings(true, true);
	});
</script>

<ModeWatcher />
<Command />

<Header />
<Sidebar />
<main class="flex min-h-screen w-full items-center justify-center antialiased">
	<slot />
</main>
<Footer />

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
