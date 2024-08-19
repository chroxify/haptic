<script lang="ts">
	import { tooltipsOpen, currentOpenTooltip } from '$lib/store';
	import * as Tooltip from '@haptic/ui/components/tooltip';
	import { Monitor, Smartphone, Tablet, Zap } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let type: 'github' | 'privacy' | 'rust' | 'lightweight' | 'shortcuts' = 'github';
	let githubData: { stars: number; issues: number; forks: number } = {
		stars: 0,
		issues: 0,
		forks: 0
	};

	let isTouchDevice: boolean;
	let isOpen = false;
	let tooltipId =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	onMount(() => {
		// Fetch GitHub stars
		fetch('https://api.github.com/repos/chroxify/haptic')
			.then((response) => response.json())
			.then((data) => {
				githubData = {
					stars: data.stargazers_count,
					issues: data.open_issues,
					forks: data.forks_count
				};
			});

		// Check if the device is mobile
		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	});

	function handleInteraction(event: Event) {
		if (isTouchDevice) {
			event.preventDefault();
			currentOpenTooltip.update((current) => {
				if (current === tooltipId) {
					return null;
				} else {
					return tooltipId;
				}
			});
		}
	}

	$: isOpen = $currentOpenTooltip === tooltipId;
</script>

<Tooltip.Root
	openDelay={300}
	closeDelay={50}
	open={isTouchDevice ? isOpen : undefined}
	onOpenChange={(open) => {
		if (open) {
			tooltipsOpen.update((value) => value + 1);
			if (isTouchDevice) {
				currentOpenTooltip.set(tooltipId);
			}
		} else {
			setTimeout(() => {
				tooltipsOpen.update((value) => value - 1);
			}, 500);
			if (isTouchDevice) {
				currentOpenTooltip.set(null);
			}
		}
	}}
