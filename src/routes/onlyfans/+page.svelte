<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

	const fans = [
		{ name: 'Desk Fan', rpm: 1200, type: 'Axial', blades: 3, noise: '42 dB' },
		{ name: 'Ceiling Fan', rpm: 320, type: 'Decorative Axial', blades: 5, noise: '35 dB' },
		{ name: 'Box Fan', rpm: 900, type: 'High Volume Axial', blades: 5, noise: '55 dB' },
		{ name: 'Industrial Fan', rpm: 1800, type: 'High Torque', blades: 3, noise: '72 dB' },
		{ name: 'Laptop Fan', rpm: 4200, type: 'Radial / Blower', blades: 40, noise: '28 dB' }
	];

	let active = 0;

	const cycle = () => {
		active = (active + 1) % fans.length;
	};
</script>

<svelte:head>
	<title>Orb - Only Fans</title>
	<meta name="description" content="A page of only fans." />
</svelte:head>

<Container>
	<div class="orb-card max-w-3xl mx-auto text-center space-y-6">
		<h1 class="m-0 mb-4">Official Orb Only Fans Page</h1>

		<p class="body-secondary">
			Advanced airflow analytics, enthusiast-grade ventilation, and deeply unnecessary fan data.
		</p>

		<div class="flex justify-center">
			<img
				src="/images/WwkbJm.gif"
				alt="fan"
				class="object-contain border border-border-faint p-2 bg-black/40"
			/>
		</div>

		<div class="space-y-2">
			<div class="text-sm uppercase tracking-widest text-orb-highlight/50">Featured Fan</div>
			<div class="text-xl font-bold text-white">{fans[active].name}</div>
			<div class="text-sm text-orb-highlight/60">{fans[active].rpm} RPM</div>
		</div>

		<button class="btn-primary" on:click={cycle}>
			Next Fan
		</button>

		<section class="text-left space-y-4">
			<h2>Fan Technical Specifications</h2>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<div class="field-label">TYPE</div>
					<div>{fans[active].type}</div>
				</div>
				<div>
					<div class="field-label">BLADE COUNT</div>
					<div>{fans[active].blades}</div>
				</div>
				<div>
					<div class="field-label">NOISE OUTPUT</div>
					<div>{fans[active].noise}</div>
				</div>
				<div>
					<div class="field-label">AIRFLOW RATING</div>
					<div>{Math.floor(fans[active].rpm * 0.73)} CFM</div>
				</div>
			</div>
		</section>

		<section class="text-left space-y-4">
			<h2>Deep Fan Knowledge</h2>

			<ul class="text-sm space-y-1">
				<li>Axial fans move air parallel to the shaft and dominate casual cooling applications.</li>
				<li>Centrifugal (radial) fans compress airflow outward, often used in laptops and HVAC.</li>
				<li>Blade pitch directly impacts static pressure and airflow efficiency.</li>
				<li>Higher RPM does not always mean better cooling due to turbulence and inefficiency.</li>
				<li>Fan bearings (sleeve vs ball vs fluid dynamic) determine lifespan and noise profile.</li>
				<li>Industrial fans can exceed 20,000 CFM and require structural mounting considerations.</li>
				<li>Noise perception is logarithmic; a 10 dB increase roughly doubles perceived loudness.</li>
				<li>Airflow is often measured in CFM, but static pressure is critical for dense environments.</li>
				<li>Most consumer fans operate in the 60Hz frequency domain, affecting motor design.</li>
				<li>Some fans include PWM control for dynamic speed adjustments under load.</li>
			</ul>
		</section>

		<section class="text-left space-y-4">
			<h2>Obscure Fan Trivia</h2>

			<ul class="text-sm space-y-1 text-orb-highlight/60">
				<li>The first electric fan dates back to the 1880s.</li>
				<li>Bladeless fans still use internal impellers; they just hide the mechanism.</li>
				<li>Computer case fans are typically standardized at 80mm, 120mm, and 140mm.</li>
				<li>Some high-end fans include RGB lighting, which has no aerodynamic benefit.</li>
				<li>Wind tunnels use massive fan arrays to simulate environmental conditions.</li>
				<li>Helicopter rotors are technically extremely large, very expensive fans.</li>
				<li>Dust accumulation can reduce fan efficiency by over 30%.</li>
				<li>Negative vs positive air pressure setups are debated endlessly in PC building.</li>
			</ul>
		</section>

		<div class="pt-4 border-t border-border-faint/40 text-xs text-orb-highlight/40">
			Subscribe for more airflow.
		</div>
	</div>
</Container>