
<svelte:head>
	<title>404 - Page Not Found</title>
	<meta name="description" content="404" />
</svelte:head>

<script>
  import { page } from '$app/stores';
	import link from '$lib/images/deadlink.png';
</script>

<main>
  <div class="not-found">
    <img src={link} alt="Dead Link" />
    <h1>{$page.status}: {$page.error.message}</h1>
    <p>You've located a dead link.</p>
  </div>
</main>

<style>
  .not-found {
    text-align: center;
    margin-top: 50px;
  }

  .not-found h1 {
    font-size: 24px;
    color: red;
  }

  .not-found p {
    font-size: 16px;
  }
</style>