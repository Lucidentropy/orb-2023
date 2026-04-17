<script lang="ts">
    import { onMount } from 'svelte';

    let {
        charData,
        member,
    }: {
        charData: any;
        member: any;
    } = $props();

    type SectionCache = {
        section: string;
        fetchedAt: string | null;
        expiresAt: string | null;
        stale: boolean;
    };

    const LABELS: Record<string, string> = {
        profile: 'Profile', equipment: 'Equipment', media: 'Media',
        mounts: 'Mounts', pets: 'Pets', toys: 'Toys',
        decor: 'Decor', achievements: 'Achievements',
    };

    let sections = $state<SectionCache[]>([]);
    let loading = $state(true);
    let error = $state('');

    const realmName = $derived(
        member?.character?.realm?.name ??
        charData?.meta?.realm
            ?.split('-')
            .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ') ??
        '—'
    );

    onMount(async () => {
        const realm = charData?.meta?.realm;
        const name  = charData?.meta?.name;
        if (!realm || !name) { loading = false; error = 'Missing character info'; return; }

        try {
            const res = await fetch(`/api/wow/character/cache?realm=${encodeURIComponent(realm)}&name=${encodeURIComponent(name)}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.message ?? 'Failed');
            sections = data.sections;
        } catch (err: unknown) {
            error = err instanceof Error ? err.message : 'Unknown error';
        } finally {
            loading = false;
        }
    });

    function formatDate(ts: string | null) {
        if (!ts) return null;
        return new Date(ts).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    }

    function ageLabel(ts: string | null) {
        if (!ts) return null;
        const ms = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    function timeUntil(ts: string | null) {
        if (!ts) return null;
        const ms = new Date(ts).getTime() - Date.now();
        if (ms <= 0) return 'expired';
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    }

    function formatBytes(bytes: number | null) {
        if (!bytes) return null;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
</script>

<div class="p-5 space-y-4">
    <div class="flex items-start justify-between">
        <div>
            <p class="section-label mb-1">Cache Status</p>
            <p class="mb-0 text-xs" style="color: var(--orb-highlight)">
                {member?.character?.name} — {realmName}
            </p>
        </div>
    </div>

    {#if loading}
        <div class="py-8 text-center text-xs uppercase tracking-widest" style="color: var(--orb-highlight)">Querying cache...</div>

    {:else if error}
        <div class="alert-danger text-xs">{error}</div>

    {:else}
        <div class="space-y-1">
            {#each sections as s (s.section)}
                <div class="flex items-center justify-between gap-4 rounded border border-border-faint/20 bg-black/20 px-4 py-3">
                    <span class="font-mono text-xs uppercase tracking-widest w-28 shrink-0" style="color: var(--orb-highlight)">
                        {LABELS[s.section] ?? s.section}
                    </span>

                    {#if s.fetchedAt}
                        <div class="flex-1 text-right">
                            <p class="mb-0 text-xs" style="color: var(--orb-highlight)">{formatDate(s.fetchedAt)}</p>
                            <p class="mb-0 text-[11px] text-white">{ageLabel(s.fetchedAt)}</p>
                        </div>
                        <div class="shrink-0 text-right w-16">
                            <p class="mb-0 text-xs font-mono" style="color: var(--background-400)">{formatBytes(s.sizeBytes)}</p>
                        </div>
                        <div class="shrink-0 text-right w-20">
                            {#if s.stale}
                                <span class="badge-warning">stale</span>
                            {:else}
                                <p class="mb-0 text-[10px]" style="color: var(--background-400)">expires</p>
                                <p class="mb-0 text-xs" style="color: var(--orb-success)">{timeUntil(s.expiresAt)}</p>
                            {/if}
                        </div>
                    {:else}
                        <div class="flex-1"></div>
                        <span class="text-xs italic" style="color: var(--background-500)">not cached</span>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>