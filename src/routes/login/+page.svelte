<script context="module">
	/** * @type {import('@sveltejs/kit').Load} */
	export async function load({ session }) {
    return { 
      props: { userData: session.userData || false } 
    }
  }
</script>

<script>
  export let userData;
  console.log('userData', userData)

    async function loginWithDiscord() {
        const res = await fetch('/auth/discord/getUrl');
        const { url } = await res.json();
        window.location.href = url;
    }
</script>

<div class="text-column">
    <h1>Login <p>Release TRON JA 307020</p></h1>
    
    {#if userData}
        <div>
            <h2>Welcome, {userData.username} ({userData.global_name})!</h2>
            <img src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`} alt="Avatar" />
            <p>Email: {userData.email}</p>
            <p>Locale: {userData.locale}</p>
            <p>Verified: {userData.verified ? 'Yes' : 'No'}</p>
            <!-- <button on:click={logout}>Logout</button> -->

        </div>
    {:else}
        <div class="login-box">
            <p>Login with your Discord account.</p>
            
            <button on:click={loginWithDiscord}>Login with Discord</button>

            <p>Contact Lucid if your account is not flagged for access.</p>
        </div>
    {/if}
</div>

<style lang="scss">
    .login-box {
        padding:10px;
    background-color:#000;
    box-shadow:none;
    text-shadow:0 0 3px #fff;
    color:#fff;
        border-radius:5px;
        text-align: center;

        button {
            padding:5px;
            box-shadow:0 0 10px #333;
            margin:10px auto;
        }
    }
</style>

