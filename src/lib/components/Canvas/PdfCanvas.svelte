<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { appState, setPdfFile, setLoading, addCamera, addInfrastructure, selectCamera, selectInfrastructure, cameraModels, updateCamera } from '$lib/stores/app.js';
	import { loadPdf, renderPdfPage, drawPdfOnCanvas, type PdfPage } from '$lib/utils/pdf.js';
	import type { Camera, InfrastructureComponent } from '$lib/types.js';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let svgElement: SVGSVGElement;
	let pdfPage: PdfPage | null = null;
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };

	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d')!;
			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);
		}

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	});

	function resizeCanvas() {
		if (!canvas) return;
		
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		
		draw();
	}

	function draw() {
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		
		ctx.save();
		ctx.scale(transform.zoom, transform.zoom);
		ctx.translate(transform.panX, transform.panY);

		// Draw PDF background
		if (pdfPage) {
			drawPdfOnCanvas(ctx, pdfPage, 0, 0);
		}

		// Draw cameras
		project.cameras.forEach(camera => {
			drawCamera(ctx, camera);
		});

		// Draw infrastructure
		project.infrastructure.forEach(component => {
			drawInfrastructure(ctx, component);
		});

		ctx.restore();
	}

	function drawCamera(ctx: CanvasRenderingContext2D, camera: Camera) {
		const model = $cameraModels.find(m => m.id === camera.modelId);
		if (!model) return;

		const isSelected = $appState.selectedCameraId === camera.id;
		
		ctx.save();
		ctx.translate(camera.x, camera.y);
		ctx.rotate((camera.rotation * Math.PI) / 180);
		
		// Draw camera icon
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		
		if (isSelected) {
			ctx.shadowColor = 'red';
			ctx.shadowBlur = 10;
		}
		
		ctx.fillText(model.emoji, 0, 0);
		
		ctx.restore();
	}

	function drawInfrastructure(ctx: CanvasRenderingContext2D, component: InfrastructureComponent) {
		const isSelected = $appState.selectedInfrastructureId === component.id;
		
		ctx.save();
		ctx.translate(component.x, component.y);
		
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		
		if (isSelected) {
			ctx.shadowColor = 'blue';
			ctx.shadowBlur = 10;
		}
		
		ctx.fillText(component.emoji, 0, 0);
		
		ctx.restore();
	}

	async function handlePdfUpload(file: File) {
		if (!browser || !file || file.type !== 'application/pdf') return;

		setLoading(true);
		
		try {
			const pdf = await loadPdf(file);
			const page = await pdf.getPage(1); // First page
			const renderedPage = await renderPdfPage(page, 1.5);
			
			pdfPage = renderedPage;
			setPdfFile(file, URL.createObjectURL(file));
			
			draw();
		} catch (error) {
			console.error('Error loading PDF:', error);
		} finally {
			setLoading(false);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		
		const data = event.dataTransfer?.getData('application/json');
		if (!data) return;

		const { type, data: itemData } = JSON.parse(data);
		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		const x = (event.clientX - rect.left - transform.panX * transform.zoom) / transform.zoom;
		const y = (event.clientY - rect.top - transform.panY * transform.zoom) / transform.zoom;

		if (type === 'camera') {
			const camera: Camera = {
				id: crypto.randomUUID(),
				modelId: itemData.id,
				x,
				y,
				rotation: 0
			};
			addCamera(camera);
		} else if (type === 'infrastructure') {
			const component: InfrastructureComponent = {
				id: crypto.randomUUID(),
				type: itemData.type,
				name: itemData.name,
				x,
				y,
				price: itemData.price,
				emoji: itemData.emoji
			};
			addInfrastructure(component);
		}
	}

	function handleCanvasClick(event: MouseEvent) {
		if ($appState.activeTool !== 'select') return;

		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		const x = (event.clientX - rect.left - transform.panX * transform.zoom) / transform.zoom;
		const y = (event.clientY - rect.top - transform.panY * transform.zoom) / transform.zoom;

		// Check for camera clicks
		let clickedCamera: Camera | undefined;
		for (const camera of project.cameras) {
			const distance = Math.sqrt((camera.x - x) ** 2 + (camera.y - y) ** 2);
			if (distance < 20) {
				clickedCamera = camera;
				break;
			}
		}

		if (clickedCamera) {
			selectCamera(clickedCamera.id);
			return;
		}

		// Check for infrastructure clicks
		let clickedInfrastructure: InfrastructureComponent | undefined;
		for (const component of project.infrastructure) {
			const distance = Math.sqrt((component.x - x) ** 2 + (component.y - y) ** 2);
			if (distance < 20) {
				clickedInfrastructure = component;
				break;
			}
		}

		if (clickedInfrastructure) {
			selectInfrastructure(clickedInfrastructure.id);
			return;
		}

		// Clear selection
		selectCamera(undefined);
		selectInfrastructure(undefined);
	}

	function handleMouseDown(event: MouseEvent) {
		if ($appState.activeTool === 'pan') {
			isDragging = true;
			dragStart = { x: event.clientX, y: event.clientY };
			canvas.style.cursor = 'grabbing';
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isDragging && $appState.activeTool === 'pan') {
			const project = $appState.currentProject;
			if (!project) return;

			const deltaX = event.clientX - dragStart.x;
			const deltaY = event.clientY - dragStart.y;
			
			project.transform.panX += deltaX / project.transform.zoom;
			project.transform.panY += deltaY / project.transform.zoom;
			
			dragStart = { x: event.clientX, y: event.clientY };
			draw();
		}
	}

	function handleMouseUp() {
		isDragging = false;
		canvas.style.cursor = $appState.activeTool === 'pan' ? 'grab' : 'default';
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	// Reactive updates
	$: if (canvas) {
		draw();
	}

	$: if (canvas && $appState.activeTool === 'pan') {
		canvas.style.cursor = 'grab';
	} else if (canvas) {
		canvas.style.cursor = 'default';
	}

	export { handlePdfUpload };
</script>

<div class="relative w-full h-full">
	<canvas 
		bind:this={canvas}
		class="absolute inset-0 w-full h-full"
		on:click={handleCanvasClick}
		on:mousedown={handleMouseDown}
		on:mousemove={handleMouseMove}
		on:mouseup={handleMouseUp}
		on:drop={handleDrop}
		on:dragover={handleDragOver}
	></canvas>
	
	<svg 
		bind:this={svgElement}
		class="absolute inset-0 w-full h-full pointer-events-none"
	>
		{#if $appState.currentProject}
			{#each $appState.currentProject.cameras as camera (camera.id)}
				{@const model = $cameraModels.find(m => m.id === camera.modelId)}
				{#if model}
					{@const isSelected = $appState.selectedCameraId === camera.id}
					{@const transform = $appState.currentProject.transform}
					{@const fov = camera.fovOverride || model.fovAngle}
					{@const range = camera.rangeOverride || model.range}
					{@const startAngle = camera.rotation - fov / 2}
					{@const endAngle = camera.rotation + fov / 2}
					{@const x = camera.x * transform.zoom + transform.panX * transform.zoom}
					{@const y = camera.y * transform.zoom + transform.panY * transform.zoom}
					{@const scaledRange = range * transform.zoom}
					
					<path
						d="M {x} {y} 
						   L {x + Math.cos((startAngle * Math.PI) / 180) * scaledRange} {y + Math.sin((startAngle * Math.PI) / 180) * scaledRange}
						   A {scaledRange} {scaledRange} 0 0 1 {x + Math.cos((endAngle * Math.PI) / 180) * scaledRange} {y + Math.sin((endAngle * Math.PI) / 180) * scaledRange}
						   Z"
						class="camera-fov {isSelected ? 'selected' : ''}"
					/>
				{/if}
			{/each}
		{/if}
	</svg>
</div>