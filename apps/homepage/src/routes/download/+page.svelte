<script lang="ts">
	import PlatformButton from '$lib/components/platform-button.svelte';
	import Button from '@haptic/ui/components/button/button.svelte';
	import { Globe, Smartphone } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';

	type PlatformId = 'mac' | 'windows' | 'web' | 'mobile';

	const platforms = [
		{ id: 'mac', name: 'Mac' },
		{ id: 'windows', name: 'Windows' },
		{ id: 'web', name: 'Web App' },
		{ id: 'mobile', name: 'Mobile' }
	];

	const selected = writable<PlatformId>('mac');
	const direction = writable<'left' | 'right'>('right');

	function updateSelected(newSelected: PlatformId) {
		selected.update((current) => {
			const currentIndex = platforms.findIndex((p) => p.id === current);
			const newIndex = platforms.findIndex((p) => p.id === newSelected);
			direction.set(newIndex > currentIndex ? 'right' : 'left');
			return newSelected;
		});
	}

	function smoothTransition(node: Element, { direction: dir }: { direction: 'left' | 'right' }) {
		const duration = 300;
		const x = dir === 'left' ? -100 : 100;

		return {
			duration,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `
					opacity: ${eased};
					transform: translateX(${(1 - eased) * x}px);
				`;
			}
		};
	}

	// Detect current platform
	function detectPlatform() {
		const userAgent = navigator.userAgent;
		if (/windows phone/i.test(userAgent)) {
			updateSelected('mobile');
		} else if (/android/i.test(userAgent)) {
			updateSelected('mobile');
		} else if (/iPad|iPhone|iPod/.test(userAgent)) {
			updateSelected('mobile');
		} else if (/Mac/.test(userAgent)) {
			updateSelected('mac');
		} else if (/Win/.test(userAgent)) {
			updateSelected('windows');
		} else {
			updateSelected('web');
		}

		// Scroll to the selected platform (they all got the id = pb-{platform.name})
		setTimeout(() => {
			const platform = platforms.find((p) => p.id === $selected);
			const selectedPlatform = document.getElementById(`pb-${platform?.name}`);
			if (selectedPlatform) {
				selectedPlatform.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 100);
	}

	function downloadForMac(arch: 'aarch64' | 'x86_64') {
		if (browser) {
			const downloadUrl = `/api/download?target=darwin&arch=${arch}`;
			window.location.href = downloadUrl;
		}
	}

	onMount(() => {
		detectPlatform();
	});
</script>

<div
	class="flex h-fit min-h-0 w-full flex-col items-center justify-center gap-4 max-w-screen-2xl sm:pb-[100px] z-10"
>
	<!-- Logo -->
	<div
		class="shrink-0 mb-6 sm:mb-10 overflow-clip shadow-lg outline outline-1 outline-gray-300/40 border-[5px] md:border-8 border-white/20 sm:h-fit sm:w-fit h-[120px] w-[120px] rounded-[31px] sm:rounded-[52px]"
	>
		<img
			alt="Haptic Logo"
			loading="lazy"
			width="180"
			height="180"
			decoding="async"
			data-nimg="1"
			class="flex-none"
			src="/icon.svg"
			style="color: transparent;"
		/>
	</div>

	<!-- Title -->
	<h1
		class="text-4xl sm:text-5xl font-medium text-foreground font-['Gambarino-Regular'] text-center"
	>
		Get Haptic for Your Device
	</h1>

	<!-- Description -->
	<p class="text-secondary-foreground/70 text-base sm:text-lg text-center mb-0 sm:mb-4">
		Download Haptic for Mac, Windows & Mobile (Soon) or use the web app.
	</p>

	<!-- Selection -->
	<div
		class="no-scrollbar mb-0 sm:mb-5 flex min-w-0 w-full max-w-[610px] gap-2 sm:gap-4 overflow-x-auto"
	>
		<PlatformButton
			name={platforms[0].name}
			on:click={() => updateSelected('mac')}
			active={$selected === 'mac'}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="#F8F8F8" viewBox="0 0 24 24" class="h-6 w-6">
				<path
					d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
				/>
			</svg>
		</PlatformButton>
		<PlatformButton
			name={platforms[1].name}
			on:click={() => updateSelected('windows')}
			active={$selected === 'windows'}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F8F8F8" class="h-6 w-6">
				<path
					d="M0 3.449 9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"
				/>
			</svg>
		</PlatformButton>
		<PlatformButton
			name={platforms[2].name}
			on:click={() => updateSelected('web')}
			active={$selected === 'web'}
		>
			<Globe class="h-6 w-6 text-[#F8F8F8]" />
		</PlatformButton>
		<PlatformButton
			name={platforms[3].name}
			on:click={() => updateSelected('mobile')}
			active={$selected === 'mobile'}
		>
			<Smartphone class="h-6 w-6 text-[#F8F8F8]" />
		</PlatformButton>
	</div>

	<!-- Download Buttons -->
	<div class="relative h-full min-h-40 w-full max-w-[600px] sm:mb-40">
		{#key $selected}
			<div
				class="absolute top-0 inset-0 gap-4 flex flex-col sm:flex-row sm:items-start items-center justify-start sm:justify-center"
				in:smoothTransition={{ direction: $direction }}
				out:smoothTransition={{ direction: $direction === 'left' ? 'right' : 'left' }}
			>
				{#if $selected === 'mac'}
					<Button
						class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-[210px]"
						scale="sm"
						data-sln-event="download: mac-aarch64"
						on:click={() => downloadForMac('aarch64')}
					>
						Download for Apple Silicon
					</Button>
					<Button
						class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-[210px]"
						scale="sm"
						data-sln-event="download: mac-x86_64"
						on:click={() => downloadForMac('x86_64')}
					>
						Download for Intel Chip
					</Button>
				{:else if $selected === 'windows'}
					<div class="flex flex-col items-center gap-4">
						<Button
							class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-fit"
							scale="sm"
							disabled>Download for Windows</Button
						>
						<span class="text-sm w-full text-center text-secondary-foreground/70"
							>Support for Windows is coming soon. In the meantime, you can use the web app.</span
						>
					</div>
				{:else if $selected === 'web'}
					<a href="/app" rel="noopener noreferrer" target="_blank">
						<Button
							class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-fit"
							scale="sm"
							data-sln-event="download: web">Open Web App</Button
						>
					</a>
				{:else if $selected === 'mobile'}
					<div class="flex flex-col items-center gap-4">
						<div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
							<Button
								class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-[175px]"
								scale="sm"
								disabled>Download for iOS</Button
							>
							<Button
								class="flex items-center gap-2 rounded-[0.55rem] w-full sm:w-[175px]"
								scale="sm"
								disabled>Download for Android</Button
							>
						</div>
						<span class="text-sm w-full text-center text-secondary-foreground/70"
							>Support for native mobile apps is planned for the future, though mobile support is
							coming soon through the web app.</span
						>
					</div>
				{/if}
			</div>
		{/key}
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
