<script>
	import Header from '@/components/header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import Footer from '@/components/footer.svelte';
	import Sidebar from '@/components/sidebar.svelte';
</script>

<ModeWatcher />

<Header />
<Sidebar />
<main class="flex min-h-screen w-full items-center justify-center">
	<slot />
</main>
<Footer />
