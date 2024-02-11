<script lang="ts">
	import { cn } from '@haptic/ui/lib/utils';
	import Icon from '@/components/shared/icon.svelte';
	import { activeFile, collection, editor } from '@/store';
	import Button from '@haptic/ui/components/button/button.svelte';
	import Tooltip from '@/components/shared/tooltip.svelte';

	let mode: 'edit' | 'view' = 'edit';
</script>

<div
	class="sticky gap-2 min-h-10 top-0 px-3 z-10 flex items-center justify-between w-full bg-secondary-background"
>
	<div class="flex gap-1.5 select-none">
		<Tooltip text="Collapse" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			>
				<Icon name="sidebarArrow" class="w-4 h-4 transform rotate-180" />
			</Button>
		</Tooltip>
		<Tooltip text="Previous note" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			>
				<Icon name="arrowLeft" class="w-4 h-4" />
			</Button>
		</Tooltip>
		<Tooltip text="Next note" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			>
				<Icon name="arrowRight" class="w-4 h-4" />
			</Button>
		</Tooltip>
	</div>
	<div class="flex gap-1.5">
		<p class="text-xs flex items-center text-foreground/50 fill-foreground/50">
			{#each $activeFile?.replace($collection, '').split('/') ?? [] as folder, i}
				{#if i !== 0}
					<Button
						size="sm"
						variant="ghost"
						class={cn(
							'h-6 text-[13px] w-fit px-1.5 fill-foreground/50 hover:fill-foreground transition-all font-normal',
							i === ($activeFile?.replace($collection, '').split('/') ?? [])?.length - 1 &&
								'text-foreground font-medium'
						)}
					>
						{folder}
					</Button>
					{#if i !== ($activeFile?.replace($collection, '').split('/') ?? [])?.length - 1}
						<Icon name="chevron" class="w-3.5 h-3.5 inline-block" />
					{/if}
				{/if}
			{/each}
		</p>
	</div>
	<div class="flex gap-1.5">
		<Tooltip text={mode === 'edit' ? 'Edit mode' : 'View mode'} side="bottom">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
				on:click={() => {
					// TODO: Implement source mode in future
					// Loop through modes in order: edit -> view -> edit
					mode = mode === 'edit' ? 'view' : 'edit';

					// Set the mode
					if (mode === 'edit') {
						$editor.setEditable(true);
					} else if (mode === 'view') {
						$editor.setEditable(false);
					}
				}}
			>
				<Icon name="editPencil" class={cn('w-4 h-4', mode !== 'edit' && 'hidden')} />
				<Icon name="glasses" class={cn('w-4 h-4', mode !== 'view' && 'hidden')} />
			</Button>
		</Tooltip>
		<Tooltip text="Expand" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-foreground/50 hover:fill-foreground transition-all"
			>
				<Icon name="sidebarArrow" class="w-4 h-4 transform rotate-180" />
			</Button>
		</Tooltip>
	</div>
</div>
