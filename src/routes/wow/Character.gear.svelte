<script lang="ts">
    import { wowQualityColor } from "$lib/client/wowData";

    let {
        charData,
        classId,
    }: {
        charData: any;
        classId: number | undefined;
    } = $props();

    const leftSlots  = ['HEAD','NECK','SHOULDER','BACK','CHEST','SHIRT','TABARD','WRIST'];
    const rightSlots = ['HANDS','WAIST','LEGS','FEET','FINGER_1','FINGER_2','TRINKET_1','TRINKET_2'];
    const weaponSlots = ['MAIN_HAND','OFF_HAND'];

    const slotMap = $derived(charData?.equipment?.slotMap ?? {});

    function itemEnchant(item: any): { text: string; id: number } | null {
        const enchant = item?.enchantments?.find((e: any) => e.enchantment_slot?.type === 'PERMANENT');
        if (!enchant?.display_string) return null;

        const slotNames = ['Helm', 'Shoulders', 'Chest', 'Ring', 'Boots', 'Bracers', 'Cloak', 'Gloves', 'Legs', 'Weapon', 'Shield', '2H Weapon'];

        const text = enchant.display_string
            .replace(/^Enchanted:\s*/i, '')
            .replace(new RegExp(`^Enchant (${slotNames.join('|')}) - `, 'i'), '')
            .replace(/\|A:[^|]+\|a/g, '')
            .trim();

        return { text, id: enchant.enchantment_id };
    }

    function itemGems(item: any): { name: string; iconUrl: string; displayString: string }[] {
        return (item?.sockets ?? [])
            .filter((s: any) => s.item?.id)
            .map((s: any) => ({
                name: s.item.name,
                iconUrl: s.iconUrl ?? '',
                displayString: s.display_string ?? '',
            }));
    }

    function wowheadAttrs(item: any): { href: string; dataWowhead: string } {
        const id = item?.item?.id;

        const qualityMap: Record<string, number> = {
            POOR: 0, COMMON: 1, UNCOMMON: 2, RARE: 3,
            EPIC: 4, LEGENDARY: 5, ARTIFACT: 6, HEIRLOOM: 7,
        };

        const params: Record<string, string | number> = { item: id };

        const quality = item?.quality?.type;
        if (quality && qualityMap[quality] !== undefined) params.quality = qualityMap[quality];

        const ilvl = item?.level?.value;
        if (ilvl) params.ilvl = ilvl;

        const bonusList: number[] = (item?.bonus_list ?? []).filter(Boolean);
        if (bonusList.length) params.bonus = bonusList.join(':');

        const enchant = item?.enchantments?.find((e: any) => e.enchantment_slot?.type === 'PERMANENT');
        if (enchant?.enchantment_id) params.ench = enchant.enchantment_id;

        const gemIds: number[] = (item?.sockets ?? []).map((s: any) => s.item?.id).filter(Boolean);
        if (gemIds.length) params.gems = gemIds.join(':');

        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');

        return {
            href: `https://www.wowhead.com/item=${id}`,
            dataWowhead: qs,
        };
    }

</script>

<div
    class="relative w-full flex-1 min-h-0 overflow-hidden"
    style={classId ? `background: url('/images/wow/character_bg_${classId}.webp') center center / 150% no-repeat; background-color: #000;` : 'background-color: #000;'}
