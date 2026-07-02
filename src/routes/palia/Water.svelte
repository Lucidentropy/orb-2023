<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		dropsPerSecond?: number;
		damping?: number;
		strength?: number;
		shade?: number;
		maxFps?: number;
		gridWidth?: number;
        verticalAnchor?: number;
        topOffset?: number;        
	}

	let {
		src,
		dropsPerSecond = 1.4,
		damping = 0.975,
		strength = 0.09,
		shade = 0.15,
		maxFps = 60,
		gridWidth = 480,
        verticalAnchor = 1,
        topOffset = 240,
	}: Props = $props();

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const gl = canvas.getContext('webgl', {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false
		});
		if (!gl) {
			canvas.style.backgroundImage = `url("${src}")`;
			canvas.style.backgroundSize = 'cover';
			canvas.style.backgroundPosition = 'center 25%';
			return;
		}

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const encPos = 0.6;
		const overscan = 0.96;

		const VERT = `
			attribute vec2 a_pos;
			varying vec2 v_uv;
			void main(){
				v_uv = a_pos * 0.5 + 0.5;
				v_uv.y = 1.0 - v_uv.y;
				gl_Position = vec4(a_pos, 0.0, 1.0);
			}`;

		const FRAG = `
			precision mediump float;
			varying vec2 v_uv;
			uniform sampler2D u_image;
			uniform sampler2D u_disp;
			uniform vec2 u_scale;
			uniform vec2 u_offset;
			uniform float u_strength;
			uniform float u_shade;
			void main(){
				vec3 d = texture2D(u_disp, v_uv).rgb;
				vec2 off = (d.rg - 0.5) * u_strength;
				vec2 iuv = v_uv * u_scale + u_offset + off;
				vec3 col = texture2D(u_image, iuv).rgb;
				col += (d.b - 0.5) * u_shade;
				gl_FragColor = vec4(col, 1.0);
			}`;

		function compile(type: number, source: string) {
			const sh = gl!.createShader(type)!;
			gl!.shaderSource(sh, source);
			gl!.compileShader(sh);
			return sh;
		}

		const prog = gl.createProgram()!;
		gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
		gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
		gl.linkProgram(prog);
		gl.useProgram(prog);

		const aPos = gl.getAttribLocation(prog, 'a_pos');
		const uImage = gl.getUniformLocation(prog, 'u_image');
		const uDisp = gl.getUniformLocation(prog, 'u_disp');
		const uScale = gl.getUniformLocation(prog, 'u_scale');
		const uOffset = gl.getUniformLocation(prog, 'u_offset');
		const uStrength = gl.getUniformLocation(prog, 'u_strength');
		const uShade = gl.getUniformLocation(prog, 'u_shade');

		const quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1f(uStrength, strength);
		gl.uniform1f(uShade, shade);
		gl.uniform1i(uImage, 0);
		gl.uniform1i(uDisp, 1);

		const imgTex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, imgTex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		const dispTex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, dispTex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		let cols = 0;
		let rows = 0;
		let cur = new Float32Array(0);
		let prev = new Float32Array(0);
		let disp = new Uint8Array(0);
		let cssW = 0;
		let cssH = 0;
		let ready = false;

		const img = new Image();

		function setCover() {
			const ca = cssW / cssH;
			const ia = img.width / img.height;
			let sx = 1;
			let sy = 1;
			if (ia > ca) sx = ca / ia;
			else sy = ia / ca;
			sx *= overscan;
			sy *= overscan;
			gl!.uniform2f(uScale, sx, sy);
			gl!.uniform2f(uOffset, (1 - sx) * 0.5, (1 - sy) * verticalAnchor);
		}

        function setup() {
            cssW = window.innerWidth;
            cssH = window.innerHeight - topOffset;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            gl!.viewport(0, 0, canvas.width, canvas.height);

            cols = gridWidth;
            rows = Math.max(2, Math.round(cols * (cssH / cssW)));
            const n = cols * rows;
            cur = new Float32Array(n);
            prev = new Float32Array(n);
            disp = new Uint8Array(n * 4);

            gl!.activeTexture(gl!.TEXTURE1);
            gl!.bindTexture(gl!.TEXTURE_2D, dispTex);
            gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, cols, rows, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, disp);

            setCover();
            ready = true;
        }

		function touch(cx: number, cy: number, radius: number, pressure: number) {
			for (let dy = -radius; dy <= radius; dy++) {
				const y = cy + dy;
				if (y < 1 || y >= rows - 1) continue;
				for (let dx = -radius; dx <= radius; dx++) {
					const x = cx + dx;
					if (x < 1 || x >= cols - 1) continue;
					if (dx * dx + dy * dy <= radius * radius) prev[y * cols + x] += pressure;
				}
			}
		}

		function randomDrop() {
			const x = 4 + Math.floor(Math.random() * (cols - 8));
			const y = 4 + Math.floor(Math.random() * (rows - 8));
			touch(x, y, 2, 130);
		}

		function step() {
			for (let y = 1; y < rows - 1; y++) {
				const row = y * cols;
				for (let x = 1; x < cols - 1; x++) {
					const i = row + x;
					const v = (prev[i - 1] + prev[i + 1] + prev[i - cols] + prev[i + cols]) * 0.5 - cur[i];
					cur[i] = v * damping;
				}
			}
			const t = prev;
			prev = cur;
			cur = t;
		}

		function buildDisp() {
			for (let y = 0; y < rows; y++) {
				const row = y * cols;
				for (let x = 0; x < cols; x++) {
					const i = row + x;
					const left = x > 0 ? prev[i - 1] : prev[i];
					const right = x < cols - 1 ? prev[i + 1] : prev[i];
					const up = y > 0 ? prev[i - cols] : prev[i];
					const down = y < rows - 1 ? prev[i + cols] : prev[i];
					const gx = (left - right) * encPos + 128;
					const gy = (up - down) * encPos + 128;
					const j = i * 4;
					const r = gx < 0 ? 0 : gx > 255 ? 255 : gx;
					const g = gy < 0 ? 0 : gy > 255 ? 255 : gy;
					disp[j] = r;
					disp[j + 1] = g;
					disp[j + 2] = r;
					disp[j + 3] = 255;
				}
			}
		}

		function drawFrame() {
			gl!.activeTexture(gl!.TEXTURE1);
			gl!.bindTexture(gl!.TEXTURE_2D, dispTex);
			gl!.texSubImage2D(gl!.TEXTURE_2D, 0, 0, 0, cols, rows, gl!.RGBA, gl!.UNSIGNED_BYTE, disp);
			gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
		}

		let raf = 0;
		let last = performance.now();
		let acc = 0;
		let dropAccum = 0;
		const interval = 1000 / maxFps;

		function loop(now: number) {
			raf = requestAnimationFrame(loop);
			let dt = now - last;
			if (dt > 100) dt = 100;
			last = now;
			acc += dt;
			if (acc < interval) return;
			acc = 0;
			dropAccum += (interval / 1000) * dropsPerSecond;
			while (dropAccum >= 1) {
				dropAccum -= 1;
				randomDrop();
			}
			step();
			buildDisp();
			drawFrame();
		}

        function onPointerMove(e: PointerEvent) {
			if (!ready) return;
			const y = e.clientY - topOffset;
			if (y < 0) return;
			const gx = Math.floor((e.clientX / cssW) * cols);
			const gy = Math.floor((y / cssH) * rows);
			touch(gx, gy, 2, 55);
		}

		let resizeTimer = 0;
		function onResize() {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(setup, 150);
		}

        img.onload = () => {
            gl!.activeTexture(gl!.TEXTURE0);
            gl!.bindTexture(gl!.TEXTURE_2D, imgTex);
            gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
            setup();
            if (reduce) {
                buildDisp();
                drawFrame();
                return;
            }
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('resize', onResize);
            raf = requestAnimationFrame(loop);
        };
		img.src = src;

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(resizeTimer);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="water"
	style="top:{topOffset}px; height:calc(100dvh - {topOffset}px);"
	aria-hidden="true"
></canvas>
<div
	class="water-tint"
	style="top:{topOffset}px; height:calc(100dvh - {topOffset}px);"
	aria-hidden="true"
></div>

<style>
.water {
		position: fixed;
		left: 0;
		z-index: -1;
		display: block;
		width: 100vw;
		pointer-events: none;
	}

	.water-tint {
		position: fixed;
		left: 0;
		z-index: -1;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(9, 18, 38, 0.55) 0%,
			rgba(9, 18, 38, 0.18) 32%,
			rgba(10, 30, 26, 0.42) 100%
		);
	}
</style>