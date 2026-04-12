<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
    import { browser } from '$app/environment';

	interface VGSItem {
		key: string;
		label: string;
		phrase?: string;
		sound?: string;
		subMenu?: string;
	}

	interface VGSMenu {
		id: string;
		title: string;
		items: VGSItem[];
	}

	const menus: VGSMenu[] = [
		{
			id: 'root',
			title: 'Root Menu',
			items: [
				{ key: 'v', label: 'Offense', subMenu: 'offense' },
				{ key: 't', label: 'Target', subMenu: 'target' },
				{ key: 'd', label: 'Defense', subMenu: 'defense' },
				{ key: 'f', label: 'Flag', subMenu: 'flag' },
				{ key: 'r', label: 'Need', subMenu: 'need' },
				{ key: 'e', label: 'Team', subMenu: 'team' },
				{ key: 'g', label: 'Global', subMenu: 'global' },
				{ key: 'a', label: 'Animations', subMenu: 'animations' },
			],
		},
		{
			id: 'offense',
			title: 'Offense',
			items: [
				{ key: 'a', label: 'Attack!', phrase: 'Attack!', sound: 'attack' },
				{ key: 'w', label: 'Wait for signal', phrase: 'Wait for my signal to attack.', sound: 'waitsig' },
				{ key: 'c', label: 'Cease fire', phrase: 'Cease fire!', sound: 'cease' },
				{ key: 'm', label: 'Move out', phrase: 'Move out.', sound: 'moveout' },
				{ key: 'r', label: 'Retreat', phrase: 'Retreat!', sound: 'retreat' },
				{ key: 'h', label: 'Hit deck', phrase: 'Hit the deck!', sound: 'hitdeck' },
				{ key: 'e', label: 'Regroup', phrase: 'Regroup.', sound: 'regroup' },
				{ key: 'v', label: 'Cover me', phrase: 'Cover me!', sound: 'coverme' },
				{ key: 'g', label: 'Going offense', phrase: 'Going offense.', sound: 'ono' },
				{ key: 'z', label: 'APC ready', phrase: 'APC ready to go... waiting for passengers.', sound: 'waitpas' },
			],
		},
		{
			id: 'target',
			title: 'Target',
			items: [
				{ key: 'a', label: 'Target acquired', phrase: 'Target Acquired', sound: 'tgtacq' },
				{ key: 'f', label: 'Fire on my target', phrase: 'Fire on my target', sound: 'firetgt' },
				{ key: 'n', label: 'Target needed', phrase: 'I need a target.', sound: 'needtgt' },
				{ key: 'o', label: 'Target out of range', phrase: 'Target out of range.', sound: 'tgtout' },
				{ key: 'd', label: 'Destroy Enemy Generator', phrase: 'Destroy the enemy generator.', sound: 'desgen' },
				{ key: 'e', label: 'Enemy Generator Destroyed', phrase: 'Enemy generator destroyed.', sound: 'gendes' },
				{ key: 't', label: 'Destroy Enemy Turret', phrase: 'Destroy enemy turret.', sound: 'destur' },
				{ key: 's', label: 'Enemy Turret Destroyed', phrase: 'Enemy turret destroyed.', sound: 'turdes' },
			],
		},
		{
			id: 'defense',
			title: 'Defense',
			items: [
				{ key: 'i', label: 'Incoming Enemies', phrase: 'Incoming enemies!', sound: 'incom2' },
				{ key: 'a', label: 'Attacked', phrase: 'We are being attacked.', sound: 'basatt' },
				{ key: 'e', label: 'Enemy is attacking base', phrase: 'The enemy is attacking our base.', sound: 'basundr' },
				{ key: 'n', label: 'Need more defense', phrase: 'We need more defense.', sound: 'needdef' },
				{ key: 'b', label: 'Defend our base', phrase: 'Defend our base.', sound: 'defbase' },
				{ key: 'd', label: 'Defending base', phrase: 'Defending our base.', sound: 'defend' },
				{ key: 't', label: 'Base Taken', phrase: 'Base is taken.', sound: 'basetkn' },
				{ key: 'c', label: 'Base Clear', phrase: 'Base is secured.', sound: 'bsclr2' },
				{ key: 'q', label: 'Is Base Clear?', phrase: 'Is our base clear?', sound: 'isbsclr' },
			],
		},
		{
			id: 'flag',
			title: 'Flag',
			items: [
				{ key: 'g', label: 'Flag gone', phrase: 'Our flag is not in the base!', sound: 'flgtkn1' },
				{ key: 'e', label: 'Enemy has flag', phrase: 'The enemy has our flag!', sound: 'flgtkm2' },
				{ key: 'h', label: 'Have enemy flag', phrase: 'I have the enemy flag.', sound: 'haveflg' },
				{ key: 's', label: 'Flag secure', phrase: 'Our flag is secure.', sound: 'flaghm' },
				{ key: 'r', label: 'Return our flag', phrase: 'Return our flag to base.', sound: 'retflag' },
				{ key: 'f', label: 'Get enemy flag', phrase: 'Get the enemy flag.', sound: 'geteflg' },
				{ key: 'm', label: 'Flag mined', phrase: 'Our flag is mined.', sound: 'flgmine' },
				{ key: 'c', label: 'Clear mines', phrase: 'Clear the mines from our flag.', sound: 'clrflg' },
				{ key: 'd', label: 'Mines cleared', phrase: 'Mines have been cleared.', sound: 'mineclr' },
			],
		},
		{
			id: 'need',
			title: 'Need',
			items: [
				{ key: 'r', label: 'Need Repairs', phrase: 'Need repairs.', sound: 'needrep' },
				{ key: 'a', label: 'Need APC Pickup', phrase: 'I need an APC pickup.', sound: 'needpku' },
				{ key: 'e', label: 'Need Escort', phrase: 'I need an escort back to base.', sound: 'needesc' },
				{ key: 't', label: 'Need Ammo', phrase: 'Can anyone bring me some ammo?', sound: 'needamo' },
			],
		},
		{
			id: 'team',
			title: 'Team',
			items: [
				{ key: 'w', label: 'Watch Shooting', phrase: "Watch where you're shooting!", sound: 'wshoot3' },
				{ key: 'd', label: "Don't know", phrase: "I don't know.", sound: 'dontkno' },
				{ key: 'n', label: 'No', phrase: 'No.', sound: 'no' },
				{ key: 'y', label: 'Yes', phrase: 'Yes.', sound: 'yes' },
				{ key: 't', label: 'Thanks', phrase: 'Thanks.', sound: 'thanks' },
				{ key: 'a', label: 'No Problem', phrase: 'No Problem.', sound: 'noprob' },
				{ key: 's', label: 'Sorry', phrase: 'Sorry.', sound: 'sorry' },
			],
		},
		{
			id: 'global',
			title: 'Global',
			items: [
				{ key: 'z', label: 'Doh', phrase: 'Doh!', sound: 'oops1' },
				{ key: 'o', label: 'Oops', phrase: 'Oops!', sound: 'oops2' },
				{ key: 's', label: 'Shazbot', phrase: 'Shazbot!', sound: 'color2' },
				{ key: 'q', label: 'Damnit', phrase: 'Damnit!', sound: 'color6' },
				{ key: 'c', label: 'Crap', phrase: 'Ah Crap!', sound: 'color7' },
				{ key: 'e', label: 'Duh', phrase: 'Duh.', sound: 'dsgst1' },
				{ key: 'x', label: 'You Idiot', phrase: 'You Idiot!', sound: 'dsgst2' },
			],
		},
		{
			id: 'animations',
			title: 'Animations',
			items: [
				{ key: 'o', label: 'Over here', phrase: 'Over here!', sound: 'ovrhere' },
				{ key: 'd', label: 'Move out of way', sound: 'outway' },
				{ key: 'r', label: 'Retreat', sound: 'retreat' },
				{ key: 's', label: 'Stop', sound: 'dsgst4' },
				{ key: 'f', label: 'Salute', sound: 'yes' },
				{ key: 'z', label: 'Kneel Pose' },
				{ key: 'x', label: 'Stand Pose' },
				{ key: 'q', label: 'Celebrate 1', sound: 'cheer1' },
				{ key: 'e', label: 'Celebrate 2', sound: 'cheer2' },
				{ key: 'w', label: 'Celebrate 3', sound: 'cheer3' },
				{ key: 'v', label: "Taunt 1 - how'd that feel?", sound: 'taunt10' },
				{ key: 'g', label: 'Taunt 2 - Come get some', sound: 'taunt4' },
				{ key: 'h', label: 'Wave - Hi', sound: 'hello' },
				{ key: 'b', label: 'Wave - Bye', sound: 'bye' },
			],
		},
	];

    let isLoading = $state(false);
	let isOpen = $state(false);
	let currentMenuId = $state('root');
	let chatLog = $state<{ text: string; id: number }[]>([]);
	let chatIdCounter = 0;

	const currentMenu = $derived(menus.find(m => m.id === currentMenuId) ?? menus[0]);

	function openMenu() {
		isOpen = true;
		currentMenuId = 'root';
	}

	function closeMenu() {
		isOpen = false;
		currentMenuId = 'root';
	}

    function playSound(token: string, onReady?: () => void) {
        if (!browser) return;
        
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            isLoading = false;
            onReady?.();
        };

        const timeout = setTimeout(done, 3000);

        try {
            const audio = new Audio(`/audio/male1.vol/male1.w${token}.wav`);
            isLoading = true;
            if (audio.readyState >= 3) {
                clearTimeout(timeout);
                done();
            } else {
                audio.addEventListener('canplaythrough', () => { clearTimeout(timeout); done(); }, { once: true });
                audio.addEventListener('error', () => { clearTimeout(timeout); done(); }, { once: true });
            }
            audio.play().catch(() => { clearTimeout(timeout); done(); });
        } catch {
            clearTimeout(timeout);
            done();
        }
    }

	function addToChat(phrase: string) {
		chatLog = [...chatLog, { text: phrase, id: ++chatIdCounter }];
	}

    function handleItem(item: VGSItem) {
        if (item.subMenu) {
            currentMenuId = item.subMenu;
        } else {
            closeMenu();
            if (item.sound) {
                playSound(item.sound, item.phrase ? () => addToChat(item.phrase!) : undefined);
            } else if (item.phrase) {
                addToChat(item.phrase);
            }
        }
    }

	function onKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (!isOpen) {
			if (e.key === 'v' || e.key === 'V') {
				e.preventDefault();
				openMenu();
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			closeMenu();
			return;
		}

		const k = e.key.toLowerCase();
		const item = currentMenu.items.find(i => i.key === k);
		if (item) {
			e.preventDefault();
			handleItem(item);
		}
	}

    onMount(() => {
        if (!browser) return;
        window.addEventListener('keydown', onKeydown);
    });

    onDestroy(() => {
        if (!browser) return;
        window.removeEventListener('keydown', onKeydown);
    });
