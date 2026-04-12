<svelte:head>
	<title>Orb - Joining Orb</title>
	<meta name="description" content="How to join our community and get in touch." />
</svelte:head>

<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

	const orbTag = "{-o-}";

	const interests = [
		'Community',
		'Gaming',
		'Development',
		'Creative / Art',
		'Writing',
		'Moderation',
		'Events'
	];
</script>

<Container>
	<h1>
		Joining Orb
		<p>Referral-based community</p>
	</h1>

	<div class="space-y-6">
		<div class="orb-card space-y-4">
			<p>
				Joining Orb is generally done by referral of someone already in the community.
			</p>
			<p>
				If you’re interested in joining, the best way to get started is by jumping into Discord
				and getting to know the group.
			</p>
			<p>
				Join us on Discord here:
				<a href="https://discord.gg/3ZHQfaR3ky" target="_blank" rel="noopener noreferrer">
					https://discord.gg/3ZHQfaR3ky
				</a>
			</p>
		</div>

		<div class="alert-warning">
			<span class="font-mono">⚠</span>
			<div>
				<p class="font-semibold text-warning">Open applications are not available at this time.</p>
				<p class="text-warning-muted/80">
					Orb membership is typically referral-based. If you’re interested in joining,
					get to know the community or connect with us on Discord.
				</p>
			</div>
		</div>

		<section class="space-y-4">
			<p class="section-label">Join Orb</p>

			<form class="orb-card space-y-8 opacity-70" aria-disabled="true">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label class="field-label" for="display-name">Display Name</label>
						<input
							id="display-name"
							class="field-input"
							type="text"
							placeholder="How should we know you?"
							disabled
						/>
						<p class="field-hint">Your usual online handle or preferred name.</p>
					</div>

					<div>
						<label class="field-label" for="email">Email Address</label>
						<input
							id="email"
							class="field-input"
							type="email"
							placeholder="name@example.com"
							disabled
						/>
						<p class="field-hint">For follow-up if applications open.</p>
					</div>

					<div>
						<label class="field-label" for="discord">Discord Username</label>
						<input
							id="discord"
							class="field-input"
							type="text"
							placeholder="username"
							disabled
						/>
						<p class="field-hint">This is the best way for us to reach you.</p>
					</div>

					<div>
						<label class="field-label" for="referral">Referral / Invited By</label>
						<input
							id="referral"
							class="field-input"
							type="text"
							placeholder="Who in Orb pointed you here?"
							disabled
						/>
						<p class="field-hint">If nobody referred you, this can stay blank later.</p>
					</div>
				</div>

				<div class="space-y-4">
					<p class="section-label !mb-0 !pt-0">Interests</p>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each interests as interest}
							<label class="flex items-center gap-3 rounded border border-border-faint/60 bg-bg-deep/20 px-3 py-3 opacity-75">
								<input type="checkbox" class="h-4 w-4 accent-orb-highlight" disabled />
								<span class="text-sm text-orb-highlight/80">{interest}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label class="field-label" for="timezone">Timezone / Region</label>
						<select id="timezone" class="field-input" disabled>
							<option>Select your timezone</option>
						</select>
						<p class="field-hint">Helps with coordinating activity and events.</p>
					</div>

					<div>
						<label class="field-label" for="age-group">Age Group</label>
						<select id="age-group" class="field-input" disabled>
							<option>Select age group</option>
						</select>
						<p class="field-hint">General age range only, not exact age.</p>
					</div>
				</div>

				<div>
					<label class="field-label" for="about">Tell Us About Yourself</label>
					<textarea
						id="about"
						class="field-input resize-none"
						rows="5"
						placeholder="What brings you to Orb? What kind of communities do you enjoy?"
						disabled
					></textarea>
					<p class="field-hint">A short intro, interests, and what you're looking for.</p>
				</div>

				<div>
					<label class="field-label" for="contribute">Why Orb?</label>
					<textarea
						id="contribute"
						class="field-input resize-none"
						rows="4"
						placeholder="What are interested in that's different from other communities?"
						disabled
					></textarea>
					<p class="field-hint">Optional.</p>
				</div>

				<div class="flex flex-wrap items-center justify-between gap-4 border-t border-border-faint pt-4">
					<p class="body-secondary mb-0">
						Open applications are currently closed. Connect with us on Discord to get involved.
					</p>

					<div class="flex gap-3">
						<a
							href="https://discord.gg/3ZHQfaR3ky"
							target="_blank"
							rel="noopener noreferrer"
							class="btn-primary"
						>
							Join Discord
						</a>
						<button class="btn-secondary" type="submit" disabled>
							Submit Application
						</button>
					</div>
				</div>
			</form>
		</section>
	</div>
</Container>