>
	<Tooltip.Trigger on:pointerdown={handleInteraction}><slot /></Tooltip.Trigger>
	<Tooltip.Content
		{...$$props}
		sideOffset={0}
		class="text-sm h-7"
		transitionConfig={{ duration: $tooltipsOpen > 1 ? 125 : 175 }}
	>
		{#if type === 'github'}
			<svg
				viewBox="0 0 256 250"
				width="256"
				height="250"
				fill="#fff"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid"
				class="h-[15px] w-[15px]"
			>
				<path
					d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"
				/>
			</svg>
			<!-- If all undefined due to ratelimit -->
			{#if githubData.stars === undefined && githubData.issues === undefined && githubData.forks === undefined}
				Transparent, community-driven and self-hostable
			{:else}
				{githubData.stars} Stars, {githubData.issues} Issues, {githubData.forks} Forks
			{/if}
		{:else if type === 'privacy'}
			Your <span class="glitch">data</span> never leaves your <Smartphone
				class="h-4 w-4 block -ml-0.5 sm:hidden"
			/><span class="-ml-1 sm:hidden">phone</span>
			<Tablet class="h-4 w-4 block -ml-0.5 hidden sm:inline xl:hidden" /><span
				class="-ml-0.5 hidden sm:inline xl:hidden">tablet</span
			>
			<Monitor class="h-4 w-4 block hidden xl:inline" /><span class="hidden xl:inline"
				>computer</span
			>
		{:else if type === 'rust'}
			<span class="hidden sm:inline">Instant responses. </span>Optimized for speed and performance
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 1200 800"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				xml:space="preserve"
				class="w-5 h-5"
				style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"
			>
				<g id="Layer-1">
					<g transform="matrix(1,0,0,1,654.172,668.359)">
						<path
							d="M0,-322.648C-114.597,-322.648 -218.172,-308.869 -296.172,-286.419L-296.172,-291.49C-374.172,-266.395 -423.853,-231.531 -423.853,-192.984C-423.853,-186.907 -422.508,-180.922 -420.15,-175.053L-428.134,-160.732C-428.134,-160.732 -434.547,-152.373 -423.199,-134.733C-413.189,-119.179 -363.035,-58.295 -336.571,-26.413C-325.204,-10.065 -317.488,0 -316.814,-0.973C-315.753,-2.516 -323.878,-33.202 -346.453,-68.215C-356.986,-87.02 -369.811,-111.934 -377.361,-130.335C-356.28,-116.993 -328.172,-104.89 -296.172,-94.474L-296.172,-94.633C-218.172,-72.18 -114.597,-58.404 0,-58.404C131.156,-58.404 248.828,-76.45 327.828,-104.895L327.828,-276.153C248.828,-304.6 131.156,-322.648 0,-322.648"
							style="fill:rgb(165,43,0);fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,1099.87,554.94)">
						<path
							d="M0,-50.399L-13.433,-78.227C-13.362,-79.283 -13.309,-80.341 -13.309,-81.402C-13.309,-112.95 -46.114,-142.022 -101.306,-165.303L-101.306,2.499C-75.555,-8.365 -54.661,-20.485 -39.72,-33.538C-44.118,-15.855 -59.157,19.917 -71.148,45.073C-90.855,81.054 -97.993,112.376 -97.077,113.926C-96.493,114.904 -89.77,104.533 -79.855,87.726C-56.783,54.85 -13.063,-7.914 -4.325,-23.901C5.574,-42.024 0,-50.399 0,-50.399"
							style="fill:rgb(165,43,0);fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,1177.87,277.21)">
						<path
							d="M0,227.175L-88.296,162.132C-89.126,159.237 -89.956,156.345 -90.812,153.474L-61.81,111.458C-58.849,107.184 -58.252,101.629 -60.175,96.755C-62.1,91.905 -66.311,88.428 -71.292,87.576L-120.335,79.255C-122.233,75.376 -124.225,71.557 -126.224,67.771L-105.62,20.599C-103.501,15.793 -103.947,10.209 -106.759,5.848C-109.556,1.465 -114.31,-1.094 -119.376,-0.895L-169.146,0.914C-171.723,-2.442 -174.34,-5.766 -177.012,-9.032L-165.574,-59.592C-164.415,-64.724 -165.876,-70.1 -169.453,-73.83C-173.008,-77.546 -178.175,-79.084 -183.089,-77.88L-231.567,-65.961C-234.707,-68.736 -237.897,-71.474 -241.126,-74.157L-239.381,-126.064C-239.193,-131.318 -241.643,-136.311 -245.849,-139.227C-250.053,-142.161 -255.389,-142.603 -259.987,-140.423L-305.213,-118.921C-308.853,-121.011 -312.515,-123.081 -316.218,-125.084L-324.209,-176.232C-325.021,-181.413 -328.355,-185.816 -333.024,-187.826C-337.679,-189.848 -343.014,-189.193 -347.101,-186.116L-387.422,-155.863C-391.392,-157.181 -395.38,-158.446 -399.418,-159.655L-416.798,-208.159C-418.564,-213.104 -422.64,-216.735 -427.608,-217.756C-432.561,-218.768 -437.656,-217.053 -441.091,-213.217L-475.029,-175.246C-479.133,-175.717 -483.239,-176.147 -487.356,-176.505L-513.564,-220.659C-516.22,-225.131 -520.908,-227.852 -525.961,-227.852C-531.002,-227.852 -535.7,-225.131 -538.333,-220.659L-564.547,-176.505C-568.666,-176.147 -572.791,-175.717 -576.888,-175.246L-610.831,-213.217C-614.268,-217.053 -619.382,-218.768 -624.318,-217.756C-629.284,-216.721 -633.363,-213.104 -635.124,-208.159L-652.517,-159.655C-656.544,-158.446 -660.534,-157.173 -664.514,-155.863L-704.822,-186.116C-708.92,-189.204 -714.254,-189.857 -718.92,-187.826C-723.57,-185.816 -726.917,-181.413 -727.723,-176.232L-735.72,-125.084C-739.42,-123.081 -743.083,-121.022 -746.734,-118.921L-791.956,-140.423C-796.548,-142.612 -801.908,-142.161 -806.091,-139.227C-810.292,-136.311 -812.747,-131.318 -812.557,-126.064L-810.821,-74.157C-814.04,-71.474 -817.224,-68.736 -820.379,-65.961L-868.849,-77.88C-873.774,-79.075 -878.935,-77.546 -882.499,-73.83C-886.084,-70.1 -887.538,-64.724 -886.384,-59.592L-874.969,-9.032C-877.618,-5.753 -880.239,-2.442 -882.808,0.914L-932.579,-0.895C-937.602,-1.043 -942.396,1.465 -945.202,5.848C-948.014,10.209 -948.439,15.793 -946.348,20.599L-925.729,67.771C-927.732,71.557 -929.721,75.376 -931.635,79.255L-980.675,87.576C-985.657,88.417 -989.858,91.892 -991.795,96.755C-993.72,101.629 -993.095,107.184 -990.156,111.458L-961.146,153.474C-961.37,154.215 -961.576,154.964 -961.799,155.707L-1043.82,242.829C-1043.82,242.829 -1056.38,252.68 -1038.09,275.831C-1021.95,296.252 -939.097,377.207 -895.338,419.62C-876.855,441.152 -864.195,454.486 -862.872,453.332C-860.784,451.5 -871.743,412.326 -908.147,366.362C-936.207,325.123 -972.625,261.696 -964.086,254.385C-964.086,254.385 -954.372,242.054 -934.882,233.178C-934.169,233.749 -935.619,232.613 -934.882,233.178C-934.882,233.178 -523.568,422.914 -142.036,236.388C-98.452,228.571 -72.068,251.917 -72.068,251.917C-62.969,257.193 -86.531,322.412 -105.906,365.583C-132.259,414.606 -136.123,452.859 -133.888,454.185C-132.479,455.027 -122.89,440.438 -109.214,417.219C-75.469,370.196 -11.675,280.554 0,258.781C13.239,234.094 0,227.175 0,227.175"
							style="fill:rgb(247,76,0);fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,795.856,464.937)">
						<path
							d="M0,159.631C1.575,158.289 2.4,157.492 2.4,157.492L-132.25,144.985C-22.348,0 65.618,116.967 74.988,129.879L74.988,159.631L0,159.631Z"
							style="fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,278.418,211.791)">
						<path
							d="M0,253.04C0,253.04 -111.096,209.79 -129.876,163.242C-129.876,163.242 0.515,59.525 -155.497,-50.644L-159.726,89.773C-159.726,89.773 -205.952,45.179 -203.912,-32.91C-203.912,-32.91 -347.685,36.268 -179.436,158.667C-179.436,158.667 -173.76,224.365 -22.459,303.684L0,253.04Z"
							style="fill:rgb(247,76,0);fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,729.948,492.523)">
						<path
							d="M0,-87.016C0,-87.016 41.104,-132.025 82.21,-87.016C82.21,-87.016 114.507,-27.003 82.21,3C82.21,3 29.36,45.009 0,3C0,3 -35.232,-30.006 0,-87.016"
							style="fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,777.536,422.196)">
						<path
							d="M0,0.008C0,17.531 -10.329,31.738 -23.07,31.738C-35.809,31.738 -46.139,17.531 -46.139,0.008C-46.139,-17.521 -35.809,-31.73 -23.07,-31.73C-10.329,-31.73 0,-17.521 0,0.008"
							style="fill:white;fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,546.49,486.263)">
						<path
							d="M0,-93.046C0,-93.046 70.508,-124.265 89.753,-54.583C89.753,-54.583 109.912,26.635 31.851,31.219C31.851,31.219 -67.69,12.047 0,-93.046"
							style="fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,581.903,423.351)">
						<path
							d="M0,0.002C0,18.074 -10.653,32.731 -23.794,32.731C-36.931,32.731 -47.586,18.074 -47.586,0.002C-47.586,-18.076 -36.931,-32.729 -23.794,-32.729C-10.653,-32.729 0,-18.076 0,0.002"
							style="fill:white;fill-rule:nonzero;"
						/>
					</g>
					<g transform="matrix(1,0,0,1,1002.23,778.679)">
						<path
							d="M0,-296.808C0,-296.808 -14.723,-238.165 -106.292,-176.541L-131.97,-170.523C-131.97,-170.523 -215.036,-322.004 -332.719,-151.302C-332.719,-151.302 -296.042,-172.656 -197.719,-146.652C-197.719,-146.652 -242.949,-77.426 -334.061,-79.553C-334.061,-79.553 -246.748,25.196 -113.881,-126.107C-113.881,-126.107 26.574,-180.422 37.964,-296.808L0,-296.808Z"
							style="fill:rgb(247,76,0);fill-rule:nonzero;"
						/>
					</g>
				</g>
			</svg>
		{:else if type === 'lightweight'}
			<Zap class="h-3.5 w-3.5 fill-foreground" /> below 15mb, no bloat.
		{:else if type === 'shortcuts'}
			Never leave your keyboard
			<span
				class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest -mr-2 select-none items-center gap-1 rounded bg-muted px-1 font-mono font-medium text-foreground/70 opacity-100"
			>
				⌘K
			</span>
		{/if}
	</Tooltip.Content>
</Tooltip.Root>

<style>
	.glitch {
		color: hsl(var(--foreground));
		position: relative;
		z-index: 10;
	}

	.glitch::before {
		left: 3px;
		text-shadow: -2px 0 red;
		animation-name: glitch-animation-1;
		animation-duration: 3s;
		animation-timing-function: linear;
		animation-delay: 0s;
		animation-iteration-count: infinite;
		animation-direction: reverse-alternate;
	}

	.glitch::after {
		left: -3px;
		text-shadow: -2px 0 blue;
		animation-name: glitch-animation-2;
		animation-duration: 3s;
		animation-timing-function: linear;
		animation-delay: 0s;
		animation-iteration-count: infinite;
		animation-direction: reverse-alternate;
	}

	.glitch::after,
	.glitch::before {
		color: hsl(var(--foreground));
		content: 'data';
		position: absolute;
		width: 100%;
		height: 55%;
		background: hsl(var(--secondary));
		overflow: hidden;
		top: 0;
	}

	@keyframes glitch-animation-1 {
		0% {
			clip: rect(13px, 140px, 15px, 0);
		}

		5% {
			clip: rect(5px, 140px, 16px, 0);
		}

		10% {
			clip: rect(16px, 140px, 6px, 0);
		}

		15% {
			clip: rect(19px, 140px, 13px, 0);
		}

		20% {
			clip: rect(6px, 140px, 18px, 0);
		}

		25% {
			clip: rect(12px, 140px, 5px, 0);
		}

		30% {
			clip: rect(4px, 140px, 20px, 0);
		}

		35% {
			clip: rect(6px, 140px, 8px, 0);
		}

		40% {
			clip: rect(17px, 140px, 7px, 0);
		}

		45% {
			clip: rect(19px, 140px, 3px, 0);
		}

		50% {
			clip: rect(6px, 140px, 5px, 0);
		}

		55% {
			clip: rect(3px, 140px, 13px, 0);
		}

		60% {
			clip: rect(15px, 140px, 14px, 0);
		}

		65% {
			clip: rect(14px, 140px, 14px, 0);
		}

		70% {
			clip: rect(8px, 140px, 15px, 0);
		}

		75% {
			clip: rect(14px, 140px, 14px, 0);
		}

		80% {
			clip: rect(12px, 140px, 19px, 0);
		}

		85% {
			clip: rect(2px, 140px, 14px, 0);
		}

		90% {
			clip: rect(12px, 140px, 5px, 0);
		}

		95% {
			clip: rect(7px, 140px, 1px, 0);
		}

		to {
			clip: rect(19px, 140px, 2px, 0);
		}
	}

	@keyframes glitch-animation-2 {
		0% {
			clip: rect(17px, 140px, 11px, 0);
		}

		5% {
			clip: rect(11px, 140px, 5px, 0);
		}

		10% {
			clip: rect(15px, 140px, 9px, 0);
		}

		15% {
			clip: rect(9px, 140px, 13px, 0);
		}

		20% {
			clip: rect(13px, 140px, 6px, 0);
		}

		25% {
			clip: rect(9px, 140px, 8px, 0);
		}

		30% {
			clip: rect(7px, 140px, 4px, 0);
		}

		35% {
			clip: rect(10px, 140px, 14px, 0);
		}

		40% {
			clip: rect(17px, 140px, 15px, 0);
		}

		45% {
			clip: rect(13px, 140px, 5px, 0);
		}

		50% {
			clip: rect(18px, 140px, 9px, 0);
		}

		55% {
			clip: rect(6px, 140px, 17px, 0);
		}

		60% {
			clip: rect(3px, 140px, 1px, 0);
		}

		65% {
			clip: rect(13px, 140px, 15px, 0);
		}

		70% {
			clip: rect(13px, 140px, 5px, 0);
		}

		75% {
			clip: rect(11px, 140px, 20px, 0);
		}

		80% {
			clip: rect(3px, 140px, 20px, 0);
		}

		85% {
			clip: rect(8px, 140px, 12px, 0);
		}

		90% {
			clip: rect(8px, 140px, 19px, 0);
		}

		95% {
			clip: rect(11px, 140px, 19px, 0);
		}

		to {
			clip: rect(4px, 140px, 18px, 0);
		}
	}
</style>
