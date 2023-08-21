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

                        url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
                        duration: 5.322286
                    },
                    {
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Foregone Destruction.mp3"
                    },
                    {
                        metaData: {
                            artist: "Chrono Trigger",
                            title: "Battle With Magus"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Chrono Trigger - Battle with Magus.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Donkey Kong Country",
                            title: "Aquatic Ambience"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Donkey Kong Country 1 - Aquatic Ambience.mp3"
                    },
                    { 
                        metaData: {
                            artist: "F-Zero",
                            title: "Big Blue"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/F-Zero - Big Blue.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Megaman X",
                            title: "Password Screen"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Megaman X - Password.mp3"
                    },
                    { 
                        metaData: {
                            artist: "The Legend of Zelda",
                            title: "Overworld"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Legend of Zelda - Overworld.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Earthbound",
                            title: "Giygas Final Battle"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Earthbound - Giygas Final Battle.mp3"
                    },
                    { 
                        metaData: {
                            artist: "Final Fantasy VII",
                            title: "One Winged Angel"
                        },
                        url: "https://clanorb.s3.us-west-1.amazonaws.com/public/audio/Final Fantasy VII - One Winged Angel.mp3"
                    }
                ],
            });

            webamp.renderWhenReady(app);
         };
    });
</script>

<div id="app" bind:this={app}></div>