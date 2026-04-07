<script lant="ts">
    const bombBayVehicles = ['Streamer216','RO-86 Alkonost','B-11 Strikeforce','Avenger','Volatol','Seabreeze','Mogul','RM-10 Bombushka','Tula','Rogue','LF-22 Starling'];
    const boostVehicles = ['Scramjet', 'Oppressor Mk II', 'Vigilante', 'Rocket Voltic', 'Toreador'];

    const stashCodes = ['73-27-38','24-10-81','01-23-45','72-68-83','77-79-73','28-03-98','02-12-87','28-11-97','44-23-37','05-02-91'];
</script>

<section class="text-column">
    <a href="/gta" class="hover:underline text-blue-600 absolute top-3 right-5">← Back to GTA</a>
    <h1>Grand Theft Auto 5: Online Info and References</h1>

    <p>This page is meant to be a collection of information tables and lookup references in one place. I do not take credit for creating these.</p>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">Acid Lab Sting Locations</h3>

        <div class="w-full max-w-2xl border border-gray-300 rounded text-xs mx-auto">

          <div class="grid grid-cols-2 bg-gray-100 border-b border-gray-300">
            <div class="p-2 font-semibold text-gray-700 border-r border-gray-300">Sting Location</div>
            <div class="p-2 font-semibold text-gray-700">Actual Drop Off</div>
          </div>

          <div class="grid grid-cols-2 border-b border-gray-200">
            <div class="p-2 border-r border-gray-200">LSIA Airport Parking</div>
            <div class="p-2">Rancho Warehouse Near the LSCM</div>
          </div>
          <div class="grid grid-cols-2 border-b border-gray-200">
            <div class="p-2 border-r border-gray-200">Von Crastenburg Richman</div>
            <div class="p-2">Davis near the drain</div>
          </div>
          <div class="grid grid-cols-2">
            <div class="p-2 border-r border-gray-200">Pillbox Hill Ammu-nation</div>
            <div class="p-2">Up the street of the Diamond Casino Entrance</div>
          </div>
        </div>
    </section>


    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">Diamond Casino Helicopter Spawn Route</h3>
        <p class="text-sm mb-4">Path in green with gaurantee helicopter spawn.</p>
        <img src="https://i.redd.it/r2xuudyiheg51.jpg" class="w-full max-w-2xl mx-auto mb-4" alt="Diamond Casino Helicopter Spawn Route">
    </section>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">Stash House Safe Codes</h3>
        <ul class="list-disc text-md list-inside mb-4 text-left columns-2 gap-4 mx-auto w-1/2 ">
            {#each stashCodes as code}
                <li class="text-center list-none text-lg letter-spacing-wide">{code}</li>
            {/each}
        </ul>
    </section>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">Vehicle Groups WIP</h3>

        <h4 class="text-sm font-semibold mb-2">Vehicles that have bomb bays</h4>
        <ul class="list-disc text-xs list-inside mb-4 text-left columns-4 gap-4">
            {#each bombBayVehicles as vehicle}
                <li>{vehicle}</li>
            {/each}
        </ul>


        <h4 class="text-sm font-semibold mb-2">Vehicles that have boost</h4>
        <ul class="list-disc text-xs list-inside mb-4 text-left columns-4 gap-4">
            {#each boostVehicles as vehicle}
                <li>{vehicle}</li>
            {/each}
        </ul>
    </section>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">Business Payouts WIP</h3>

        <p class="text-sm mb-4">This is a rough estimate of how much passive income you can expect to earn from an investment in GTA Online.</p>
        <table class="w-full mx-auto text-xs">
            <thead>
                <tr class="bg-gray-800">
                    <th class="p-2">Business</th>
                    <th class="p-2">Investment</th>
                    <th class="p-2">Passive</th>
                    <th class="p-2">Repeatable</th>
                    <th class="p-2">Big</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-2">Nightclub</td>
                    <td class="p-2 font-mono">
                        min: $1,255,000 <br>
                        max: $6,165,000 <br>
                        upg: $5,330,000
                    </td>
                    <td class="p-2"><strong>Max Popularity</strong><br>$50,000</td>
                    <td class="p-2"><strong>Promote Club</strong><br>$10,000</td>
                    <td class="p-2"><strong>Warehouse Sell</strong><br>
                        $1,400,000
                    </td>
                </tr>
                <tr>
                    <td class="p-2">Agency</td>
                    <td class="p-2 font-mono">$6,165,000</td>
                    <td class="p-2"><strong>Complete 200 Contracts</strong><br>$20,000</td>
                    <td class="p-2"><strong>Security Contracts, Payphone Hits</strong><br>$50,000-$70,000</td>
                    <td class="p-2"><strong>Dr. Dre Contract</strong><br>
                        $1,000,000
                    </td>
                </tr>
                <tr>
                    <td class="p-2">Arcade</td>
                    <td class="p-2 font-mono">min: 1,235,000<br>max: $4,082,500</td>
                    <td class="p-2"><strong>All Arcade Machine Slots</strong><br>$3,600</td>
                    <td class="p-2"><strong></strong><br>n/a</td>
                    <td class="p-2"><strong>Diamond Casino Heist</strong><br>
                        $1,000,000
                    </td>
                </tr>
                <tr>
                    <td class="p-2">Car Wash</td>
                    <td class="p-2 font-mono">$1,000,000</td>
                    <td class="p-2"><strong>All Businesses</strong><br>~$30,000</td>
                    <td class="p-2"><strong>Money Laundering</strong><br>$35,000</td>
                    <td class="p-2"><strong></strong><br>
                        n/a
                    </td>
                </tr>
                <tr>
                    <td class="p-2">Salvage Yard</td>
                    <td class="p-2 font-mono">min:$1,620,000<br>max:$2,690,000</td>
                    <td class="p-2"><strong>Max Salvage Popularity</strong><br>$24,000</td>
                    <td class="p-2"><strong>2x Salvage Cars/gameday</strong><br>$60,000-$80,000</td>
                    <td class="p-2"><strong>3x Cars Sold/Week</strong><br>
                        ~$1,000,000
                    </td>
                </tr>
                <tr>
                    <td class="p-2">Auto Shop</td>
                    <td class="p-2 font-mono">min:$1,620,000<br>max:$2,690,000</td>
                    <td class="p-2">n/a</td>
                    <td class="p-2"><strong>10x Exotic Imports/day</strong><br>$60,000-$80,000</td>
                    <td class="p-2"><strong>Mini-Heist, each</strong><br>
                        $150,000-$300,000
                    </td>
                </tr>

            </tbody>
        </table>
    </section>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center">
        <h3 class="text-xl font-bold mb-4">All Phone Contact Features WIP</h3>

        <p class="text-sm mb-4">This is a list of all the phone contact features in GTA Online.</p>
        <table class="w-full mx-auto text-xs">
            <thead>
                <tr class="bg-gray-800">
                    <th class="p-2">Contact</th>
                    <th class="p-2">Feature</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="p-2">Lester</td>
                    <td class="p-2">Remove Bounty, Remove Wanted Level, Request Assassination, Request Vehicle Delivery</td>
                </tr>
                <tr>
                    <td class="p-2">Ron</td>
                    <td class="p-2">Request Airstrike, Request Vehicle Delivery</td>
                </tr>
                <tr>
                    <td class="p-2">Morse Mutual</td>
                    <td class="p-2">Claim Insurance, Request Vehicle Delivery</td>
                </tr>

            </tbody>
        </table>
    </section>

    <section class="border border-gray-500 rounded p-4 mb-8 text-center text-sm">
        <h3 class="text-xl font-bold mb-4">All Garage Space</h3>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div class="font-bold">Location</div>
            <div class="font-bold">Garage Slots</div>
            <div class="font-bold">Dedicated Slots</div>
            <div class="font-bold">Notes</div>

            <div>Aparments/Garages x10</div>
            <div>100</div>
            <div></div>
            <div></div>

            <div>Office</div>
            <div>60</div>
            <div></div>
            <div></div>

            <div>Eclipse Blvd</div>
            <div>50</div>
            <div></div>
            <div></div>

            <div>Nightclub</div>
            <div>30</div>
            <div>5</div>
            <div>Terrorbyte, Opressor MK2, Custom Speedo, Mule, Pounder</div>

            <div>Arena Workshop</div>
            <div>27</div>
            <div>4</div>
            <div>3x Cerberus, RC Bandito</div>

            <div>Agency</div>
            <div>20</div>
            <div></div>
            <div></div>

            <div>Autoshop</div>
            <div>10</div>
            <div></div>
            <div></div>

            <div>Casino Penthouse</div>
            <div>10</div>
            <div></div>
            <div></div>

            <div>Arcade</div>
            <div>10</div>
            <div></div>
            <div></div>

            <div>MC Clubhouse</div>
            <div></div>
            <div>10</div>
            <div>Motorcycles</div>

            <div>Facility</div>
            <div>7</div>
            <div>5</div>
            <div>Avenger, TM-02 Khanjali, Chernobog, RCV, Thruster</div>

            <div>Bail Office</div>
            <div>2</div>
            <div>1</div>
            <div>Bail Office Transporter</div>

            <div>Vehicle Warehouse</div>
            <div></div>
            <div>8</div>
            <div>Ruiner 2000, Rocket Voltic, Armored Boxville, Wastelander, Phantom Wedge, Ramp Buggy, Technical Aqua, Blazer Aqua</div>

            <div>Kosatka</div>
            <div></div>            
            <div>3</div>
            <div>Sparrow, Avisa, Toreador</div>

            <div>Freakshop</div>
            <div></div>            
            <div>2</div>
            <div>Acid Lab, Delivery Bike</div>

            <div>Bunker</div>
            <div></div>            
            <div>2</div>
            <div>Mobile Operations Center, Anti-Aircraft Trailer</div>
        </div>

            
          <p><strong>Special Vehicles : </strong> 20</p>
          <p><strong>Personal Vehicles : </strong> 350</p>
          <br>
          <p><strong>Totals vehicle storage : </strong> 350</p>

    </section>



</section>