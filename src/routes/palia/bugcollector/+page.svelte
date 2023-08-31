<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
    import Icon from 'svelte-awesome/components/Icon.svelte';
    import { check } from 'svelte-awesome/icons';

const bugDB = [
		{
			key: 'AncAmbBee',
			name: 'Ancient Amber Beetle',
            tooltip: `One of the oldest known insects species in Palia, was said to exist in the time of humans.
    Found in the forests of Bahari Bay. Also has a chance to be found when chopping trees in Bahari Bay.`,
			rarity: 'Epic',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '360',
			starred_value: '540',
			collection_state: 0,
            sort: 8
		},
		{
			key: 'AzuSto',
			name: 'Azure Stonehopper',
            tooltip: `This little blue beauty has been known to camouflage itself as a shiny blue pebble.
    Found in the fields of Bahari Bay.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Jumping',
			base_value: '150',
			starred_value: '225',
			collection_state: 0,
            sort: 38
		},
		{
			key: 'BahBee',
			name: 'Bahari Bee',
            tooltip: `A local species of bees, known to produce delicious honey.
    Has a chance to be found when chopping trees in Bahari Bay.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Dashing',
			base_value: '39',
			starred_value: '58',
			collection_state: 0,
            sort: 26
		},
		{
			key: 'BahCra',
			name: 'Bahari Crab',
            tooltip: `A local crab, known to taste good with drawn butter.
    Found along the coast of Bahari Bay. Also has a chance to be found when foraging shells in Bahari Bay.`,
			rarity: 'Common',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '16',
			starred_value: '24',
			collection_state: 0,
            sort: 12
		},
		{
			key: 'BahGlo',
			name: 'Bahari Glowbug',
            tooltip: `A local species of bioluminescent fauna. Discovered by Professor Bonlin Amepongo.
    Found in the fields of Bahari Bay during the evening and night.`,
			rarity: 'Rare',
			timeofday: 'Evening, Night',
			location: 'Bahari Bay',
			group: 'Flying',
			base_value: '145',
			starred_value: '217',
			collection_state: 0,
            sort: 32
		},
		{
			key: 'BriBut',
			name: 'Brighteye Butterfly',
            tooltip: `Whenever you see the sun out, you can see the eyes of this intricately patterned butterfly looking around Bahari Bay.
    Found in the Forests of Bahari Bay during the morning and day.`,
			rarity: 'Rare',
			timeofday: 'Morning, Day',
			location: 'Bahari Bay',
			group: 'Flying',
			base_value: '110',
			starred_value: '165',
			collection_state: 0,
            sort: 37
		},
		{
			key: 'BruDra',
			name: 'Brushtail Dragonfly',
            tooltip: `The tail of this Dragonfly is so bright and vibrant, some early Majiri were said to have used it as a paintbrush.
    Found around the lake in Kilima, as well as rivers and ponds in Bahari Bay.`,
			rarity: 'Common',
			timeofday: 'All Day',
			location: 'Kilima Valley, Bahari Bay',
			group: 'Dashing',
			base_value: '13',
			starred_value: '19',
			collection_state: 0,
            sort: 7
		},
		{
			key: 'CerCic',
			name: 'Cerulean Cicada',
            tooltip: `The call of this cicada is so soothing, it was said to be the inspiration for Ayana's fourth symphony.
    Found attached to trees in Bahari Bay during the morning and day.`,
			rarity: 'Uncommon',
			timeofday: 'Morning, Day',
			location: 'Bahari Bay',
			group: 'Flying',
			base_value: '60',
			starred_value: '90',
			collection_state: 0,
            sort: 23
		},
		{
			key: 'ComBarCic',
			name: 'Common Bark Cicada',
            tooltip: `A common cicada.
    Found attached to trees in Bahari Bay during the morning and day.`,
			rarity: 'Common',
			timeofday: 'Morning, Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '21',
			starred_value: '31',
			collection_state: 0,
            sort: 22
		},
		{
			key: 'ComBluBut',
			name: 'Common Blue Butterfly',
            tooltip: `Ever resilient. Butterflies of this type can be found in almost every climate in Palia.
    Found all around Kilima and Bahari Bay during the morning and day.`,
			rarity: 'Common',
			timeofday: 'Morning, Day',
			location: 'Kilima Valley, Bahari Bay',
			group: '',
			base_value: '13',
			starred_value: '19',
			collection_state: 0,
            sort: 11
		},
		{
			key: 'ComFieCri',
			name: 'Common Field Cricket',
            tooltip: `Field crickets can be found anywhere you can find a field.
    Found all around Kilima and Bahari Bay.`,
			rarity: 'Common',
			timeofday: 'All Day',
			location: 'Kilima Valley, Bahari Bay',
			group: '',
			base_value: '16',
			starred_value: '24',
			collection_state: 0,
            sort: 10
		},
		{
			key: 'DusBut',
			name: 'Duskwing Butterfly',
            tooltip: `A beautiful butterfly with wings the color of dusk. Unique to the Kilima Valley.
    Found around the Dragon Shrine in Kilima during the morning and day.`,
			rarity: 'Uncommon',
			timeofday: 'Morning, Day',
			location: 'Kilima Valley',
			group: 'Flying',
			base_value: '34',
			starred_value: '51',
			collection_state: 0,
            sort: 18
		},
		{
			key: 'FaiMan',
			name: 'Fairy Mantis',
            tooltip: `A mantis from early Majiri legend only recently confirmed to exist by modern entomologists. Said to have magical properties.
    Found in the fields of Bahari Bay.`,
			rarity: 'Epic',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '360',
			starred_value: '540',
			collection_state: 0,
            sort: 21
		},
		{
			key: 'FirDra',
			name: 'Firebreathing Dragonfly',
            tooltip: `This Dragonfly is notoriously difficult to catch, in part due to its fiery breath.
    Found in the fields of Kilima.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: '',
			base_value: '125',
			starred_value: '187',
			collection_state: 0,
            sort: 6
		},
		{
			key: 'GarLad',
			name: 'Garden Ladybug',
            tooltip: `A black and red ladybug, popular for controlling garden pests.
    Has a chance to be found when foraging in the fields of Bahari Bay.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '46',
			starred_value: '69',
			collection_state: 0,
            sort: 15
		},
		{
			key: 'GarLea',
			name: 'Garden Leafhopper',
            tooltip: `The Garden Leafhopper is such a delight in Palia that many children keep them as pets. They are said to bring good luck.
    Found in the fields and Badruu's Farm in Kilima. Also has a chance to be found when foraging in Kilima.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: 'Jumping',
			base_value: '49',
			starred_value: '63',
			collection_state: 0,
            sort: 1
		},
		{
			key: 'GarMan',
			name: 'Garden Mantis',
            tooltip: `Nothing to see here. Just your garden variety mantis.
    Found around the lake in Kilima. Also has a chance to be found when foraging around the lake in Kilima.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: 'Jumping',
			base_value: '36',
			starred_value: '54',
			collection_state: 0,
            sort: 2
		},
		{
			key: 'GarMil',
			name: 'Garden Millipede',
            tooltip: `A brown and green millipede that loves feasting on garden crops.
    Found in the fields of Kilima. Also has a chance to be found when foraging in the fields of Kilima`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: 'Running',
			base_value: '36',
			starred_value: '54',
			collection_state: 0,
            sort: 21
		},
		{
			key: 'GarSna',
			name: 'Garden Snail',
            tooltip: `A snail that has evolved over time to look like a leaf. Good for hiding from predators, bad for hiding from the Leafstalker Mantis.
    Found along the coast and in forests of Bahari Bay.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '36',
			starred_value: '54',
			collection_state: 0,
            sort: 35
		},
		{
			key: 'GolGloBee',
			name: 'Golden Glory Bee',
            tooltip: `A rare bee, imported from the Akwindu province. Mead made from this bee's honey is said to be heavily consumed by the Queen of the province and her family.
    Has a chance to be found when chopping trees in Kilima during the morning and day.`,
			rarity: 'Rare',
			timeofday: 'Morning, Day',
			location: 'Kilima Valley',
			group: '',
			base_value: '125',
			starred_value: '187',
			collection_state: 0,
            sort: 34
		},
		{
			key: 'GosVeiMot',
			name: 'Gossamer Veil Moth',
            tooltip: `The wings of this moth are so thin that some say you can see a peek of the Dragon Realm by looking through them.
    Found in the fields of Kilima during the evening and night.`,
			rarity: 'Rare',
			timeofday: 'Evening, Night',
			location: 'Kilima Valley',
			group: '',
			base_value: '110',
			starred_value: '165',
			collection_state: 0,
            sort: 16
		},
		{
			key: 'HaiMil',
			name: 'Hairy Millipede',
            tooltip: `A millipede with a hair growth problem.
    Found in the forests of Bahari Bay.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '120',
			starred_value: '180',
			collection_state: 0,
            sort: 3
		},
		{
			key: 'InkDra',
			name: 'Inky Dragonfly',
            tooltip: `This stealthy Dragonfly is used as a component in various black dyes and inks.
    Found around rivers and ponds in Bahari Bay.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Dashing',
			base_value: '49',
			starred_value: '73',
			collection_state: 0,
            sort: 9
		},
		{
			key: 'JewDra',
			name: 'Jewelwing Dragonfly',
            tooltip: `A Dragonfly with wings as bright and colorful as any precious stone.
    Found near a cave entrance on a cliff in Bahari Bay.`,
			rarity: 'Epic',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '360',
			starred_value: '540',
			collection_state: 0,
            sort: 19
		},
		{
			key: 'KilNigMot',
			name: 'Kilima Night Moth',
            tooltip: `While beautiful, the Kilima night moth is so prevalent on hot summer nights that some consider it to be a pest. Keep away from stored cloth.
    Found all around Kilima and Bahari Bay during the evening and night.`,
			rarity: 'Common',
			timeofday: 'Evening, Night',
			location: 'Kilima Valley, Bahari Bay',
			group: 'Idle',
			base_value: '13',
			starred_value: '18',
			collection_state: 0,
            sort: 14
		},
		{
			key: 'LeaMan',
			name: 'Leafstalker Mantis',
            tooltip: `An herbivorous mantis that exclusively eats leaves.
    Has a chance to be found when foraging in the forests of Bahari Bay.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Jumping',
			base_value: '120',
			starred_value: '180',
			collection_state: 0,
            sort: 13
		},
		{
			key: 'LunFaiMot',
			name: 'Lunar Fairy Moth',
            tooltip: `The Lunar Fairy Moth is said to have a very special connection to the Dragon Moon, and is said to only appear at special times during its cycle.
    Found in the fields and forests of Bahari Bay during the evening and night.`,
			rarity: 'Uncommon',
			timeofday: 'Evening, Night',
			location: 'Bahari Bay',
			group: 'Flying',
			base_value: '34',
			starred_value: '51',
			collection_state: 0,
            sort: 29
		},
		{
			key: 'PapLanBug',
			name: 'Paper Lantern Bug',
            tooltip: `This bug glows as brightly as a colorful feast day lantern taking flight into the Palian night sky.
    Found along the coast and in forests of Bahari Bay during the evening and night.`,
			rarity: 'Common',
			timeofday: 'Evening, Night',
			location: 'Bahari Bay',
			group: '',
			base_value: '16',
			starred_value: '24',
			collection_state: 0,
            sort: 36
		},
		{
			key: 'PriLad',
			name: 'Princess Ladybug',
            tooltip: `A very regal looking lady bug, made popular by the children's fairytale, The Princess Who Turned Into A Ladybug.
    Found around the lake in Kilima.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: '',
			base_value: '145',
			starred_value: '217',
			collection_state: 0,
            sort: 20
		},
		{
			key: 'ProStaBee',
			name: 'Proudhorned Stag Beetle',
            tooltip: `The horns of this stag beetle are said to resemble that of the Proudhorned Sernuk.
    Has a chance to be found when mining in Kilima.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: 'Running',
			base_value: '46',
			starred_value: '96',
			collection_state: 0,
            sort: 28
		},
		{
			key: 'RaiBut',
			name: 'Rainbow-Tipped Butterfly',
            tooltip: `Ancient legends say this rare butterfly got its beautiful coloring from dipping the tip of its wings in a Well of Flow.
    Found in the Fields of Bahari Bay during the morning and day.`,
			rarity: 'Epic',
			timeofday: 'Morning, Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '360',
			starred_value: '540',
			collection_state: 0,
            sort: 4
		},
		{
			key: 'RasBee',
			name: 'Raspberry Beetle',
            tooltip: `A beetle whose entire diet consists of raspberries.
    Found around Badruu's Farm in Kilima.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: '',
			base_value: '145',
			starred_value: '217',
			collection_state: 0,
            sort: 24
		},
		{
			key: 'SciCen',
			name: 'Scintillating Centipede',
            tooltip: `A rare centipede with a shiny hard shell.
    Has a chance to be found when mining in Bahari Bay.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '120',
			starred_value: '180',
			collection_state: 0,
            sort: 27
		},
		{
			key: 'SpiCra',
			name: 'Spineshell Crab',
            tooltip: `A crab with a very spiny shell.
    Found along the coast of Bahari Bay.`,
			rarity: 'Uncommon',
			timeofday: 'All Day',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '46',
			starred_value: '69',
			collection_state: 0,
            sort: 33
		},
		{
			key: 'SpiCic',
			name: 'Spitfire Cicada',
            tooltip: `A spirited cicada, whose bark is worse than its bite.
    Found attached to trees in Bahari Bay during the morning and day.`,
			rarity: 'Rare',
			timeofday: 'Morning, Day',
			location: 'Bahari Bay',
			group: '',
			base_value: '145',
			starred_value: '217',
			collection_state: 0,
            sort: 31
		},
		{
			key: 'SpoMan',
			name: 'Spotted Mantis',
            tooltip: `A rare mantis with a beautiful set of spots.
    Found around the Dragon Shrine in Kilima.`,
			rarity: 'Rare',
			timeofday: 'All Day',
			location: 'Kilima Valley',
			group: '',
			base_value: '120',
			starred_value: '180',
			collection_state: 0,
            sort: 17
		},
		{
			key: 'SpoSti',
			name: 'Spotted Stinkbug',
            tooltip: `A bug known more for his strong musk than its striking colors.
    Found all around Kilima and Bahari Bay.`,
			rarity: 'Common',
			timeofday: 'All Day',
			location: 'Kilima Valley, Bahari Bay',
			group: 'Running',
			base_value: '16',
			starred_value: '24',
			collection_state: 0,
            sort: 25
		},
		{
			key: 'StrSna',
			name: 'Stripeshell Snail',
            tooltip: `A snail with such distinctive stripes, that its shell was once used as currency among the early Majiri.
    Found along the coast in Bahari Bay.`,
			rarity: 'Rare',
			timeofday: 'Evening, Night',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '120',
			starred_value: '180',
			collection_state: 0,
            sort: 30
		},
		{
			key: 'VamCra',
			name: 'Vampire Crab',
            tooltip: `An invasive species of crab that sucks the life out of the local population.
    Found around the Flooded Fortress in Bahari Bay during the evening and night.`,
			rarity: 'Rare',
			timeofday: 'Evening, Night',
			location: 'Bahari Bay',
			group: 'Running',
			base_value: '145',
			starred_value: '217',
			collection_state: 0,
            sort: 5
		}
	];

	interface Bug {
		name: string;
        tooltip: string;
		rarity: string;
		timeofday: string;
		location: string;
		group: string;
		base_value: string;
		starred_value: string;
		collectionState: number;
		key: string;
        showTooltip: boolean;
	}

	function getShortKey(str: string): string {
		let split = str.split(' ');
		if (split.length === 0) return '';
		return split.map((word) => word.substring(0, 3)).join('');
	}

    const sortedBugs = bugDB.sort((a, b) => a.sort - b.sort);
    

	let bugs = sortedBugs.map((bug) => ({
		...bug,
		key: getShortKey(bug.name),
        showTooltip: false
	}));

	const LOCAL_STORAGE_KEY = 'bugStates';

	onMount(() => {
		if (typeof window !== 'undefined') {
			const storedStates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

			if (Object.keys(storedStates).length === 0 && bugs.length === 0) {
				bugs = bugDB.map((bug) => ({
					...bug,
					key: getShortKey(bug.name)
				}));
			} else {
				bugs = bugDB.map((bug) => {
					const key = getShortKey(bug.name);
					return {
						...bug,
						collectionState: storedStates[key] ?? 0
					};
				});
			}
		}
	});

	function updateState(bug: Bug) {
		bug.collectionState = (bug.collectionState + 1) % 3;

		const storedStates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
		const key = getShortKey(bug.name);
		storedStates[key] = bug.collectionState;

		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedStates));
		bugs = [...bugs];
	}

