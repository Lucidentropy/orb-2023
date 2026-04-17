<script lang="ts">
    import { wowClassColor, wowClassName, max_level, SPEC_ROLE, ROLE_COLOR } from '$lib/client/wowData';

    let {
        members = [],
        guild = null,
        onSelectMember,
    }: {
        members: any[];
        guild?: any;
        onSelectMember?: (member: any) => void;
    } = $props();

    const guildAge = $derived((() => {
        const ts = guild?.created_timestamp;
        if (!ts) return null;
        let ms = Date.now() - ts;
        const years   = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)); ms -= years   * 365.25 * 24 * 60 * 60 * 1000;
        const months  = Math.floor(ms / (30.44  * 24 * 60 * 60 * 1000)); ms -= months  * 30.44  * 24 * 60 * 60 * 1000;
        const days    = Math.floor(ms / (         24 * 60 * 60 * 1000)); ms -= days    *          24 * 60 * 60 * 1000;
        const hours   = Math.floor(ms / (              60 * 60 * 1000)); ms -= hours   *               60 * 60 * 1000;
        const minutes = Math.floor(ms / (                   60 * 1000)); ms -= minutes *                    60 * 1000;
        const seconds = Math.floor(ms /                         1000);
        return { years, months, days, hours, minutes, seconds };
    })());

    const MIN_COLLECTION_COUNT = 5;

    // ── Filters ─────────────────────────────────────────────────────────────
    let showInactive  = $state(false);
    let maxLevelOnly  = $state(false);
    let includeAlts   = $state(false);

    const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

    // ── Alt detection (self-contained) ───────────────────────────────────────
    const altBuckets = $derived((() => {
        const buckets = new Map<string, any[]>();
        for (const m of members) {
            const toys = m.toys, pets = m.pets;
            const canGroup = toys != null && pets != null
                && toys >= MIN_COLLECTION_COUNT
                && pets >= MIN_COLLECTION_COUNT;
            const key = canGroup ? `${toys}-${pets}` : `solo-${m.character?.id}`;
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key)!.push(m);
        }
        for (const group of buckets.values()) {
            group.sort((a, b) => {
                const lvl = (b.character?.level ?? 0) - (a.character?.level ?? 0);
                if (lvl) return lvl;
                return (b._ilvl ?? b.details?.equipped_item_level ?? -1)
                     - (a._ilvl ?? a.details?.equipped_item_level ?? -1);
            });
        }
        return buckets;
    })());

    const mainIds = $derived((() => {
        const ids = new Set<number>();
        for (const group of altBuckets.values()) {
            const id = group[0]?.character?.id;
            if (id != null) ids.add(id);
        }
        return ids;
    })());

    const altMainMap = $derived((() => {
        const map = new Map<number, string>();
        for (const group of altBuckets.values()) {
            if (group.length < 2) continue;
            const mainName = group[0].character?.name;
            if (!mainName) continue;
            for (let i = 1; i < group.length; i++) {
                const id = group[i].character?.id;
                if (id != null) map.set(id, mainName);
            }
        }
        return map;
    })());

    // ── Filtered pool ────────────────────────────────────────────────────────
    const pool = $derived((() => {
        let list = [...members];

        if (!showInactive) {
            list = list.filter(m => {
                if (m.active === false) return false;
                const ts = m.details?.last_login_timestamp;
                if (ts == null) return false;
                return (Date.now() - ts) <= SIX_MONTHS_MS;
            });
        }

        if (maxLevelOnly) {
            list = list.filter(m => (m.character?.level ?? 0) >= max_level);
        }

        if (!includeAlts) {
            list = list.filter(m => mainIds.has(m.character?.id));
        }

        return list;
    })());

    // ── Breakdowns ───────────────────────────────────────────────────────────
    const byClass = $derived((() => {
        const counts = new Map<number, number>();
        for (const m of pool) {
            const id = m.character?.playable_class?.id;
            if (id == null) continue;
            counts.set(id, (counts.get(id) ?? 0) + 1);
        }
        return [...counts.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([id, count]) => ({ id, count, name: wowClassName(id), color: wowClassColor(id) }));
    })());

    const byRole = $derived((() => {
        const counts: Record<string, number> = { Tank: 0, Healer: 0, DPS: 0, Unknown: 0 };
        for (const m of pool) {
            const spec = getMemberSpec(m);
            const role = spec ? (SPEC_ROLE[spec] ?? 'Unknown') : 'Unknown';
            counts[role]++;
        }
        return Object.entries(counts)
            .filter(([, c]) => c > 0)
            .map(([role, count]) => ({ role, count, color: ROLE_COLOR[role] ?? 'var(--orb-highlight)' }));
    })());

    const bySpecByClass = $derived((() => {
        const classGroups = new Map<number, {
            classId: number;
            className: string;
            color: string;
            specs: { spec: string; count: number; role: string; color: string }[];
        }>();

        for (const m of pool) {
            const spec = getMemberSpec(m);
            if (!spec) continue;
            const role = SPEC_ROLE[spec] ?? 'Unknown';
            const classId = m.character?.playable_class?.id;
            if (classId == null) continue;

            if (!classGroups.has(classId)) {
                classGroups.set(classId, {
                    classId,
                    className: wowClassName(classId),
                    color: wowClassColor(classId),
                    specs: [],
                });
            }

            const group = classGroups.get(classId)!;
            const existing = group.specs.find(s => s.spec === spec);
            if (existing) existing.count++;
            else group.specs.push({ spec, count: 1, role, color: wowClassColor(classId) });
        }

        // sort specs within each class by count desc
        for (const group of classGroups.values()) {
            group.specs.sort((a, b) => b.count - a.count);
        }

        // sort classes by total member count desc
        return [...classGroups.values()].sort((a, b) => a.classId - b.classId);
    })());

    const maxSpecCount = $derived(
        Math.max(...bySpecByClass.flatMap(g => g.specs.map(s => s.count)), 1)
    );

    const total = $derived(pool.length);
    const maxClassCount  = $derived(Math.max(...byClass.map(c => c.count), 1));

    // ── Member list ───────────────────────────────────────────────────────────
    let selectedClass = $state<number | null>(null);
    let selectedRole  = $state<string | null>(null);
    let selectedSpec = $state<{ spec: string; classId: number } | null>(null);

    const filteredList = $derived((() => {
        return pool.filter(m => {
            if (selectedClass != null && m.character?.playable_class?.id !== selectedClass) return false;
            if (selectedRole != null) {
                const spec = getMemberSpec(m);
                const role = spec ? (SPEC_ROLE[spec] ?? 'Unknown') : 'Unknown';
                if (role !== selectedRole) return false;
            }
            if (selectedSpec != null && !(
                getMemberSpec(m) === selectedSpec.spec &&
                m.character?.playable_class?.id === selectedSpec.classId
            )) return false;
            return true;
        }).sort((a, b) => {
            const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
            if (lvlDiff) return lvlDiff;
            return (b.details?.equipped_item_level ?? 0) - (a.details?.equipped_item_level ?? 0);
        });
    })());

    const listLabel = $derived(
        selectedSpec  != null ? selectedSpec.spec :
        selectedClass != null ? wowClassName(selectedClass) :
        selectedRole  != null ? selectedRole + 's' : ''
    );

    const anySelected = $derived(selectedClass !== null || selectedRole !== null || selectedSpec !== null);

    function clearSelection() {
        selectedClass = null;
        selectedRole  = null;
        selectedSpec  = null;
    }

    function toggleClass(id: number) {
        selectedClass = selectedClass === id ? null : id;
        selectedRole  = null;
        selectedSpec  = null;
    }

    function toggleRole(role: string) {
        selectedRole  = selectedRole === role ? null : role;
        selectedClass = null;
        selectedSpec  = null;
    }

    function toggleSpec(spec: string, classId: number) {
        if (selectedSpec?.spec === spec && selectedSpec?.classId === classId) {
            selectedSpec = null;
        } else {
            selectedSpec = { spec, classId };
            selectedClass = null;
            selectedRole  = null;
        }
    }

    function getMemberSpec(m: any): string | null {
        return m.details?.active_spec?.name
            ?? m.character?.active_spec?.name
            ?? null;
    }

    function isSpecSelected(spec: string, classId: number) {
        return selectedSpec?.spec === spec && selectedSpec?.classId === classId;
    }
    function isSpecFaded(spec: string, classId: number) {
        return selectedSpec !== null && !isSpecSelected(spec, classId);
    }    

    const totalMembers = $derived(members.length);
    const activeMembers = $derived(members.filter(m => {
        if (m.active === false) return false;
        const ts = m.details?.last_login_timestamp;
        if (ts == null) return false;
        return (Date.now() - ts) <= SIX_MONTHS_MS;
    }).length);
