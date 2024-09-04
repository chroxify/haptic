<script lang="ts">
	import '@haptic/ui/app.web.css';
	import { Button } from '@haptic/ui/components/button';
</script>

<svelte:head>
	<title>Haptic - Write Notes at the speed of touch</title>
	<meta
		name="description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta
		name="keywords"
		content="Haptic, Note-taking, Markdown, Local-first, Privacy-focused, Open-source, Online Markdown Editor, Fast Note-taking, Minimalistic Design"
	/>
	<meta name="author" content="Haptic" />
	<meta name="robots" content="index, follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0F0F0F" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

	<!-- Open Graph -->
	<meta property="og:site_name" content="Haptic" />
	<meta property="og:locale" content="en" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://haptic.md/" />
	<meta property="og:title" content="Haptic - Write Notes at the speed of touch" />
	<meta
		property="og:description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta property="og:image" content="https://haptic.md/landing.png" />
	<meta property="og:image:alt" content="Haptic - Markdown Editor" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="627" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://haptic.md/" />
	<meta property="twitter:title" content="Haptic - Write Notes at the speed of touch" />
	<meta
		property="twitter:description"
		content="Haptic is a new local-first & privacy-focused home for your markdown notes. It's a minimalistic, lightweight and fast note-taking app that's designed to be distraction-free."
	/>
	<meta property="twitter:image" content="https://haptic.md/landing.png" />

	<script async src="https://cdn.seline.so/seline.js" data-token="d028e058129b859"></script>
</svelte:head>

<div
	class="flex min-h-[100dvh] w-full flex-col items-center bg-gradient-to-b from-transparent to-neutral-950 justify-between select-text px-4 selection:text-primary-foreground selection:bg-primary bg-[#FAFAF9] dark:bg-background"
>
	<!-- Header -->
	<header class="flex items-center justify-between w-full h-16 z-10 max-w-screen-2xl">
		<!-- Logo & Name -->
		<a class="flex items-center justify-center gap-2" href="/">
			<img src="/icon.svg" alt="Haptic" class="w-9 h-9 border border-border/80 rounded-lg" />
			<span class="text-xl sm:text-2xl font-medium text-foreground font-['Gambarino-Regular']"
				>Haptic</span
			>
		</a>

		<!-- CTA's -->
		<div class="flex items-center gap-2">
			<a href="/github" target="_blank" rel="noopener noreferrer">
				<Button variant="secondary" size="sm" scale="sm" class="rounded-full">Star on Github</Button
				>
			</a>
			<a href="/app" target="_blank" rel="noopener noreferrer">
				<Button size="sm" scale="sm" class="rounded-full">Open App</Button>
			</a>
		</div>
	</header>

	<!-- Main Content -->
	<main
		class="flex min-h-[calc(100dvh-8rem)] w-full flex-col items-center justify-center overflow-x-hidden gap-4 max-w-screen-2xl py-16"
	>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="flex items-start justify-between w-full h-16 z-10 max-w-screen-2xl px-7">
		<p class="text-secondary-foreground/70 text-sm sm:text-[15px]">© 2024 Haptic</p>

		<nav class="items-center gap-4 ml-4 text-sm sm:text-[15px] hidden sm:flex -ml-20">
			<a href="/download" class="text-secondary-foreground/70 hover:text-foreground transition-all"
				>Download</a
			>
			<a
				href="/sponsor"
				class="text-secondary-foreground/70 hover:text-foreground transition-all"
				rel="noopener noreferrer"
				target="_blank"
			>
				Sponsor
			</a>
			<a
				href="/tweet"
				class="text-secondary-foreground/70 hover:text-foreground transition-all"
				rel="noopener noreferrer"
				target="_blank"
			>
				Spread the word
			</a>
		</nav>

		<!-- Socials -->
		<div class="flex items-center gap-4">
			<a href="/twitter" rel="noopener noreferrer" target="_blank">
				<svg
					stroke="currentColor"
					fill="currentColor"
					stroke-width="0"
					viewBox="0 0 512 512"
					class="h-5 w-5 fill-muted-foreground hover:fill-foreground transition-all cursor-pointer"
					height="22"
					width="22"
					xmlns="http://www.w3.org/2000/svg"
					><path
						d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
					></path></svg
				>
			</a>
			<a href="/github" rel="noopener noreferrer" target="_blank">
				<svg
					viewBox="0 0 256 250"
					width="256"
					height="250"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="xMidYMid"
					class="h-5 w-5 fill-muted-foreground hover:fill-foreground transition-all cursor-pointer"
				>
					<path
						d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"
					/>
				</svg>
			</a>
		</div>
	</footer>

	<!-- Overlay -->
	<div
		class="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-neutral-950 to-95%"
	/>
</div>
