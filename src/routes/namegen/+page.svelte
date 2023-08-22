<script>
  import { writable } from 'svelte/store';

const names = [
  "Slab Bulkhead",
  "Fridge Largemeat",
  "Punt Speedchunk",
  "Butch Deadlift",
  "Bold Bigflank",
  "Splint Chesthair",
  "Flint Ironstag",
  "Bolt Vanderhuge",
  "Thick McRunfast",
  "Blast Hardcheese",
  "Buff Drinklots",
  "Trunk Slamchest",
  "Fist Rockbone",
  "Stump Beefknob",
  "Smash Lampjaw",
  "Punch Rockgroin",
  "Buck Plankchest",
  "Stump Chunkmen",
  "Dirk Hardpec",
  "Rip Steakface",
  "Slate Slabrock",
  "Crud Bonemeal",
  "Brick HardMeat",
  "Rip Slagcheek",
  "Punch Sideiron",
  "Gristle McThornbody",
  "Slate Fistcrunch",
  "Buff Hardback",
  "Bob Johnson! Oh, wait...",
  "Blast Thickneck",
  "Crunch Buttsteak",
  "Slab Squatthrust",
  "Lump Beefbroth",
  "Touch Rustrod",
  "Reef Blastbody",
  "Big McLargeHuge",
  "Smoke ManMuscle",
  "Eat Punchbeef",
  "Hack Blowfist",
  "Roll Fizzlebeef",
  "Lunk Drywall",
  "Stiff Shakestone",
  "Thump Peqwich"
];

  const nameGenerated = writable('');

  function generate() {
    const randomIndex = Math.floor(Math.random() * names.length);
    nameGenerated.set(names[randomIndex]);
  }
</script>

<div class="text-column">
    <h1>Super Useful Name Generator</h1>
    <p>Prepare yourself for a revolutionary name-finding experience, unparalleled in the annals of computational monikerology! </p>
    <p>Need to sound more heroic at the gym? Want to intimidate your enemies in online gaming? With a computational method that takes into account your personal preferences, astrological alignment, favorite sandwich, and the color of your third pet's eyes, our name generator will provide you with a name that could very well solve all of your life's problems. </p>
    <div class="center">
        <div class="generated">{$nameGenerated || ''}</div>
        <button on:click={generate}>Initiate Name Generating Dynos</button>
    </div>
</div>

<style lang="scss">
.generated {
    height:1.5em;
    font-size:50px;
    color:#fff;
    text-align:center;
}

.center{
    text-align:center;
}

</style>