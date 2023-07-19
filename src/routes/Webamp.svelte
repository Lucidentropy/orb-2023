<script>
import { onMount, onDestroy } from 'svelte';

    let app;

    onMount(() => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/webamp@1.4.2/built/webamp.bundle.min.js';
        document.head.appendChild(script);

        script.onload = () => {
            const webamp = new Webamp({
                initialTracks: [
                    {
                        metaData: {
                            artist: "DJ Mike Llama",
                            title: "Llama Whippin' Intro"
                        },
                        // NOTE: Your audio file must be served from the same domain as your HTML
                        // file, or served with permissive CORS HTTP headers:
                        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
                        url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
                        duration: 5.322286
                    },
                    {
                        url: "/src/lib/audio/Foregone Destruction.mp3"
                    },
                    {
                        metaData: {
                            artist: "Chrono Trigger",
                            title: "Battle With Magus"
                        },
                        url: "/src/lib/audio/Chrono Trigger - Battle with Magus.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Donkey Kong Country",
                            title: "Aquatic Ambience"
                        },
                        url: "/src/lib/audio/Donkey Kong Country 1 - Aquatic Ambience.mp3"
                    },
                    { 
                        metaData: {
                            artist: "F-Zero",
                            title: "Big Blue"
                        },
                        url: "/src/lib/audio/F-Zero - Big Blue.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Megaman X",
                            title: "Password Screen"
                        },
                        url: "/src/lib/audio/Megaman X - Password.mp3"
                    },
                    { 
                        metaData: {
                            artist: "The Legend of Zelda",
                            title: "Overworld"
                        },
                        url: "/src/lib/audio/Legend of Zelda - Overworld.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Earthbound",
                            title: "Giygas Final Battle"
                        },
                        url: "/src/lib/audio/Earthbound - Giygas Final Battle.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Final Fantasy VII",
                            title: "One Winged Angel"
                        },
                        url: "/src/lib/audio/Final Fantasy VII - One Winged Angel.mp3"
                    }
                ],
            });

            webamp.renderWhenReady(app);
         };
    });
</script>

<div id="app" bind:this={app}></div>