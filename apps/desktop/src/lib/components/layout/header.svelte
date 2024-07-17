<script lang="ts">
	import { collection } from '$lib/store';
</script>

<header
	class="absolute top-0 w-full flex justify-center items-center h-9 border-b pl-20 bg-background z-40"
	data-tauri-drag-region
>
	<p
		class="text-sm text-foreground/85 hover:text-foreground/100 transition-all cursor-default outline-none"
		contenteditable
	>
		{$collection?.split('/').pop()}
	</p>
</header>
