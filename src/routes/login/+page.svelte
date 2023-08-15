<script lang="ts">
    import { userData } from '$store/user';
    import { onMount } from 'svelte';

    async function loginWithDiscord() {
        const res = await fetch('/api/discord');
        const { url } = await res.json();
        window.location.href = url;
    }

    $: {
        console.log('User data changed:', $userData);
    }

    function logout() {
        $userData = null;
    }

    onMount(async () => {
        console.log('user?', $userData);
    });
    
</script>

<div class="text-column">
    <h1>Login <p>Gain Access to all things important</p></h1>
    user is : {$userData}
    {#if $userData}
        <div>
            <h2>Welcome, {$userData.username} ({$userData.global_name})!</h2>
            <img src={`https://cdn.discordapp.com/avatars/${$userData.id}/${$userData.avatar}.png`} alt="Avatar" />
            <p>Email: {$userData.email}</p>
            <p>Locale: {$userData.locale}</p>
            <p>Verified: {$userData.verified ? 'Yes' : 'No'}</p>
            <button on:click={logout}>Logout</button>

        </div>
    {:else}
        <div>
            <h2>Login</h2>
            <button on:click={loginWithDiscord}>Login with Discord</button>
        </div>
    {/if}


</div>