</script>

<div class="vgs-wrapper">
	<div class="chat-box">
		<div class="chat-log">
			{#each chatLog.slice(-3) as entry (entry.id)}
				<div class="chat-entry" in:fly={{ y: 4, duration: 200 }}>
					<span class="chat-tag">&#123;-o-&#125;:</span>
					{entry.text}
				</div>
			{/each}
		</div>
        {#if !isOpen}
            <div class="vgs-hint">
                {#if isLoading}
                    loading...
                {:else}
                    <kbd>V</kbd>
                {/if}
            </div>
        {/if}
	</div>

	{#if isOpen}
		<div class="vgs-panel" transition:fly={{ y: -4, duration: 150 }}>
			<div class="vgs-title">{currentMenu.title}</div>
			<ul class="vgs-list">
				{#each currentMenu.items as item}
					<li>
						<button type="button" onclick={() => handleItem(item)}>
							<span class="vgs-key">{item.key.toLowerCase()}:</span>
							<span class="vgs-label">{item.label}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if currentMenuId !== 'root'}
				<button type="button" class="vgs-back" onclick={() => (currentMenuId = 'root')}>
					ESC · Root Menu
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.vgs-wrapper {
		position: relative;
		width: 500px;
	}

	/* bracket-style chat box */
	.chat-box {
		width: 500px;
		height: 72px;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 6px 18px;
		background: rgba(0, 0, 0, 0.25);
	}

	/* left bracket [ */
	.chat-box::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 8px;
		height: 100%;
		border-top: 1px solid #0f0;
		border-bottom: 1px solid #0f0;
		border-left: 1px solid #0f0;
	}

	/* right bracket ] */
	.chat-box::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 8px;
		height: 100%;
		border-top: 1px solid #0f0;
		border-bottom: 1px solid #0f0;
		border-right: 1px solid #0f0;
	}

	.chat-log {
		display: flex;
		flex-direction: column;
		gap: 1px;
		overflow: hidden;
	}

	.chat-entry {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		line-height: 1.4;
		color: #FFF;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		animation: fadeout 8s forwards;
	}

	@keyframes fadeout {
		0%   { opacity: 1; }
		70%  { opacity: 1; }
		100% { opacity: 0; }
	}

	.chat-tag {
		color: #4cf;
		opacity: 0.65;
	}

	.vgs-hint {
		position: absolute;
		bottom: 5px;
		right: 14px;
		font-family: 'Courier New', monospace;
		font-size: 0.65rem;
		color: rgba(102, 204, 255, 0.3);
		pointer-events: none;
	}

	.vgs-hint kbd {
		font-family: inherit;
		border: 1px solid rgba(102, 204, 255, 0.3);
		border-radius: 2px;
		padding: 0 3px;
	}

	/* VGS popup - transparent bg, opens downward below chat box */
	.vgs-panel {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 4px;
		background: transparent;
		border: none;
		padding: 6px 0 8px 4px;
		min-width: 220px;
		font-family: 'Courier New', monospace;
		font-size: 0.78rem;
		color: #3cec07;
		z-index: 500;
        background: rgba(0, 0, 0, 0.75);
	}

	.vgs-title {
		font-family: 'Ropa Sans', sans-serif;
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		color: #3cec07;
		opacity: 0.4;
		margin-bottom: 4px;
        padding:10px 10px 0;
	}

	.vgs-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.vgs-list li button {
		all: unset;
		display: flex;
		gap: 8px;
		align-items: baseline;
		cursor: pointer;
		padding: 1px 4px;
		width: 100%;
		box-sizing: border-box;
	}

    .vgs-list li button::before {
        content:'';
        padding-left:0;
    }

	.vgs-key {
		color: #3cec07;
		font-weight: bold;
		min-width: 18px;
        text-transform: lowercase;
	}

	.vgs-label {
		color: #3cec07;
	}

	.vgs-back {
		all: unset;
		display: block;
		margin-top: 6px;
		font-size: 0.65rem;
		color: rgba(102, 204, 255, 0.3);
		cursor: pointer;
		transition: color 0.15s;
	}

	.vgs-back:hover {
		color: rgba(102, 204, 255, 0.7);
	}
</style>