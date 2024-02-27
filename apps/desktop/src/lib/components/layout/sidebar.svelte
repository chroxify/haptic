<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { cn } from '@haptic/ui/lib/utils';
	import Icon from '$lib/components/shared/icon.svelte';
	import Tooltip from '$lib/components/shared/tooltip.svelte';
	import { loadCollection } from '@/api/collection';
	import { page } from '$app/stores';
	import SettingsModal from '../settings/settings-modal.svelte';

	let selected: 'notes' | 'daily' | 'tasks' | null = null;

	const handleSelected = (value: 'notes' | 'daily' | 'tasks' | null) => {
		if (selected === value) {
			return (selected = null);
		}

		selected = value;
	};

	// TODO: Just use $page instead in the active validation
	page.subscribe((value) => {
		if (value.url.pathname === '/notes') {
			selected = 'notes';
		}
		// console.log(value.url.pathname);
	});
</script>

<div
	class="fixed left-0 h-full flex flex-col justify-between items-center w-12 py-12 border-r z-10 bg-background"
>
	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Notes" side="right">
			<a href={'/notes'}>
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						selected === 'notes' && 'fill-foreground bg-accent'
					)}
					scale="md"
					on:click={() => (selected = 'notes')}
				>
					<Icon name="inboxFull" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Daily note" side="right">
			<a href="/daily">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						selected === 'daily' && 'fill-foreground'
					)}
					scale="md"
					on:click={() => handleSelected('daily')}
				>
					<Icon name="calendarEdit" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Tasks" side="right">
			<a href="tasks">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground',
						selected === 'tasks' && 'fill-foreground'
					)}
					scale="md"
					on:click={() => handleSelected('tasks')}
				>
					<Icon name="checkSquare" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
	</div>

	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Open collection" side="right">
			<Button
				size="icon"
				variant="ghost"
				class="h-7 w-7 fill-muted-foreground hover:fill-foreground group relative"
				scale="md"
				on:click={loadCollection}
			>
				<Icon name="folder" class="w-[18px] h-[18px] group-hover:hidden" />
				<Icon name="folderOpen" class="w-[18px] h-[18px] hidden group-hover:block" />
			</Button>
		</Tooltip>
		<Tooltip text="Settings" side="right">
			<SettingsModal />
		</Tooltip>
	</div>
</div>
