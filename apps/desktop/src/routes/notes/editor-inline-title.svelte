<script lang="ts">
	import { renameNote } from '@/api/notes';
	import { editor, activeFile, collectionSettings } from '@/store';

	let value = '';

	// Handle keydown for enter key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			$editor.chain().focus().run();
		}
	}

	// Rename handler on input blur
	function handleBlur() {
		if (!$activeFile) return;

		if (value !== $activeFile.split('/').pop()!.split('.').slice(0, -1).join('.')) {
			// Rename note
			renameNote($activeFile, value);
		}

		// Remove last extension
		if (value.includes('.')) {
			value = value.split('.').slice(0, -1).join('.');
		}

		// Remove invalid characters
		value = value.replace(/[/\\?%*:|"<>]/g, '');
	}

	activeFile.subscribe((notePath) => {
		// Set file name as value, remove extension
		value = notePath ? notePath.split('/').pop()!.split('.').slice(0, -1).join('.') : '';
	});
</script>

<div class="flex items-center w-full h-fit px-8 pb-1">
	{#if $collectionSettings.editor.show_inline_title}
		<input
			type="text"
			autocomplete="off"
			autocorrect="off"
			class="w-[635px] prose font-bold text-4xl text-foreground mx-auto bg-transparent focus:outline-none"
			placeholder="Search notes..."
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			bind:value
		/>
	{/if}
</div>
