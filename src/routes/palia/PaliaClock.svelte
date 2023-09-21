<script lang="ts">
  import { onMount } from 'svelte';

  let currentTime: string = '';
  let rotationAngle: number = 0;
  const testSpeedMultiplier = 1; // Set this to 1 for real-time, higher values will speed up the clock

  onMount(() => {
    const updateClock = () => {
      const now = new Date();
      const minutes = (now.getMinutes() + now.getSeconds() / 60) * testSpeedMultiplier;
      const hour24 = Math.floor(minutes / 2.5);
      const hour12 = hour24 % 12 || 12;
      const amPm = hour24 >= 12 ? 'PM' : 'AM';
      currentTime = `${hour12.toString().padStart(2, '0')}:${Math.floor((minutes % 2.5) * 24).toString().padStart(2, '0')} ${amPm}`;

      const totalMinutesInDay = 24 * 60;
      const elapsedMinutes = (hour24 * 60 + minutes) % totalMinutesInDay;
      rotationAngle = (elapsedMinutes / totalMinutesInDay) * 360;
    };

    updateClock();
    setInterval(updateClock, 1000);
  });
</script>

<style lang="scss">
    .palia-clock {
        width: 250px;
        position: relative;

        .clock {
            background: url('/images/palia-clock.png') no-repeat 50% 50%;
            width: 216px;
            height: 228px;
            position: relative;
            margin:0 auto;
        }

        .indicator {

            width: 114px;
            height: 46px;
            transform-origin: 108px 114px;
            transition: 1s linear all;

            img {
                transform:rotate(150deg);
            }
        }

        .current-time {
            background-color: #ccc;
            color: #fff;
            text-align: center;
            border-radius: 30px;
            padding: 10px;
            width:70%;
            margin:30px auto 0;
        }
    }

</style>

<div class="palia-clock">
    <div class="clock">
        <div class="indicator" style={`transform: rotate(${rotationAngle + 210}deg);`} >
            <img src="/images/palia-clock-indicator.png"/>
        </div>
        
    </div>
    <div class="current-time">
        {currentTime}
    </div>
</div>
