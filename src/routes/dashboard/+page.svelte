<script lang="ts">
	// routes/dashboard/+page.svelte
	import Container from '$lib/ThemeHandler.svelte';

	let active = 'profile';

	const sections = [
		{ id: 'profile', label: 'Profile' },
		{ id: 'security', label: 'Security' },
		{ id: 'connections', label: 'Connections' },
		{ id: 'notifications', label: 'Notifications' },
		{ id: 'admin', label: 'Admin' }
	];
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<Container>
	<h1>
		Dashboard
		<p>Settings & account management</p>
	</h1>

	<div class="flex justify-center">
		<div class="flex gap-10 max-w-5xl w-full">
			<!-- Sidebar -->
			<div class="w-[200px] shrink-0 border-r border-border-faint pr-4">
				<nav class="flex flex-col gap-2">
					{#each sections as section (section.id)}
						<button
							type="button"
							class={`btn-link text-left px-2 py-1 ${
								active === section.id ? 'text-white' : 'text-orb-highlight/50'
							}`}
							on:click={() => (active = section.id)}
						>
							{section.label}
						</button>
					{/each}
				</nav>
			</div>

			<!-- Content -->
			<div class="flex-1 max-w-2xl space-y-8">
				{#if active === 'profile'}
					<div class="space-y-5">
						<h2>Profile</h2>

						<div class="space-y-3">
							<div>
								<label class="field-label">Username</label>
								<input class="field-input" value="orb_user" />
							</div>

							<div>
								<label class="field-label">Email</label>
								<input class="field-input" value="user@orb.local" />
							</div>
						</div>

						<div class="space-y-2">
							<h3 class="text-sm">Bio</h3>
							<textarea class="field-input min-h-[100px]" placeholder="Tell Orb something about yourself..." />
						</div>

						<button class="btn-primary">Save Changes</button>
					</div>

				{:else if active === 'security'}
					<div class="space-y-6">
						<h2>Security</h2>

						<div class="space-y-3">
							<h3 class="text-sm">Password</h3>
							<div>
								<label class="field-label">New Password</label>
								<input type="password" class="field-input" />
							</div>
							<div>
								<label class="field-label">Confirm Password</label>
								<input type="password" class="field-input" />
							</div>
							<button class="btn-link">Update Password</button>
						</div>

						<div class="space-y-3">
							<h3 class="text-sm">Two-Factor Authentication</h3>
							<p class="body-secondary">Add an extra layer of security to your account.</p>
							<button class="btn-link">Enable 2FA (Google Authenticator)</button>
						</div>

						<div class="space-y-3">
							<h3 class="text-sm">Magic Link Login</h3>
							<p class="body-secondary">Allow login via email link without password.</p>
							<button class="btn-link">Enable Magic Link</button>
						</div>
					</div>

				{:else if active === 'connections'}
					<div class="space-y-6">
						<h2>Connections</h2>

						<div class="space-y-3">
							<h3 class="text-sm">Game Accounts</h3>
							<button class="btn-link">Connect Discord</button>
							<button class="btn-link">Connect Battle.net</button>
							<button class="btn-link">Connect Steam</button>
						</div>

						<div class="space-y-3">
							<h3 class="text-sm">Streaming</h3>
							<button class="btn-link">Connect Twitch</button>
						</div>
					</div>

				{:else if active === 'notifications'}
					<div class="space-y-6">
						<h2>Notifications</h2>

						<div class="space-y-2">
							<label class="flex items-center gap-2 text-sm">
								<input type="checkbox" />
								Email Updates
							</label>
							<label class="flex items-center gap-2 text-sm">
								<input type="checkbox" />
								Site Announcements
							</label>
							<label class="flex items-center gap-2 text-sm">
								<input type="checkbox" />
								Guild Activity Alerts
							</label>
						</div>
					</div>

				{:else if active === 'admin'}
					<div class="space-y-6">
						<h2>Admin</h2>

						<div class="space-y-3">
							<h3 class="text-sm">Users</h3>
							<button class="btn-link">View All Users</button>
							<button class="btn-link">Manage Roles</button>
						</div>

						<div class="space-y-3">
							<h3 class="text-sm">Content</h3>
							<button class="btn-link">Edit CMS Pages</button>
							<button class="btn-link">Update Homepage</button>
						</div>

						<div class="space-y-3">
							<h3 class="text-sm">Analytics</h3>
							<button class="btn-link">View Visitors</button>
							<button class="btn-link">Traffic Overview</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</Container>