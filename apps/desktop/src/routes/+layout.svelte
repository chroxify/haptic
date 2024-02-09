<script>
	import Header from '@/components/header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Footer from '@/components/footer.svelte';
	import Sidebar from '@/components/sidebar.svelte';

	// Prevent right-clicking in production
	// TODO: Test if this even works in production (not sure if tauri has access to env variables)
	if (process.env.NODE_ENV !== 'development') {
		document.addEventListener('contextmenu', (event) => event.preventDefault());
	}
</script>

<ModeWatcher />

<Header />
<Sidebar />
<main class="flex min-h-screen w-full items-center justify-center">
	<slot />
</main>
<Footer />