function resetCollectionStates() {
  if (window.confirm("Just checking, sure you want to reset?")) {
    bugs = bugs.map(bug => ({ ...bug, collectionState: 0 }));
    const storedStates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    bugs.forEach(bug => {
      const key = getShortKey(bug.name);
      storedStates[key] = 0;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedStates));
  }
}   

	// === Filter-specific code starts here ===

	const filters = ['rarity', 'location', 'timeofday'];
	let selectedFilters: Record<string, string> = {};
	let pillStyles: Record<string, string> = {};

	filters.forEach((filter) => {
		selectedFilters[filter] = 'All';
		pillStyles[filter] = 'width: 38px; left: 120px;';
	});

	function getUniqueValues(key: keyof Bug): string[] {
		const values = new Set(bugs.map((bug) => bug[key]));
		if (key === 'location') {
			values.delete('Kilima Valley, Bahari Bay');
		}
        if(key === 'rarity') {
            console.log('vals', values)
        }
		return ['All', ...Array.from(values)];
	}

	const uniqueValues: Record<string, string[]> = {};
	filters.forEach((filter) => {
		uniqueValues[filter] = getUniqueValues(filter as keyof Bug);
	});

	function updateFilter(type: string, value: string, event: MouseEvent) {
		const element = event.target as HTMLElement;
		const rect = element.getBoundingClientRect();
		const style = `width: ${rect.width}px; left: ${
			rect.left - element.offsetParent.getBoundingClientRect().left
		}px;`;

		selectedFilters[type] = value;
		pillStyles[type] = style;
	}

	$: filteredBugs = bugs.filter((bug) => {
		return filters.every((filter) => {
			if (filter === 'location' && selectedFilters[filter] === 'All') {
				return true;
			}
			return (
				selectedFilters[filter] === 'All' ||
				bug[filter] === selectedFilters[filter] ||
				bug[filter].includes(selectedFilters[filter])
			);
		});
	});
    
