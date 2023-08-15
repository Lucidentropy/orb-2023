
<svelte:head>
	<title>{error_no} - {error_msg}</title>
	<meta name="description" content="{error_no}" />
</svelte:head>

<script>
  import { page } from '$app/stores';
  const error_no = $page.status;
  const error_msg = $page.error?.message;
  console.error($page.error);
</script>

<main>
  <div class="grid"></div>
  <div class="lines"></div>
  <h1>
    <svg height="124" width="1000" stroke="#FFF" fill="" stroke-width="7" class="text-line">
        <text style="" x="0" y="0">ERROR {error_no}</text>
      </svg>
    <span>ERROR {error_no}</span>
    <span>ERROR {error_no}</span>
  </h1>
  <h2>Broken in style!</h2>
  <p class="error_msg">{error_msg}</p>
  <p><a href="/">back</a></p>
</main>

<style lang="scss">
// Source credit : https://codepen.io/ykadosh/pen/zYNxVKr

/* latin-ext */
@font-face {
  font-family: 'Mr Dafoe';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/mrdafoe/v14/lJwE-pIzkS5NXuMMrFijibIgxC_DZdM.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Mr Dafoe';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/mrdafoe/v14/lJwE-pIzkS5NXuMMrFitibIgxC_D.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* vietnamese */
@font-face {
  font-family: 'Exo';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/exo/v20/4UaZrEtFpBI4f1ZSIK9d4LjJ4vowOwtmO3ws9Iq2uBiM.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Exo';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/exo/v20/4UaZrEtFpBI4f1ZSIK9d4LjJ4vowOwpmO3ws9Iq2uBiM.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Exo';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/exo/v20/4UaZrEtFpBI4f1ZSIK9d4LjJ4vowOwRmO3ws9Iq2uA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}



body, html {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: radial-gradient(rgba(#7600bf, 0.5) 0%, transparent 70%), linear-gradient(#0b161e 40%, #202076 70%);
  perspective: 700px;
  font-size: clamp(10px, 2vw, 20px);
  z-index:0;
  position:fixed;
  top:0;
  left:0;
  width:100vw;
  height:100vh;
}

.lines {
  $color: #59c1fe;
  position: absolute;
  width: 100vw;
  background: linear-gradient(rgba($color, 0.2) 20%, $color 40%, $color 60%, rgba($color, 0.2) 80%);
  background-size: 1px 10px;
  box-shadow: 0 0 1em rgba($color, 0.4);
  transform: translateY(-2.5em);
  left: 0;
  top:calc(43% - 40px);
  height:80px;
}

h1 {
  position: relative;
  font-family: 'Exo';
  font-size: 6em;
  margin: 0;
  transform: skew(-15deg);
  letter-spacing: 0.03em;
  white-space:nowrap;
  
  &::after {
    content: '';
    position: absolute;
    top: 5px;
    right: 0;
    width: 0.4em;
    height: 0.4em;
    background: 
      radial-gradient(white 3%, rgba(white, 0.3) 15%, rgba(white, 0.05) 60%, transparent 80%),
      radial-gradient(rgba(white, 0.2) 50%, transparent 60%) 50% 50% / 5% 100%,
      radial-gradient(rgba(white, 0.2) 50%, transparent 60%) 50% 50% / 70% 5%;
    background-repeat: no-repeat;
  }


  svg {
    position:absolute;
    top:0;
    left:0;
    
  }
  

  span:first-child {
    display: block;
    text-shadow: 0 0 0.1em #8ba2d0, 0 0 0.2em black,  0 0 5em #165ff3;
    -webkit-text-stroke: 0.06em rgba(black, 0.5);
  }
  
  span:last-child, svg text {
    position: absolute;
    left: 0;
    top: 0;
    background-image: linear-gradient(#032d50 25%, #00a1ef 35%, white 50%, #20125f 50%, #8313e7 55%, #ff61af 75%);
    -webkit-text-stroke: 0.01em #94a0b9;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

h2 {
  font-family: 'Mr Dafoe';
  margin: 0;
  font-size: 4.5em;
  margin-top: -0.6em;
  color: white;
  text-shadow: 0 0 0.05em #fff, 0 0 0.2em #fe05e1, 0 0 0.3em #fe05e1;
  transform: rotate(-7deg);
}

.grid {
  $main: #7d41e6;
  $glow: rgba(#2e26ff, 0.4);
  background: 
    linear-gradient(transparent 65%, $glow 75%, $main 80%, $glow 85%, transparent 95%),
    linear-gradient(90deg, transparent 65%, $glow 75%, $main 80%, $glow 85%, transparent 95%);
  background-size: 30px 30px;
  width: 200vw;
  height: 300vh;
  position: absolute;
  bottom: -120vh;
  transform: rotateX(-100deg);
  -webkit-mask-image: linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0) 80%);
  z-index:-1;
}

.text-line {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  
  animation: dash 5s linear forwards, textGlow 4s infinite;
}

.text-line text {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  alignment-baseline: text-before-edge;
  animation: dash 5s linear infinite alternate forwards;
}

.error_msg {
  background-color:rgba(221, 221, 221, 0.867);
  display:block;
  padding:20px;
  margin:40px 0;
  border-radius:5px;
  color:#252525;
  position: relative;
  max-width:840px;

  &::before {
  content: "";
  position: absolute;
  z-index: -1;
  bottom: 0;
  left: 15px;
  height: 15%;
  width: 70%;
  box-shadow: -25px -4px 4px 0 rgba(0,0,0,0.85);
  transform: skewX(60deg);
}
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes textGlow {
  0% {
    text-shadow: none;
  }
  10% {
    text-shadow: 0 0 0 transparent;
  }
  20% {
    text-shadow: 0 0 10px #fff;
  }
  35% {
    text-shadow: 0 0 5px #fff;
  }
  50% {
    text-shadow: 0 0 8px #fff;
  }
  80% {
    text-shadow: 0 0 0 transparent;
  }
  100% {
    text-shadow: none;
  }
}
</style>