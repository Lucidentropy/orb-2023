<script lang="ts">
    import { max_level, wowClassColor, wowSpecName } from "$lib/client/wowData";
    import type { WowEnrichedMember } from '$lib/types/wow';

    let {
        detectedAlts = [],
        onSelectMember,
    }: {
        detectedAlts: WowEnrichedMember[];
        onSelectMember?: (member: WowEnrichedMember) => void;
    } = $props();

    function formatRealmSlug(slug?: string) {
        if (!slug) return '';
        return slug.toLowerCase().split('-').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    const altGroups = $derived((() => {
        const maxAlts = detectedAlts.filter((a) => (a.character?.level ?? 0) >= max_level);
        const rest = detectedAlts.filter((a) => (a.character?.level ?? 0) < max_level);
        const buckets = new Map<string, WowEnrichedMember[]>();
        for (const a of rest) {
            const lvl = a.character?.level ?? 0;
            const floor = Math.floor(lvl / 10) * 10;
            const key = `${floor}–${floor + 9}`;
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key)!.push(a);
        }
        const groups: { label: string; alts: WowEnrichedMember[] }[] = [];
        if (maxAlts.length) groups.push({ label: 'Max Level', alts: maxAlts });
        for (const [label, alts] of [...buckets.entries()].sort((a, b) => parseInt(b[0]) - parseInt(a[0]))) {
            groups.push({ label, alts });
        }
        return groups;
    })());
</script>

<div class="p-5 space-y-4">
    {#if detectedAlts.length === 0}
        <p class="text-sm text-orb-highlight/30">No Alts</p>
    {:else}
        {#each altGroups as group (group.label)}
            <div class="space-y-1">
                <p class="subsection-label">{group.label}</p>
                <div class="grid grid-cols-2 gap-px sm:grid-cols-3">
                    {#each group.alts as alt (alt.character?.id)}
                        <button
                            type="button"
                            class="flex btn-row items-center gap-2 rounded px-2 py-2 text-left transition-colors hover:bg-orb-highlight/[0.07] focus:outline-none"
                            style="background:none; border:none; box-shadow:none; text-shadow:none; cursor:pointer;"
                            onclick={() => onSelectMember?.(alt)}
                        >
                            {#if alt.avatarUrl}
                                <img src={alt.avatarUrl} alt={alt.character?.name} class="h-8 w-8 flex-shrink-0 rounded-sm object-cover" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {:else}
                                <div class="h-8 w-8 flex-shrink-0 rounded-sm bg-border-faint/20"></div>
                            {/if}
                            <div class="min-w-0">
                                <p class="mb-0 text-sm font-medium truncate" style="color: {wowClassColor(alt.character?.playable_class?.id)}">
                                    {alt.character?.name || 'Unknown'}{#if (alt.character?.realm?.slug ?? '').toLowerCase() !== 'stormreaver'}-{formatRealmSlug(alt.character?.realm?.slug)}{/if}
                                </p>
                                <p class="mb-0 flex items-center gap-1 text-xs text-orb-highlight/60 truncate">
                                    <span class="text-white">{alt.character?.level ?? '-'}</span>
                                    {#if alt.details?.active_spec?.name}<span>· {wowSpecName(alt.details.active_spec.name)}</span>{/if}
                                    · <span class="text-orb-highlight/40">{alt.details?.equipped_item_level ?? '—'}</span>
                                </p>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>