>
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.9) 100%);"></div>

    <div class="relative h-full p-6">
        {#if charData?.equipment}
            <div class="relative flex h-full items-stretch justify-center gap-4 mx-auto max-w-[920px]">

                <!-- Left slots -->
                <div class="absolute left-6 top-6 z-20 flex w-[240px] flex-col gap-1 shrink-0">
                    {#each [...leftSlots] as slotType (slotType)}
                        {@const item = slotMap[slotType]}
                        {@const wh = item ? wowheadAttrs(item) : null}
                        <div
                            class="flex min-h-[44px] items-center gap-2"
                            title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}
                        >
                            <div class="relative z-20 shrink-0 group">
                                {#if item?.iconUrl && wh}
                                    <a href={wh.href} data-wowhead={wh.dataWowhead} target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                        <img
                                            src={item.iconUrl}
                                            alt={item.name}
                                            class="h-11 w-11 rounded-sm border border-black/60 object-cover"
                                            style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                            onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                        />
                                    </a>
                                {:else}
                                    <div class="flex h-11 w-11 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                        <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                            {slotType.replace(/_\d/,'').replace(/_/g,' ')}
                                        </span>
                                    </div>
                                {/if}
                            </div>

                            {#if item && wh}
                                {@const enchant = itemEnchant(item)}
                                {@const gems = itemGems(item)}
                                <div class="min-w-0 flex-1">
                                    <a
                                        href={wh.href}
                                        data-wowhead={wh.dataWowhead}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="mb-0 block truncate text-[11px] font-medium"
                                        style={`text-decoration:none;color: ${wowQualityColor(item.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                    >
                                        {item.name}
                                    </a>
                                    {#if gems.length}
                                        <div class="flex items-center gap-0.5 mt-0.5">
                                            {#each gems as gem}
                                                <img
                                                    src={gem.iconUrl}
                                                    alt={gem.name}
                                                    title="{gem.name}: {gem.displayString}"
                                                    class="h-3 w-3 rounded-sm"
                                                    onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                                />
                                            {/each}
                                        </div>
                                    {/if}
                                    {#if enchant}
                                        <p
                                            class="mb-0 truncate text-[9px]"
                                            style="color: rgba(30,255,0,0.85); text-shadow: 0 1px 2px rgba(0,0,0,0.95);"
                                            title={enchant.text}
                                        >
                                            {enchant.text}
                                        </p>
                                    {/if}
                                    <p
                                        class="mb-0 text-[10px]"
                                        style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                    >
                                        {item.level?.value ?? '—'}
                                    </p>
                                </div>
                            {:else}
                                <div class="flex-1"></div>
                            {/if}
                        </div>
                    {/each}
                </div>

                <!-- Character model + weapons -->
                <div class="relative flex-1 z-10" style="min-height: 480px;">
                    <div
                        class="absolute inset-x-0 top-0 bottom-0 z-10 pointer-events-none"
                        style={charData?.media?.assets?.find((a:any) => a.key === 'main-raw')?.value
                            ? `background-image: url('${charData.media.assets.find((a:any) => a.key === 'main-raw').value}'); background-size: 120%; background-repeat: no-repeat; background-position: center 60%;`
                            : ''}
                    ></div>

                    <div class="absolute bottom-0 left-0 right-0 z-20 flex items-start justify-center gap-3 pb-1">
                        <!-- Main hand label -->
                        <div class="w-[180px] text-right leading-tight">
                            {#if slotMap['MAIN_HAND']}
                                {@const wh = wowheadAttrs(slotMap['MAIN_HAND'])}
                                {@const enchant = itemEnchant(slotMap['MAIN_HAND'])}
                                <a
                                    href={wh.href}
                                    data-wowhead={wh.dataWowhead}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mb-0 block truncate text-[11px] font-medium"
                                    style={`text-decoration:none;color: ${wowQualityColor(slotMap['MAIN_HAND']?.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                >
                                    {slotMap['MAIN_HAND']?.name}
                                </a>
                                {#if enchant}
                                    <a
                                        data-wowhead="spell={enchant.id}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="mb-0 block truncate text-[9px]"
                                        style="text-decoration:none; color: rgba(30,255,0,0.85); text-shadow: 0 1px 2px rgba(0,0,0,0.95);"
                                        title={enchant.text}
                                    >
                                        {enchant.text}
                                    </a>
                                {/if}
                                <p
                                    class="mb-0 text-[10px]"
                                    style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                >
                                    {slotMap['MAIN_HAND']?.level?.value ?? '—'}
                                </p>
                            {/if}
                        </div>

                        <!-- Weapon icons -->
                        <div class="flex shrink-0 justify-center gap-2">
                            {#each weaponSlots as slotType (slotType)}
                                {@const item = slotMap[slotType]}
                                {@const wh = item ? wowheadAttrs(item) : null}
                                <div class="relative" title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}>
                                    {#if item?.iconUrl && wh}
                                        <a href={wh.href} data-wowhead={wh.dataWowhead} target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                            <img
                                                src={item.iconUrl}
                                                alt={item.name}
                                                class="h-12 w-12 rounded-sm border border-black/60 object-cover"
                                                style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                                onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                            />
                                        </a>
                                    {:else}
                                        <div class="flex h-12 w-12 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                            <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                                {slotType.replace(/_/g,' ')}
                                            </span>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <!-- Off hand label -->
                        <div class="w-[180px] text-left leading-tight items-start">
                            {#if slotMap['OFF_HAND']}
                                {@const wh = wowheadAttrs(slotMap['OFF_HAND'])}
                                {@const enchant = itemEnchant(slotMap['OFF_HAND'])}
                                <a
                                    href={wh.href}
                                    data-wowhead={wh.dataWowhead}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mb-0 block truncate text-[11px] font-medium"
                                    style={`text-decoration:none;color: ${wowQualityColor(slotMap['OFF_HAND']?.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                >
                                    {slotMap['OFF_HAND']?.name}
                                </a>
                                {#if enchant}
                                    <a
                                        href="https://www.wowhead.com/spell={enchant.id}"
                                        data-wowhead="spell={enchant.id}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="mb-0 block truncate text-[9px]"
                                        style="text-decoration:none; color: rgba(30,255,0,0.85); text-shadow: 0 1px 2px rgba(0,0,0,0.95);"
                                        title={enchant.text}
                                    >
                                        {enchant.text}
                                    </a>
                                {/if}
                                <p
                                    class="mb-0 text-[10px]"
                                    style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                >
                                    {slotMap['OFF_HAND']?.level?.value ?? '—'}
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Right slots -->
                <div class="absolute right-6 top-6 z-20 flex w-[240px] flex-col gap-1 shrink-0">
                    {#each [...rightSlots] as slotType (slotType)}
                        {@const item = slotMap[slotType]}
                        {@const wh = item ? wowheadAttrs(item) : null}
                        <div
                            class="flex min-h-[44px] items-center gap-2"
                            title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}
                        >
                            {#if item && wh}
                                {@const enchant = itemEnchant(item)}
                                {@const gems = itemGems(item)}
                                
                                <div class="relative z-20 min-w-0 flex-1 text-right leading-tight">
                                    <a
                                        href={wh.href}
                                        data-wowhead={wh.dataWowhead}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="mb-0 block truncate text-[11px] font-medium"
                                        style={`text-decoration:none;color: ${wowQualityColor(item.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                    >
                                        {item.name}
                                    </a>
                                    {#if gems.length}
                                        <div class="flex items-center justify-end gap-0.5 mt-0.5">
                                            {#each gems as gem}
                                                <img
                                                    src={gem.iconUrl}
                                                    alt={gem.name}
                                                    title="{gem.name}: {gem.displayString}"
                                                    class="h-3 w-3 rounded-sm"
                                                    onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                                />
                                            {/each}
                                        </div>
                                    {/if}
                                    {#if enchant}
                                        <p
                                            class="mb-0 truncate text-[9px]"
                                            style="color: rgba(30,255,0,0.85); text-shadow: 0 1px 2px rgba(0,0,0,0.95);"
                                            title={enchant.text}
                                        >
                                            {enchant.text}
                                        </p>
                                    {/if}
                                    <p
                                        class="mb-0 text-[10px]"
                                        style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                    >
                                        {item.level?.value ?? '—'}
                                    </p>
                                </div>
                            {:else}
                                <div class="flex-1"></div>
                            {/if}

                            <div class="relative z-20 shrink-0 group">
                                {#if item?.iconUrl && wh}
                                    <a href={wh.href} data-wowhead={wh.dataWowhead} target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                        <img
                                            src={item.iconUrl}
                                            alt={item.name}
                                            class="h-11 w-11 rounded-sm border border-black/60 object-cover"
                                            style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                            onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                        />
                                    </a>
                                {:else}
                                    <div class="flex h-11 w-11 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                        <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                            {slotType.replace(/_\d/,'').replace(/_/g,' ')}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

            </div>
        {:else}
            <div class="py-8 text-center text-xs text-orb-highlight/30">Loading gear...</div>
        {/if}
    </div>
</div>