<script lang="ts">
	import { onMount } from "svelte";
    let pannellum = null;

    onMount(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.pannellum.org/2.3/pannellum.js";
        script.onload = () => {
            pannellum = window.pannellum; // Now you can access the pannellum object
            if (pannellum) {
            pannellum.viewer("panorama", {
                type: "equirectangular",
                panorama: "https://clanorb.s3.us-west-1.amazonaws.com/public/images/pano/wd2pano.jpg",
            });
            }
        };
        document.head.appendChild(script);
    });
</script>

<svelte:head>
    <title>Orb - Panoramic Gallery</title>
	<meta name="description" content="A page to show off 360 degree panoramic game shots." />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
    <link rel="stylesheet" href="https://cdn.pannellum.org/2.3/pannellum.css">
</svelte:head>

<div class="text-column">
    <h1>Panoramic Gallery</h1>
    <p> This feature will be a gallery of panoramic game images. Here's an image from Watch Dogs 2 to show you how it'll work.</p>

    <div id="panorama"></div>


</div>



<style>
    #panorama {
        width:95vw;
        max-width: 100%;
        aspect-ratio:16/9;
    }

</style>

    
