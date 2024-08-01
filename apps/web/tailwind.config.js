// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharedConfig = require('@haptic/tailwind-config/tailwind.config.js');

module.exports = {
	presets: [sharedConfig],
	content: ['./src/**/*.{html,js,svelte,ts}', '../../packages/ui/**/*.{html,js,svelte,ts}']
};
