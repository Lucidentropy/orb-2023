<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';
</script>

<svelte:head>
	<title>Login — Clan Orb</title>
</svelte:head>

<Container>
<div class="login-bg">
	<div class="login-wrap">

		<div class="orb-logo">ORB</div>
		<p class="tagline">Member Access</p>

		<div class="orb-card login-panel">
			<div class="section-label">Sign in</div>

			<div class="mb-4">
				<label class="field-label" for="un">Username</label>
				<input id="un" class="field-input" type="text" disabled placeholder="username" />
			</div>
			<div class="mb-5">
				<label class="field-label" for="pw">Password</label>
				<input id="pw" class="field-input" type="password" disabled placeholder="••••••••" />
			</div>

			<button class="w-full btn-ghost mt-4 mb-4" disabled>Login</button>

			<div class="subsection-label mt- mb-4">or continue with</div>

			<div class="oauth-btns">
				<button class="oauth-btn" disabled>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.07.07 0 0 0-.041-.097 13.1 13.1 0 0 1-1.872-.892.074.074 0 0 1-.008-.125c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.074.074 0 0 1-.006.125 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.097c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028z" fill="#7289da"/>
					</svg>
					<span>Continue with Discord</span>
				</button>

				<button class="oauth-btn" disabled>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="10" stroke="#00aeff" stroke-width="1.5"/>
						<path d="M8 9.5c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#00aeff" opacity=".5"/>
						<path d="M4 20c1.5-3 4.5-5 8-5s6.5 2 8 5" stroke="#00aeff" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					<span>Continue with Battle.net</span>
				</button>

                <button class="oauth-btn" disabled>
                    <svg width="18" height="18" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                        <ellipse cx="50" cy="62" rx="28" ry="32" fill="#111"/>
                        <ellipse cx="50" cy="68" rx="16" ry="22" fill="#fff"/>
                        <circle cx="50" cy="32" r="20" fill="#111"/>
                        <circle cx="43" cy="27" r="4" fill="#fff"/>
                        <circle cx="57" cy="27" r="4" fill="#fff"/>
                        <circle cx="44" cy="27" r="2" fill="#111"/>
                        <circle cx="58" cy="27" r="2" fill="#111"/>
                        <ellipse cx="50" cy="36" rx="6" ry="4" fill="#f90"/>
                        <ellipse cx="24" cy="62" rx="9" ry="18" fill="#111" transform="rotate(-10 24 62)"/>
                        <ellipse cx="76" cy="62" rx="9" ry="18" fill="#111" transform="rotate(10 76 62)"/>
                        <ellipse cx="40" cy="93" rx="10" ry="5" fill="#f90" transform="rotate(-15 40 93)"/>
                        <ellipse cx="60" cy="93" rx="10" ry="5" fill="#f90" transform="rotate(15 60 93)"/>
                    </svg>
                    <span>Continue with Club Penguin Login</span>
                </button>
			</div>
		</div>
	</div>
</div>
</Container>

<style lang="scss">
	.login-bg {
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
	}

	.login-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 1rem;
		animation: fadeIn 1s ease both;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: none; }
	}

	.orb-logo {
		width: 86px;
		height: 86px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, var(--orb-bg-mid), var(--orb-bg-deep));
		border: 1px solid var(--orb-border);
		box-shadow: var(--orb-glow-panel), inset 0 0 20px rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display, 'Ropa Sans', sans-serif);
		font-size: 1.1rem;
		letter-spacing: 3px;
		color: var(--orb-highlight);
		text-shadow: 0 0 10px var(--orb-highlight);
	}

	.tagline {
		font-family: var(--font-display, 'Ropa Sans', sans-serif);
		text-transform: uppercase;
		letter-spacing: 4px;
		font-size: 0.6rem;
		color: rgba(102, 204, 255, 0.4);
		margin-top: -1rem;
	}

	.login-panel {
		width: min(380px, 92vw);
		padding: 2rem 2rem 1.75rem;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0; left: 0; right: 0;
			height: 1px;
			background: linear-gradient(90deg, transparent, var(--orb-border-strong), transparent);
		}
	}

	.oauth-btns {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.oauth-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 0.875rem;
		border: 1px solid var(--orb-border-faint);
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.35);
		color: rgba(193, 230, 255, 0.5);
		font-family: var(--font-sans, 'Noto Sans', sans-serif);
		font-size: 0.8rem;
		cursor: not-allowed;
		opacity: 0.65;
		width: 100%;
		text-align: left;

		span:nth-child(2) { flex: 1; }
	}

	.footer-note {
		font-family: var(--font-mono, monospace);
		font-size: 0.6rem;
		color: rgba(102, 204, 255, 0.2);
		letter-spacing: 2px;
		text-transform: uppercase;
	}
</style>