<script lang="ts">
	import EditorInlineTitle from '$lib/components/shared/editor/inline-title.svelte';
	import EditorSearch from '$lib/components/shared/editor/search.svelte';
	import EditorToolbar from '$lib/components/shared/editor/toolbar.svelte';
	import Editor from '@/components/shared/editor/editor.svelte';
	import { collectionSettings } from '@/store';
</script>

<div
	class="relative flex flex-col w-full h-full min-h-[calc(100vh-4.5rem)] items-start bg-secondary-background overflow-y-auto scroll-p-20"
>
	{#if $collectionSettings.editor.show_toolbar}
		<EditorToolbar />
	{/if}
	<EditorSearch />
	<EditorInlineTitle />
	<Editor />
</div>