</script>

<section class="space-y-4 h-full flex flex-col">
<div class="space-y-2">
    <div class="flex items-center justify-between gap-4 flex-wrap">
        <p class="section-label mb-0">Guild Stats</p>
    </div>
    <h3 class='text-center'>Guild Orb in World of Warcraft</h3>
    <div class="flex flex-wrap gap-4 rounded border border-border-faint/20 bg-black/20 px-4 py-3 text-sm justify-center">
        <span>Total members: <span style="color: var(--orb-highlight)">{totalMembers}</span></span>
        <span style="color: var(--background-600)">·</span>
        <span>Active characters: <span style="color: var(--orb-highlight)">{activeMembers}</span></span>
        <span style="color: var(--background-600)">·</span>
        <span>Active mains: <span style="color: var(--orb-highlight)">{total}</span></span>
        {#if guildAge}
            <p class="mb-0">
                Founded {guildAge.years} years, {guildAge.months} months, {guildAge.days} days, {guildAge.hours} hours, {guildAge.minutes} minutes, {guildAge.seconds} seconds ago
            </p>
        {/if}        
    </div>
</div>



<!-- Filters -->
    <div class="flex flex-wrap gap-4 rounded border border-border-faint/20 bg-black/20 px-4 py-3">
        {#each [
            { label: 'Show Inactive', state: showInactive, toggle: () => { showInactive = !showInactive; } },
            { label: 'Max Level Only', state: maxLevelOnly, toggle: () => { maxLevelOnly = !maxLevelOnly; } },
            { label: 'Include Alts',  state: includeAlts,  toggle: () => { includeAlts  = !includeAlts;  } },
        ] as f (f.label)}
            <label class="flex cursor-pointer items-center gap-3 text-xs uppercase tracking-wide" style="color: var(--orb-highlight)">
                <span>{f.label}</span>
                <div class="relative">
                    <input type="checkbox" class="peer sr-only" checked={f.state} onchange={f.toggle} />
                    <div
                        class="h-5 w-10 rounded-full transition-colors"
                        style="background: {f.state ? 'var(--orb-highlight)' : 'var(--orb-bg-800)'}"
                    ></div>
                    <div
                        class="absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform"
                        style="transform: translateX({f.state ? '20px' : '0px'})"
                    ></div>
                </div>
            </label>
        {/each}
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <!-- Role breakdown -->
        <div class="rounded border border-border-faint/20 bg-black/20 p-4 space-y-4">
            <p class="subsection-label">By Role</p>

            <!-- Segmented bar -->
            <div class="flex h-3 w-full overflow-hidden rounded-full gap-px" style="background: var(--orb-bg-800)">
                {#each byRole as r (r.role)}
                    <div
                        class="h-full transition-all duration-500 cursor-pointer"
                        style="width: {r.count / total * 100}%; background: {r.color}; opacity: {selectedRole === r.role || selectedRole === null ? 1 : 0.3};"
                        title="{r.role}: {r.count}"
                        onclick={() => toggleRole(r.role)}
                    ></div>
                {/each}
            </div>

            <!-- Stat blocks -->
            <div class="grid gap-2" style="grid-template-columns: repeat({byRole.length}, minmax(0, 1fr))">
                {#each byRole as r (r.role)}
                    <button
                        type="button"
                        class="btn-row flex flex-col items-center gap-1 rounded py-3 px-2 transition-colors"
                        style="background: {selectedRole === r.role ? 'color-mix(in srgb, ' + r.color + ' 10%, transparent)' : 'transparent'}; border: 1px solid {selectedRole === r.role ? r.color : 'transparent'};"
                        onclick={() => toggleRole(r.role)}
                    >
                        <span class="font-mono text-2xl font-bold leading-none tabular-nums" style="color: {r.color}">{r.count}</span>
                        <span class="font-mono text-[10px] uppercase tracking-widest" style="color: {selectedRole === r.role ? r.color : 'var(--background-400)'}">{r.role}</span>
                        <span class="font-mono text-[10px]" style="color: var(--background-500)">{Math.round(r.count / total * 100)}%</span>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Class breakdown -->
        <div class="rounded border border-border-faint/20 bg-black/20 p-4 space-y-2">
            <p class="subsection-label">By Class</p>
            {#each byClass as c (c.id)}
                <button
                    type="button"
                    class="btn-row w-full group"
                    onclick={() => toggleClass(c.id)}
                >
                    <div class="flex items-center gap-2 mb-0.5">
                        <img src="/images/wow/icon_class_{c.id}.jpg" alt="" class="h-5 w-5 rounded-sm shrink-0"
                            style="opacity: {selectedClass === c.id || selectedClass === null ? 1 : 0.2};" />
                        <span class="text-sm w-28 text-left truncate transition-all"
                            style="color: {selectedClass === c.id ? c.color : selectedClass === null ? 'var(--orb-highlight)' : 'rgba(255,255,255,0.15)'}">
                            {c.name}
                        </span>
                        <div class="flex-1 mx-2 h-2 rounded-full overflow-hidden" style="background: var(--orb-bg-800)">
                            <div
                                class="h-full rounded-full transition-all duration-500"
                                style="width: {c.count / maxClassCount * 100}%; background: {c.color}; opacity: {selectedClass === c.id || selectedClass === null ? 1 : 0.1};"
                            ></div>
                        </div>
                        <span class="font-mono text-sm tabular-nums transition-all"
                            style="color: {selectedClass === c.id ? c.color : selectedClass === null ? c.color : 'rgba(255,255,255,0.15)'}">
                            {c.count}
                        </span>
                    </div>
                </button>
            {/each}
        </div>

        <!-- Spec breakdown -->
        <div class="rounded border border-border-faint/20 bg-black/20 p-4 space-y-4 lg:col-span-2">
            <p class="subsection-label">By Spec</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {#each bySpecByClass as group (group.classId)}
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 mb-2">
                            <img src="/images/wow/icon_class_{group.classId}.jpg" alt="" class="h-4 w-4 rounded-sm shrink-0" />
                            <span class="text-xs font-semibold uppercase tracking-wide" style="color: {group.color}">{group.className}</span>
                        </div>
                        {#each group.specs as s (s.spec)}
                            <button type="button" class="btn-row w-full flex items-center gap-2" onclick={() => toggleSpec(s.spec, group.classId)}>
                            <span class="text-[10px] w-3 shrink-0 text-right font-mono tabular-nums transition-all"
                                style="color: {isSpecSelected(s.spec, group.classId) ? s.color : isSpecFaded(s.spec, group.classId) ? 'rgba(255,255,255,0.15)' : 'var(--orb-highlight)'}">
                                {s.count}
                            </span>
                            <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: var(--orb-bg-800)">
                                <div
                                    class="h-full rounded-full transition-all duration-500"
                                    style="width: {s.count / maxSpecCount * 100}%; background: {s.color}; opacity: {isSpecFaded(s.spec, group.classId) ? 0.15 : 1};"
                                ></div>
                            </div>
                            <span class="text-xs w-24 truncate transition-colors text-left"
                                style="color: {isSpecSelected(s.spec, group.classId) ? s.color : isSpecFaded(s.spec, group.classId) ? 'rgba(255,255,255,0.15)' : 'var(--orb-highlight)'}">
                                {s.spec}
                            </span>
                        </button>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Member list (shown when a filter is active) -->
    {#if anySelected}
        <div class="rounded border border-border-faint/20 bg-black/20 p-4 space-y-2">
            <div class="flex items-center justify-between">
                <p class="subsection-label flex-1">
                    {listLabel}
                    <span class="ml-2 font-mono text-[10px]" style="color: var(--background-500)">({filteredList.length})</span>
                </p>
                <button
                    type="button"
                    class="btn-ghost text-[10px] px-2 py-1"
                    onclick={clearSelection}
                >Clear</button>
            </div>

            <div class="grid grid-cols-2 gap-px sm:grid-cols-3 xl:grid-cols-3">
                {#each filteredList as m (m.character?.id)}
                    {@const classId = m.character?.playable_class?.id}
                    {@const spec = getMemberSpec(m)}
                    {@const role = spec ? (SPEC_ROLE[spec] ?? null) : null}
                    {@const isAlt = altMainMap.has(m.character?.id)}
                    {@const mainName = altMainMap.get(m.character?.id)}
                    <button type="button" class="btn-row flex items-center gap-2 rounded px-2 py-2 w-full text-left transition-colors hover:bg-white/5" onclick={() => onSelectMember?.(m)}>
                        {#if m.avatarUrl}
                            <img src={m.avatarUrl} alt={m.character?.name} class="h-8 w-8 flex-shrink-0 rounded-sm object-cover" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        {:else}
                            <div class="h-8 w-8 flex-shrink-0 rounded-sm" style="background: var(--orb-bg-800)"></div>
                        {/if}
                        <div class="min-w-0">
                            <p class="mb-0 text-sm font-medium truncate" style="color: {wowClassColor(classId)}">{m.character?.name ?? 'Unknown'}</p>
                            <p class="mb-0 text-[10px] flex items-center gap-1 truncate" style="color: var(--background-400)">
                                {#if spec}<span>{spec}</span>{/if}
                                {#if role}<span style="color: {ROLE_COLOR[role]}"> · {role}</span>{/if}
                                {#if isAlt}<span style="color: var(--background-500)"> · alt of {mainName}</span>{/if}
                            </p>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</section>