<script lang="ts">
	import TaskSidebar from './sidebar.svelte';
	import Layout from '$lib/components/notes/layout.svelte';
</script>

<svelte:head>
	<title>Haptic | Tasks</title>
</svelte:head>

<Layout sidebar={TaskSidebar}>
	<slot />
</Layout>
