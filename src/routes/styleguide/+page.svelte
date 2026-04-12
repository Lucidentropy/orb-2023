<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error' | 'info' | 'warning'>('success');
	let checkboxChecked = $state(false);
	let toggleOn = $state(false);
	let radioValue = $state('option1');
	let selectValue = $state('');
	let rangeValue = $state(50);
	let accordionOpen = $state<number | null>(null);

	function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
		toastMessage = message;
		toastType = type;
		toastVisible = true;
		setTimeout(() => (toastVisible = false), 3000);
	}

	const toastVariant: Record<string, string> = {
		success: 'toast-success',
		error: 'toast-error',
		info: 'toast-info',
		warning: 'toast-warning'
	};

	const toastIcons: Record<string, string> = {
		success: '✓',
		error: '✕',
		info: 'ℹ',
		warning: '⚠'
	};

	import { activeTheme, activeLayout } from '$lib/stores/themeStore';

    const themes = [
        { value: '', label: 'Default' },
        { value: 'matrix', label: 'Matrix' },
        { value: 'halflife', label: 'Half-Life' },
        { value: 'crimson', label: 'Crimson' },
        { value: 'vapor', label: 'Vapor' }
    ];

    const layouts = [
        { value: '', label: 'Page Default' },
        { value: 'classic', label: 'Classic' },
        { value: 'wide', label: 'Default' },
        { value: 'centeredNarrow', label: 'No-Panel Classic' },
        { value: 'centeredWide', label: 'No-Panel Default' },
        { value: 'fullWidth', label: 'No-Panel Full Width' }
    ];
</script>


