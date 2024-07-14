<script lang="ts">
	import Editor from '@/components/shared/editor/editor.svelte';
	import EditorToolbar from '$lib/components/shared/editor/toolbar.svelte';
	import EditorSearch from '$lib/components/shared/editor/search.svelte';
	import { collectionSettings } from '@/store';
	import EditorInlineTitle from '$lib/components/shared/editor/inline-title.svelte';
</script>

<div
	class="relative flex flex-col w-full h-full min-h-[calc(100vh-4.5rem)] items-start bg-secondary-background overflow-y-auto"
>
	{#if $collectionSettings.editor.show_toolbar}
		<EditorToolbar />
	{/if}
	<EditorSearch />
	<EditorInlineTitle />
	<Editor />
</div>
