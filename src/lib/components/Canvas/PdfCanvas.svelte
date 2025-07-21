<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { appState, setPdfFile, setLoading, addCamera, addInfrastructure, selectCamera, selectInfrastructure, cameraModels, updateCamera, updateTransform } from '$lib/stores/app.js';
	import { loadPdf, renderPdfPage, drawPdfOnCanvas, type PdfPage } from '$lib/utils/pdf.js';
	import type { Camera, InfrastructureComponent } from '$lib/types.js';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let svgElement: SVGSVGElement;
	let pdfPage: PdfPage | null = null;
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let scaleDrawing = $state(false);
	let scaleLine = $state<{ x1: number; y1: number; x2: number; y2: number; pixelLength: number } | null>(null);
	let tempScaleLine = $state<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

	let { onScaleLineDrawn, onEditCamera, onEditInfrastructure } = $props<{
		onScaleLineDrawn?: (line: { x1: number; y1: number; x2: number; y2: number; pixelLength: number }) => void;
		onEditCamera?: (camera: Camera) => void;
		onEditInfrastructure?: (component: InfrastructureComponent) => void;
	}>();

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

		// Draw temporary scale line
		if (tempScaleLine) {
			ctx.strokeStyle = '#ef4444';
			ctx.lineWidth = 3;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(tempScaleLine.x1, tempScaleLine.y1);
			ctx.lineTo(tempScaleLine.x2, tempScaleLine.y2);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// Draw existing scale reference line
		const scaleRef = project.scale.referenceLine;
		if (scaleRef) {
			ctx.strokeStyle = '#10b981';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(scaleRef.x1, scaleRef.y1);
			ctx.lineTo(scaleRef.x2, scaleRef.y2);
			ctx.stroke();
			
			// Draw endpoints
			ctx.fillStyle = '#10b981';
			ctx.beginPath();
			ctx.arc(scaleRef.x1, scaleRef.y1, 4, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(scaleRef.x2, scaleRef.y2, 4, 0, 2 * Math.PI);
			ctx.fill();
		}

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
		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		const x = (event.clientX - rect.left - transform.panX * transform.zoom) / transform.zoom;
		const y = (event.clientY - rect.top - transform.panY * transform.zoom) / transform.zoom;

		if ($appState.activeTool === 'pan') {
			isDragging = true;
			dragStart = { x: event.clientX, y: event.clientY };
			canvas.style.cursor = 'grabbing';
		} else if ($appState.activeTool === 'scale') {
			scaleDrawing = true;
			tempScaleLine = { x1: x, y1: y, x2: x, y2: y };
		}
	}

	function handleMouseMove(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		const x = (event.clientX - rect.left - transform.panX * transform.zoom) / transform.zoom;
		const y = (event.clientY - rect.top - transform.panY * transform.zoom) / transform.zoom;

		if (isDragging && $appState.activeTool === 'pan') {
			const deltaX = event.clientX - dragStart.x;
			const deltaY = event.clientY - dragStart.y;
			
			project.transform.panX += deltaX / project.transform.zoom;
			project.transform.panY += deltaY / project.transform.zoom;
			
			dragStart = { x: event.clientX, y: event.clientY };
			draw();
		} else if (scaleDrawing && tempScaleLine) {
			tempScaleLine.x2 = x;
			tempScaleLine.y2 = y;
			draw();
		}
	}

	function handleMouseUp() {
		if (scaleDrawing && tempScaleLine) {
			const dx = tempScaleLine.x2 - tempScaleLine.x1;
			const dy = tempScaleLine.y2 - tempScaleLine.y1;
			const pixelLength = Math.sqrt(dx * dx + dy * dy);
			
			if (pixelLength > 10) { // Minimum line length
				const line = {
					x1: tempScaleLine.x1,
					y1: tempScaleLine.y1,
					x2: tempScaleLine.x2,
					y2: tempScaleLine.y2,
					pixelLength
				};
				
				if (onScaleLineDrawn) {
					onScaleLineDrawn(line);
				}
			}
			
			scaleDrawing = false;
			tempScaleLine = null;
		}
		
		isDragging = false;
		canvas.style.cursor = $appState.activeTool === 'pan' ? 'grab' : 
							  $appState.activeTool === 'scale' ? 'crosshair' : 'default';
	}

	function handleDoubleClick(event: MouseEvent) {
		if ($appState.activeTool !== 'select') return;

		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		const x = (event.clientX - rect.left - transform.panX * transform.zoom) / transform.zoom;
		const y = (event.clientY - rect.top - transform.panY * transform.zoom) / transform.zoom;

		// Check for camera double-clicks
		for (const camera of project.cameras) {
			const distance = Math.sqrt((camera.x - x) ** 2 + (camera.y - y) ** 2);
			if (distance < 20) {
				if (onEditCamera) {
					onEditCamera(camera);
				}
				return;
			}
		}

		// Check for infrastructure double-clicks
		for (const component of project.infrastructure) {
			const distance = Math.sqrt((component.x - x) ** 2 + (component.y - y) ** 2);
			if (distance < 20) {
				if (onEditInfrastructure) {
					onEditInfrastructure(component);
				}
				return;
			}
		}
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		
		const project = $appState.currentProject;
		if (!project) return;

		const rect = canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		// Convert mouse position to canvas coordinates
		const canvasX = (mouseX - project.transform.panX * project.transform.zoom) / project.transform.zoom;
		const canvasY = (mouseY - project.transform.panY * project.transform.zoom) / project.transform.zoom;

		// Calculate zoom change
		const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
		const newZoom = Math.max(0.1, Math.min(5, project.transform.zoom * zoomFactor));

		// Adjust pan to keep mouse position fixed
		const newPanX = mouseX / newZoom - canvasX;
		const newPanY = mouseY / newZoom - canvasY;

		updateTransform({
			zoom: newZoom,
			panX: newPanX,
			panY: newPanY
		});
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	// Reactive updates
	$effect(() => {
		if (canvas) {
			draw();
		}
	});

	$effect(() => {
		if (canvas) {
			if ($appState.activeTool === 'pan') {
				canvas.style.cursor = 'grab';
			} else if ($appState.activeTool === 'scale') {
				canvas.style.cursor = 'crosshair';
			} else {
				canvas.style.cursor = 'default';
			}
		}
	});

	export { handlePdfUpload };
</script>

<div class="relative w-full h-full">
	<canvas 
		bind:this={canvas}
		class="absolute inset-0 w-full h-full"
		onclick={handleCanvasClick}
		ondblclick={handleDoubleClick}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onwheel={handleWheel}
		ondrop={handleDrop}
		ondragover={handleDragOver}
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