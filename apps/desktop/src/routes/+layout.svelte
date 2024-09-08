<script lang="ts">
	import { loadSettings } from '@/api/settings';
	import Footer from '@/components/layout/footer.svelte';
	import Header from '@/components/layout/header.svelte';
	import Sidebar from '@/components/layout/sidebar.svelte';
	import { platform as osPlatform } from '@tauri-apps/api/os';
	import Command from '@/components/shared/command-menu/command.svelte';
	import { appTheme, collection, platform } from '@/store';
	import { updateWindowTheme, validateHapticFolder } from '@/utils';
	import '@haptic/ui/app.desktop.css';
	import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onMount } from 'svelte';

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

		// Set platform
		platform.set((await osPlatform()) as 'darwin' | 'linux' | 'windows');
	});

	// Keep local theme synced
	appTheme.subscribe(async (value) => {
		// Update app theme
		await invoke('plugin:theme|set_theme', {
			theme: value
		});

		// Update window theme
		updateWindowTheme();
	});
</script>

<Command />

{#if $platform === 'darwin'}
	<Header />
{/if}
<Sidebar />
<main class="flex min-h-screen w-full items-center justify-center">
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