</script>


<div class="text-column" transition:fade={{ duration: 0 }}>
    <h1>Palia Bug Collector</h1>
    <p>Click any bug to mark that youv'e collected it and again to mark it as starred. Your progress will be saved with this browser.</p>
    <h2>Kilima and Bahari Bug Collector</h2>
    <div id="container">
        
        <div id="bug-filters">
        {#each filters as filterType}
            <div class="filter-container">
            <div class="filter-pill" style={pillStyles[filterType]}></div>
            <p class="filter-label">{filterType.charAt(0).toUpperCase() + filterType.slice(1).replace(/ofd/g, " of D")}</p>
            {#each uniqueValues[filterType] as value}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span 
                class="filter-option {value === selectedFilters[filterType] ? 'selected' : ''}" 
                on:click={(event) => updateFilter(filterType, value, event)}
                >
                {value}
                </span>
            {/each}
            </div>
        {/each}
        </div>

        <div id="bug-container">
            {#if filteredBugs.length > 0}
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                {#each filteredBugs as bug}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div 
                    on:click={() => updateState(bug)} 
                    transition:fade={{ duration: 300 }} 
                    on:mouseover={() => (bug.showTooltip = true)} 
                    on:mouseout={() => (bug.showTooltip = false)}
                >
                    {#if bug.showTooltip}
                        <div class="tooltip">
                            <div class="tooltip-content rarity-{bug.rarity.toLowerCase()}">
                                <h4>{bug.name}</h4>
                                <p>{@html bug.tooltip.replace(/\n/g, '<br><br>')}</p>
                                <div class="bottom">
                                    <div class="rule">
                                        <svg id="visual" viewBox="0 0 450 10" width="450" height="10" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M0 7L10.7 6.8C21.3 6.7 42.7 6.3 64.2 6.3C85.7 6.3 107.3 6.7 128.8 6.5C150.3 6.3 171.7 5.7 193 4.8C214.3 4 235.7 3 257 2.5C278.3 2 299.7 2 321.2 2.7C342.7 3.3 364.3 4.7 385.8 5.2C407.3 5.7 428.7 5.3 439.3 5.2L450 5L450 11L439.3 11C428.7 11 407.3 11 385.8 11C364.3 11 342.7 11 321.2 11C299.7 11 278.3 11 257 11C235.7 11 214.3 11 193 11C171.7 11 150.3 11 128.8 11C107.3 11 85.7 11 64.2 11C42.7 11 21.3 11 10.7 11L0 11Z" stroke-linecap="round" stroke-linejoin="miter"></path></svg>
                                    </div>
                                    <h5>Bug</h5>
                                    <p>Value: Item Cannot Be Sold</p>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <div class="icon bug-{bug.key} status-{bug.collectionState}">
                        {#if bug.collectionState > 0}
                            <div class="check"><Icon data={check} scale={1.75}/></div>
                            
                        {/if}
                        {#if bug.collectionState == 2}
                            <div class="star">
                                <svg version="1.1" class=" icon-shadow icon-stroke" width="26" height="28" aria-label="" role="presentation" viewBox="0 0 1664 1792" style="font-size: 1.75em">
                                    <path d="M1664 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"></path>
                                </svg>
                            </div>
                        {/if}
                    </div>
                </div>
                {/each}
            {:else}
                <p transition:fade={{ duration: 0 }}>No bugs match the current filters.</p>
            {/if}
        </div>

        <button on:click={resetCollectionStates}>Reset Your Collection</button>
    </div>
    <br>
    <a href="/palia">Back to Palia</a>
</div>

<style lang="scss">
     h2 {
        font-family: "Merriweather", sans-serif;
        font-size: 50px;
        font-weight: 700;
        text-align: center;
        background-color: #263344;
        border-radius: 40px 40px 0 0;
        padding: 20px;
        margin: 0 0 -2px;
        z-index: 2;
        box-shadow: 0 10px 10px #232d3f;

    }
    .tooltip {
        position: absolute;
        z-index: 1;
        top:120px;
        left:0;
        width:450px;
        height:200px;


    }

    .tooltip-content {
        color: #fff;
        padding: 25px;
        border-radius: 30px;
        max-width: calc(100vw - 20px); /* 20px to give some space from the screen edges */
        overflow: hidden;
        text-align: left;
        font-family:'Noto Sans', sans-serif;
        font-size:16px;

        h4 {
            font-family: "Merriweather", sans-serif;
            font-size:28px;
            font-weight:normal;
        }

        h5 {
            font-family: "Merriweather", sans-serif;
            font-size:23px;
            margin-top:0;

        }

        br {
            margin:5px 0;
            display:block;
        }

        .bottom {
            margin:5px -25px -25px;
            padding:0 25px 15px 25px;
            .rule {
                margin:15px -25px -10px;
                transform:translateY(-15px)
            }


            svg {
                height:10px;
                width:100%;
            }
        }

        &.rarity-common {
            background-color:#0c1b38;
            .bottom {
                background-color:#364052;
            }
            .rule {
                fill:#364052;
            }
        }


        &.rarity-uncommon {
            background-color:#21461f;
            .bottom {
                background-color:#477c3a;
            }
            .rule {
                fill:#477c3a;
            }
        }        

        &.rarity-epic {
            background-color:#573ed2;
            .bottom {
                background-color:#3f2f8a;
            }
            .rule {
                fill:#3f2f8a;
            }            
        }

        &.rarity-rare {
            background-color:#226570;
            .bottom {
                background-color:#097c8a;
            }
            .rule {
                fill:#097c8a;
            }            
        }
    }
    #container {
        background: rgb(54, 66, 95);
        background: linear-gradient(183deg, rgba(54, 66, 95, 1) 0%, rgba(77, 114, 147, 1) 100%);
        border-radius: 0 0 20px 20px;
        text-align:center;
        padding-bottom:10px;


        #bug-filters {
            border-width: 0 3px;
            margin: 0 10px;
            padding-top: 20px;
            padding-bottom: 20px;


        }

        #bug-container {
            margin-top: 0;
            border-top: 0;
            border-radius: 0 0 20px 20px;
        }

        &>div {
            position:relative;
            border: 3px solid #5a86ad;
        }

        button {
            all:unset;
            background:#fcf1e3;
            border:0;
            color:#594e3f;
            border-radius:20px;
            padding:10px 20px;
            border:1px outset #594e3f;
        }        
    }

    #bug-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        gap: 5px;
        margin: 10px;



        &>div {
            width: calc(100% / 7);
            aspect-ratio: 1;
            cursor: pointer;
            font-size: 12px;
            position:relative;

            p {
                margin: 3px;
            }

            .icon {
                position: relative;
            }

            .icon.status-0 {
                filter: brightness(0)
            }

            .icon-stroke path {
                stroke: #ffca3e;
                stroke-width: 10;
                fill: #fff56f;
            }

            .star {
                position: absolute;
                bottom: 0;
            }

            .check {
                position:absolute;
                bottom:0;
                right:0;
                color:#3ee4a5;
                background-color:#2b394e;
                border-radius:100%;
                aspect-ratio:1;
                overflow:hidden;
                padding:3px;
            }
        }
    }



    .filter-option.selected {
        transition: color 0.3s ease 0.3s;
        /* Delay the color transition */
        color: #594e3f;
        z-index: 2;
        position: relative;
    }

    .filter-container {
        display: flex;
        align-items: center;
        position: relative;
    }

    .filter-option {
        padding: 10px;
        cursor: pointer;
        z-index: 2;
        position: relative;
        color: #fff;
    }

    .filter-pill {
        position: absolute;
        background-color: #fcf1e3;
        transition: left 0.3s ease;
        height: 100%;
        z-index: 1;
        border-radius: 20px;
    }

    .filter-label {
        width: 120px;
        display: inline-block;
        text-align: right;
        padding: 10px;
        margin: 0;
    }

    .icon {
        background: url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/palia/bug-icons.png') no-repeat top left;
        width: 128px;
        height: 128px;
    }

    .icon.bug-GolGloBee {
        background-position: 0 0;
    }

    .icon.bug-SpoSti {
        background-position: -133px 0;
    }

    .icon.bug-AncAmbBee {
        background-position: 0 -133px;
    }

    .icon.bug-RasBee {
        background-position: -133px -133px;
    }

    .icon.bug-ProStaBee {
        background-position: -266px 0;
    }

    .icon.bug-BahBee {
        background-position: -266px -133px;
    }

    .icon.bug-ComBluBut {
        background-position: 0 -266px;
    }

    .icon.bug-RaiBut {
        background-position: -133px -266px;
    }

    .icon.bug-BriBut {
        background-position: -266px -266px;
    }

    .icon.bug-DusBut {
        background-position: -399px 0;
    }

    .icon.bug-ComBarCic {
        background-position: -399px -133px;
    }

    .icon.bug-SpiCic {
        background-position: -399px -266px;
    }

    .icon.bug-CerCic {
        background-position: 0 -399px;
    }

    .icon.bug-BahCra {
        background-position: -133px -399px;
    }

    .icon.bug-VamCra {
        background-position: -266px -399px;
    }

    .icon.bug-SpiCra {
        background-position: -399px -399px;
    }

    .icon.bug-ComFieCri {
        background-position: -532px 0;
    }

    .icon.bug-AzuSto {
        background-position: -532px -133px;
    }

    .icon.bug-GarLea {
        background-position: -532px -266px;
    }

    .icon.bug-BruDra {
        background-position: -532px -399px;
    }

    .icon.bug-JewDra {
        background-position: 0 -532px;
    }

    .icon.bug-FirDra {
        background-position: -133px -532px;
    }

    .icon.bug-InkDra {
        background-position: -266px -532px;
    }

    .icon.bug-PapLanBug {
        background-position: -399px -532px;
    }

    .icon.bug-BahGlo {
        background-position: -532px -532px;
    }

    .icon.bug-PriLad {
        background-position: -665px 0;
    }

    .icon.bug-GarLad {
        background-position: -665px -133px;
    }

    .icon.bug-FaiMan {
        background-position: -665px -266px;
    }

    .icon.bug-SpoMan {
        background-position: -665px -399px;
    }

    .icon.bug-LeaMan {
        background-position: -665px -532px;
    }

    .icon.bug-GarMan {
        background-position: 0 -665px;
    }

    .icon.bug-KilNigMot {
        background-position: -133px -665px;
    }

    .icon.bug-GosVeiMot {
        background-position: -266px -665px;
    }

    .icon.bug-LunFaiMot {
        background-position: -399px -665px;
    }

    .icon.bug-HaiMil {
        background-position: -532px -665px;
    }

    .icon.bug-SciCen {
        background-position: -665px -665px;
    }

    .icon.bug-GarMil {
        background-position: -798px 0;
    }

    .icon.bug-StrSna {
        background-position: -798px -133px;
    }

    .icon.bug-GarSna {
        background-position: -798px -266px;
    }

    @media (-webkit-min-device-pixel-ratio: 2),
    (min-resolution: 192dpi) {
        .icon {
            background: url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/palia/bug-icons-retina.png') no-repeat top left;
            background-size: 931px 798px;
        }
    }
</style>