<Container>
    {#if toastVisible}
        <div class="toast {toastVariant[toastType]}">
            <span class="font-bold font-mono">{toastIcons[toastType]}</span>
            <span class="text-sm">{toastMessage}</span>
            <button onclick={() => (toastVisible = false)} class="btn-ghost ml-auto px-1 py-0 border-0">✕</button>
        </div>
    {/if}
    
    {#if modalOpen}
        <div class="fixed inset-0 z-40 flex items-center justify-center">
            <div class="overlay" role="presentation" onclick={() => (modalOpen = false)}></div>
            <div class="orb-card relative z-10 w-full max-w-md">
                <h3 class="mb-1 font-display text-xl font-bold text-white tracking-wide">Modal Title</h3>
                <p class="mb-6 text-sm text-orb-highlight/70">This is a standard modal dialog. It can contain forms, confirmations, or detailed information.</p>
                <div class="flex justify-end gap-3">
                    <button class="btn-secondary" onclick={() => (modalOpen = false)}>Cancel</button>
                    <button class="btn-primary" onclick={() => (modalOpen = false)}>Confirm</button>
                </div>
            </div>
        </div>
    {/if}
        
    {#if confirmOpen}
        <div class="fixed inset-0 z-40 flex items-center justify-center">
            <div class="overlay"></div>
            <div class="orb-card panel-danger relative z-10 w-full max-w-sm">
                <div class="mb-4 flex items-start gap-4">
                    <div class="icon-well icon-well-danger">⚠</div>
                    <div>
                        <h3 class="font-display font-bold text-white tracking-wide">Delete item?</h3>
                        <p class="mt-1 text-sm text-danger-muted/70">This action cannot be undone.</p>
                    </div>
                </div>
                <div class="flex justify-end gap-3">
                    <button class="btn-secondary" onclick={() => (confirmOpen = false)}>Cancel</button>
                    <button class="btn-danger" onclick={() => { confirmOpen = false; showToast('Item deleted', 'success'); }}>Delete</button>
                </div>
            </div>
        </div>
    {/if}
    
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="font-display text-4xl font-bold tracking-widest text-white uppercase">Style Guide</p>
			<p class="text-sm tracking-wide text-orb-highlight/60">UI component reference — Clan Orb design system</p>
		</div>

        <div class="absolute top-6 right-6 z-20 flex w-full max-w-[460px] gap-4">
            <div class="flex-1">
                <label for="theme-select" class="field-label text-right">Theme</label>
                <select id="theme-select" class="field-input" bind:value={$activeTheme}>
                    {#each themes as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>

            <div class="flex-1">
                <label for="layout-select" class="field-label text-right">Layout</label>
                <select id="layout-select" class="field-input" bind:value={$activeLayout}>
                    {#each layouts as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>
        </div>
	</div>

    <section>
        <p class="section-label">Typography</p>
        <div class="space-y-4">
            <div class="space-y-2">
                <h1>Heading 1 / Noto Sans @ text-[1.75rem]</h1>
                <h1>Heading 1 / Noto Sans @ text-[1.75rem]<p>P tag within</p></h1>

                <h2>Heading 2 / Noto Sans @ text-[1.2rem]</h2>
                <h3>Heading 3 / Noto Sans @ text-2xl</h3>
                <h4>Heading 4 / Noto Sans @ text-xl</h4>
                <h5>Heading 5 / Noto Sans @ text-lg</h5>
            </div>

            <div class="space-y-2">
                <p class="text-lg text-orb-highlight">Large body — lead paragraph or intro copy.</p>
                <p class="text-base text-orb-highlight/80">Base body — default for most content areas.</p>
                <p class="text-sm text-orb-highlight/60">Small — captions, helper text, metadata.</p>
                <p class="section-label !mb-0 !pt-0">Overline / Section Label</p>
                <code class="code-block inline-block px-3 py-1 text-xs">Monospace — ids, values, code</code>
            </div>

            <div class="space-y-2">
                <p class="subsection-label">Link States</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                    <a href="#default-link">Default link</a>
                    <a href="#visited-link" class="visited:text-orb-accent">Visited link example</a>
                    <a href="#hover-link" class="hover:text-orb-highlight/80 hover:underline">Hover link example</a>
                    <a href="#active-link" class="active:text-orb-accent/80">Active link example</a>
                    <a href="#subtle-link" class="text-orb-highlight/70 hover:text-orb-link underline underline-offset-2">Subtle inline link example</a>
                </div>
            </div>
        </div>
    </section>

    <section>
        <p class="section-label">Theme Tokens</p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {#each [
                { label: 'orb-highlight', bg: 'bg-orb-highlight' },
                { label: 'orb-accent', bg: 'bg-orb-accent' },
                { label: 'orb-link', bg: 'bg-orb-link' },
                { label: 'bg-base', bg: 'bg-bg-base border border-border-faint' },
                { label: 'bg-deep', bg: 'bg-bg-deep' },
                { label: 'bg-mid', bg: 'bg-bg-mid' },
                { label: 'border-default', bg: 'bg-bg-base border border-border-default' },
                { label: 'border-strong', bg: 'bg-bg-base border border-border-strong' }
            ] as swatch (swatch.label)}
                <div class="overflow-hidden rounded border border-border-faint">
                    <div class="h-12 {swatch.bg}"></div>
                    <div class="bg-black/40 px-3 py-2">
                        <p class="font-mono text-xs text-orb-highlight/60">{swatch.label}</p>
                    </div>
                </div>
            {/each}
        </div>
    </section>

	<section>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="space-y-6 rounded border border-border-faint p-4 bg-bg-deep/30">
                <p class="section-label">Buttons</p>
                <div>
                    <p class="subsection-label">Variants</p>
                    <div class="flex flex-wrap gap-3">
                        <button>Default</button>
                        <button class="btn-primary">Primary</button>
                        <button class="btn-success">Success</button>
                        <button class="btn-danger">Danger</button>
                        <button class="btn-warning">Warning</button>
                        <button class="btn-ghost">Ghost</button>
                    </div>
                </div>

                <div>
                    <p class="subsection-label">Sizes</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <button class="btn-primary px-2 py-1 text-xs">XS</button>
                        <button class="btn-primary px-3 py-1.5 text-sm">SM</button>
                        <button class="btn-primary">MD</button>
                        <button class="btn-primary px-5 py-2.5 text-base">LG</button>
                        <button class="btn-primary px-6 py-3 text-lg">XL</button>
                    </div>
                </div>

                <div>
                    <p class="subsection-label">States</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <button class="btn-primary">Default</button>
                        <button class="btn-primary ring-2 ring-orb-highlight ring-offset-2 ring-offset-black">Focused</button>
                        <button class="btn-primary brightness-75">Active</button>
                        <button class="btn-primary cursor-not-allowed opacity-40" disabled>Disabled</button>
                        <button class="btn-primary flex items-center gap-2">
                            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                            Loading
                        </button>
                    </div>
                </div>

                <div>
                    <p class="subsection-label">With Icons</p>
                    <div class="flex flex-wrap gap-3">
                        <button class="btn-primary flex items-center gap-2">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Item
                        </button>
                        <button class="flex items-center gap-2">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Export
                        </button>
                        <button class="btn-secondary flex items-center justify-center p-2 leading-none">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="space-y-6 rounded border border-border-faint p-4 bg-bg-deep/30">
                <p class="section-label">Modals & Dialogs</p>
                <div class="flex flex-wrap gap-3">
                    <button class="btn-primary" onclick={() => (modalOpen = true)}>Open Modal</button>
                    <button class="btn-danger" onclick={() => (confirmOpen = true)}>Confirm / Destructive</button>
                </div>

                <div class="mt-4">
                    <p class="subsection-label">Toast Notifications</p>
                    <div class="flex flex-wrap gap-3">
                        {#each (['success', 'error', 'info', 'warning'] as const) as type}
                            <button onclick={() => showToast(`This is a ${type} notification`, type)} class="uppercase">{type}</button>
                        {/each}
                    </div>
                </div>

                <p class="section-label">Alerts & Notifications</p>
                <div class="space-y-3">
                    <div class="alert-info"><span class="font-mono">ℹ</span><div><p class="font-semibold">Info — Something you should know</p><p class="opacity-70">Additional context or guidance to help the user.</p></div></div>
                    <div class="alert-success"><span class="font-mono">✓</span><div><p class="font-semibold text-success-muted">Success — Action completed</p><p class="opacity-70">Your changes have been saved successfully.</p></div></div>
                    <div class="alert-warning"><span class="font-mono">⚠</span><div><p class="font-semibold text-warning-muted">Warning — Proceed with caution</p><p class="opacity-70">This action may have unintended side effects.</p></div></div>
                    <div class="alert-danger"><span class="font-mono">✕</span><div><p class="font-semibold">Error — Something went wrong</p><p class="opacity-70">Please try again or contact support.</p></div></div>
                </div>
            </div>
            <div class="space-y-6 rounded border border-border-faint p-4 bg-bg-deep/30">
                <p class="section-label">Loading States</p>
                <div class="flex flex-wrap items-start gap-10">
                    <div class="flex flex-col items-center gap-2">
                        <svg class="h-8 w-8 animate-spin text-orb-highlight" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                        <span class="font-mono text-xs text-orb-highlight">Spinner</span>
                    </div>
                    <div class="flex w-48 flex-col gap-2">
                        <div class="h-2.5 animate-pulse rounded bg-orb-highlight/10"></div>
                        <div class="h-2.5 w-3/4 animate-pulse rounded bg-orb-highlight/10"></div>
                        <div class="h-2.5 w-1/2 animate-pulse rounded bg-orb-highlight/10"></div>
                        <span class="mt-1 font-mono text-xs text-orb-highlight">Skeleton</span>
                    </div>
                    <div class="flex w-48 flex-col gap-2">
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-orb-highlight/10">
                            <div class="h-full w-2/3 animate-pulse rounded-full bg-orb-highlight/50"></div>
                        </div>
                        <span class="font-mono text-xs text-orb-highlight">Progress bar</span>
                    </div>
                </div>

                <p class="section-label">Badges & Pills</p>
                <div class="flex flex-wrap gap-3">
                    <span class="badge-primary">Default</span>
                    <span class="badge-success">Success</span>
                    <span class="badge-warning">Warning</span>
                    <span class="badge-danger">Danger</span>
                    <span class="badge-neutral">Neutral</span>
                    <span class="badge-success"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-success"></span>Online</span>
                    <span class="badge-neutral"><span class="h-1.5 w-1.5 rounded-full bg-orb-highlight/30"></span>Offline</span>
                    <span class="badge-solid-primary">ADMIN</span>
                    <span class="badge-solid-danger">BANNED</span>
                </div>

                <p class="section-label">Dividers</p>
                <div class="space-y-6">
                    <hr class="border-border-faint" />
                    <div class="flex items-center gap-4">
                        <hr class="flex-1 border-border-faint" />
                        <span class="font-mono text-xs uppercase tracking-widest text-orb-highlight/30">or</span>
                        <hr class="flex-1 border-border-faint" />
                    </div>
                    <hr class="border-dashed border-border-faint" />
                </div>
            </div>
		</div>
	</section>

	<section>
		<p class="section-label">Form Elements</p>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<label class="field-label" for="sg-text">Text Input</label>
				<input id="sg-text" type="text" placeholder="Placeholder text…" class="field-input" />
				<p class="field-hint">Helper text below the input.</p>
			</div>

			<div>
				<label class="field-label text-danger-muted/70" for="sg-error">Error State</label>
				<input id="sg-error" type="text" value="bad@value" class="field-input field-input-error" />
				<p class="mt-1 text-xs text-danger">This field has a validation error.</p>
			</div>

			<div>
				<label class="field-label opacity-40" for="sg-disabled">Disabled</label>
				<input id="sg-disabled" type="text" value="Cannot edit this" disabled class="field-input cursor-not-allowed opacity-40" />
			</div>

			<div>
				<label class="field-label" for="sg-select">Select</label>
				<select id="sg-select" bind:value={selectValue} class="field-input">
					<option value="">Choose an option…</option>
					<option value="a">Option Alpha</option>
					<option value="b">Option Beta</option>
					<option value="c">Option Gamma</option>
				</select>
			</div>

			<div class="sm:col-span-2">
				<label class="field-label" for="sg-textarea">Textarea</label>
				<textarea id="sg-textarea" rows="3" placeholder="Enter a longer description…" class="field-input resize-none"></textarea>
			</div>

			<div class="space-y-2">
				<p class="field-label">Checkboxes</p>
				<label class="group flex cursor-pointer items-center gap-3">
					<input type="checkbox" bind:checked={checkboxChecked} class="h-4 w-4 accent-orb-highlight" />
					<span class="text-sm text-orb-highlight/70 group-hover:text-orb-highlight">I agree to the terms</span>
				</label>
				<label class="flex cursor-not-allowed items-center gap-3 opacity-35">
					<input type="checkbox" disabled class="h-4 w-4" />
					<span class="text-sm">Disabled option</span>
				</label>
			</div>

			<div class="space-y-2">
				<p class="field-label">Radio Group</p>
				{#each [['option1', 'Option One'], ['option2', 'Option Two'], ['option3', 'Option Three']] as [val, label]}
					<label class="group flex cursor-pointer items-center gap-3">
						<input type="radio" bind:group={radioValue} value={val} class="h-4 w-4 accent-orb-highlight" />
						<span class="text-sm text-orb-highlight/70 group-hover:text-orb-highlight">{label}</span>
					</label>
				{/each}
			</div>

			<div class="space-y-2">
				<p class="field-label">Toggle Switch</p>
				<label class="flex cursor-pointer items-center gap-4">
					<button
                        role="switch"
                        aria-checked={toggleOn}
                        onclick={() => (toggleOn = !toggleOn)}
                        class="relative inline-flex h-6 w-11 items-center rounded-full border transition-all focus:outline-none {toggleOn ? 'bg-bg-mid border-orb-highlight shadow-glow-highlight' : 'bg-black border-border-faint'}"
                    >
                        <span
                            class="absolute left-1 h-4 w-4 rounded-full shadow transition-all {toggleOn ? 'translate-x-5 bg-orb-highlight' : 'translate-x-0 bg-orb-highlight/25'}"
                        ></span>
                    </button>
					<span class="text-sm transition-colors {toggleOn ? 'text-orb-highlight' : 'text-orb-highlight/35'}">{toggleOn ? 'Enabled' : 'Disabled'}</span>
				</label>
			</div>

			<div class="space-y-2">
				<p class="field-label">Range — {rangeValue}</p>
				<input type="range" bind:value={rangeValue} min="0" max="100" class="w-full accent-orb-highlight" />
			</div>
		</div>
	</section>

	<section>
		<p class="section-label">Cards</p>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="orb-card">
				<h3 class="mb-1">Basic Card</h3>
				<p class="text-sm text-orb-highlight/60">Standard panel matching the site's content container.</p>
			</div>
			<div class="orb-card !p-0 overflow-hidden">
				<div class="border-b border-border-faint bg-black/30 px-5 py-3">
					<h3 class="text-sm uppercase tracking-widest text-orb-highlight">Card Header</h3>
				</div>
				<div class="p-5">
					<p class="text-sm text-orb-highlight/60">Card with a distinct header section.</p>
				</div>
			</div>
			<div class="orb-card cursor-pointer hover:border-orb-highlight hover:shadow-glow-highlight">
				<h3 class="mb-1">Hoverable Card</h3>
				<p class="text-sm text-orb-highlight/60">Glows on hover — for clickable items.</p>
			</div>
		</div>
	</section>

	<section>
		<p class="section-label">Accordion</p>
		<div class="divide-y divide-border-faint overflow-hidden rounded border border-border-default">
			{#each [
				['What is this styleguide for?', 'This page documents all UI patterns used across Clan Orb, providing a single reference for consistent styling.'],
				['How are components organised?', 'Components are grouped by type: typography, buttons, forms, feedback, and layout. Each section shows variants and states.'],
				['Can I add new components?', 'Yes — add new sections following the existing pattern. Keep examples interactive where possible.']
			] as [q, a], i}
				<div>
					<button
						onclick={() => (accordionOpen = accordionOpen === i ? null : i)}
						class="rounded-none border-0 bg-transparent px-5 py-4 text-left text-sm font-medium text-orb-highlight transition-colors hover:bg-white/5 hover:text-white flex w-full items-center justify-between"
					>
						{q}
						<svg class="h-4 w-4 shrink-0 transition-transform {accordionOpen === i ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
					{#if accordionOpen === i}
						<div class="border-t border-border-faint px-5 py-4 text-sm text-orb-highlight/50">{a}</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<section>
		<p class="section-label">Table</p>
		<div class="overflow-hidden rounded border border-border-default">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-faint bg-black/50">
						{#each ['Name', 'Status', 'Role', 'Actions'] as col, i}
							<th class="px-4 py-3 font-mono text-xs uppercase tracking-widest text-orb-highlight/40 {i === 3 ? 'text-right' : 'text-left'}">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border-faint">
					{#each [['Alex Johnson', 'active', 'Admin'], ['Sam Rivera', 'inactive', 'Editor'], ['Jordan Lee', 'active', 'Viewer']] as [name, status, role]}
						<tr class="transition-colors hover:bg-orb-highlight/[0.03]">
							<td class="px-4 py-3 font-medium text-white">{name}</td>
							<td class="px-4 py-3">
								<span class={status === 'active' ? 'badge-success' : 'badge-neutral'}>
									<span class="h-1.5 w-1.5 rounded-full {status === 'active' ? 'bg-success animate-pulse' : 'bg-orb-highlight/20'}"></span>
									{status}
								</span>
							</td>
							<td class="px-4 py-3 text-orb-highlight/50">{role}</td>
							<td class="px-4 py-3 text-right"><button class="btn-ghost px-2 py-1 text-xs">Edit</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<p class="section-label">Empty State</p>
		<div class="rounded border border-dashed border-border-faint bg-black/30 px-6 py-16 text-center">
			<div class="icon-well mx-auto mb-4 border-border-faint bg-bg-mid/30 text-orb-highlight/30">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<h3>Nothing here yet</h3>
			<p class="body-secondary mt-1">Get started by creating your first item.</p>
			<button class="btn-primary mt-4">Create item</button>
		</div>
	</section>
</Container>