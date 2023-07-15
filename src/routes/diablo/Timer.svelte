<script lang="ts">
    export let event: string;


  import { readable } from 'svelte/store';

  const countdown = readable<number>(0, (set) => {
    const interval = setInterval(() => {
      set(new Date().getSeconds());
    }, 1000);

    return () => clearInterval(interval);
  });

  $: time = new Date($countdown * 1000).toISOString().substr(11, 8);


  let eventName: string = '',
        timepattern;

  switch (event) {
    case "Helltide":
        eventName = "The Helltide Rises";
    break;
    case "Legion":
        timepattern = '12122';
        eventName = "The Gathering Legions";
    break;
    case "WorldBoss":
        eventName = "Avarice, the Gold Cursed";
    break;
  }
</script>

<div class={event.toLowerCase()}>
    <h3>{eventName}</h3>
    <p>
        <span>next event</span>
        <span class="countdown">{time}</span>
    </p>
</div>

<style lang="scss">
    div {
        flex: 1;
        margin: 1rem;
        border:1px solid #fff;
        border-radius: 0.25rem;
        padding: 1rem;
        display:flex;
        
        h3, p {
            flex-basis:50%;
        }
        
        span {
            text-align:right;
            white-space: nowrap;
            display:flex;
            justify-content: right;

            &.countdown{
                font-size:1.5em;
            }
        }
    }
</style>