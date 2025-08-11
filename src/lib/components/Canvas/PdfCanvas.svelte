<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
import { appState, setPdfFile, setLoading, addCamera, addInfrastructure, selectCamera, selectInfrastructure, cameraModels, updateCamera, updateInfrastructure, updateTransform, setDrawnScaleLine } from '$lib/stores/app.js';
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
	let draggingItem = $state<{ type: 'camera' | 'infrastructure', id: string, startX: number, startY: number } | null>(null);
	let wasDragging = false;

	let { onEditCamera, onEditInfrastructure } = $props<{
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

		// Draw temporary scale line with enhanced visibility
		if (tempScaleLine) {
			// Draw background line for better visibility
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(tempScaleLine.x1, tempScaleLine.y1);
			ctx.lineTo(tempScaleLine.x2, tempScaleLine.y2);
			ctx.stroke();
			
			// Draw main line
			ctx.strokeStyle = '#ef4444';
			ctx.lineWidth = 3;
			ctx.setLineDash([8, 4]);
			ctx.beginPath();
			ctx.moveTo(tempScaleLine.x1, tempScaleLine.y1);
			ctx.lineTo(tempScaleLine.x2, tempScaleLine.y2);
			ctx.stroke();
			ctx.setLineDash([]);
			
			// Draw endpoints
			ctx.fillStyle = '#ef4444';
			ctx.beginPath();
			ctx.arc(tempScaleLine.x1, tempScaleLine.y1, 5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(tempScaleLine.x2, tempScaleLine.y2, 5, 0, 2 * Math.PI);
			ctx.fill();
			
			// Draw measurement text
			const dx = tempScaleLine.x2 - tempScaleLine.x1;
			const dy = tempScaleLine.y2 - tempScaleLine.y1;
			const length = Math.sqrt(dx * dx + dy * dy);
			const midX = (tempScaleLine.x1 + tempScaleLine.x2) / 2;
			const midY = (tempScaleLine.y1 + tempScaleLine.y2) / 2;
			
			ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
			ctx.fillRect(midX - 30, midY - 15, 60, 20);
			ctx.fillStyle = 'white';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(`${length.toFixed(0)}px`, midX, midY);
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
		
		// Draw selection highlight
		if (isSelected) {
			ctx.shadowColor = model.color;
			ctx.shadowBlur = 15;
		}
		
		// Draw camera background circle
		ctx.fillStyle = model.color;
		ctx.globalAlpha = 0.2;
		ctx.beginPath();
		ctx.arc(0, 0, 16, 0, 2 * Math.PI);
		ctx.fill();
		ctx.globalAlpha = 1;
		
		// Draw camera border
		ctx.strokeStyle = model.color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, 16, 0, 2 * Math.PI);
		ctx.stroke();
		
		// Draw camera icon/emoji
		ctx.font = '20px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = model.color;
		ctx.fillText(model.emoji, 0, 0);
		
		// Draw rotation indicator
		ctx.rotate((camera.rotation * Math.PI) / 180);
		ctx.strokeStyle = model.color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(20, 0);
		ctx.stroke();
		
		// Draw arrow head
		ctx.beginPath();
		ctx.moveTo(15, -3);
		ctx.lineTo(20, 0);
		ctx.lineTo(15, 3);
		ctx.stroke();
		
		// Reset rotation for text
		ctx.rotate(-(camera.rotation * Math.PI) / 180);
		
		// Draw camera model name text overlay
		ctx.font = '10px Arial';
		ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		ctx.fillRect(-30, 25, 60, 14);
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(model.name.substring(0, 12), 0, 32);
		
		ctx.restore();
	}

	function drawInfrastructure(ctx: CanvasRenderingContext2D, component: InfrastructureComponent) {
		const isSelected = $appState.selectedInfrastructureId === component.id;
		
		ctx.save();
		ctx.translate(component.x, component.y);
		
		// Draw selection highlight
		if (isSelected) {
			ctx.shadowColor = '#6366f1'; // Indigo color for infrastructure
			ctx.shadowBlur = 15;
		}
		
		// Draw infrastructure background circle
		ctx.fillStyle = '#6366f1'; // Indigo color for infrastructure
		ctx.globalAlpha = 0.15;
		ctx.beginPath();
		ctx.arc(0, 0, 20, 0, 2 * Math.PI);
		ctx.fill();
		ctx.globalAlpha = 1;
		
		// Draw infrastructure border
		ctx.strokeStyle = '#6366f1';
		ctx.lineWidth = isSelected ? 3 : 2;
		ctx.beginPath();
		ctx.arc(0, 0, 20, 0, 2 * Math.PI);
		ctx.stroke();
		
		// Draw infrastructure emoji/icon
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#6366f1';
		ctx.fillText(component.emoji, 0, 0);
		
		// Draw component name label for selected items
		if (isSelected) {
			ctx.font = '10px Arial';
			ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
			ctx.fillRect(-25, 25, 50, 16);
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(component.name.substring(0, 12), 0, 33);
		}
		
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
		// Correct coordinate transformation for accurate placement
		const x = (event.clientX - rect.left) / transform.zoom - transform.panX;
		const y = (event.clientY - rect.top) / transform.zoom - transform.panY;

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
				emoji: itemData.emoji
			};
			addInfrastructure(component);
		}
	}

	function handleCanvasClick(event: MouseEvent) {
		if ($appState.activeTool !== 'select') return;

		// Don't process clicks if we just finished dragging
		if (wasDragging) {
			wasDragging = false;
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		// Correct coordinate transformation for accurate placement
		const x = (event.clientX - rect.left) / transform.zoom - transform.panX;
		const y = (event.clientY - rect.top) / transform.zoom - transform.panY;

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
		// Correct coordinate transformation for accurate placement
		const x = (event.clientX - rect.left) / transform.zoom - transform.panX;
		const y = (event.clientY - rect.top) / transform.zoom - transform.panY;

		// Right click for panning (regardless of active tool)
		if (event.button === 2) {
			isDragging = true;
			dragStart = { x: event.clientX, y: event.clientY };
			canvas.style.cursor = 'grabbing';
			return;
		}

		// Left click behavior based on active tool
		if (event.button === 0) {
			if ($appState.activeTool === 'select') {
				// Check if clicking on an existing camera for dragging
				for (const camera of project.cameras) {
					const distance = Math.sqrt((camera.x - x) ** 2 + (camera.y - y) ** 2);
					if (distance < 20) {
						draggingItem = { type: 'camera', id: camera.id, startX: camera.x, startY: camera.y };
						selectCamera(camera.id);
						canvas.style.cursor = 'grabbing';
						return;
					}
				}

				// Check if clicking on an existing infrastructure for dragging
				for (const component of project.infrastructure) {
					const distance = Math.sqrt((component.x - x) ** 2 + (component.y - y) ** 2);
					if (distance < 20) {
						draggingItem = { type: 'infrastructure', id: component.id, startX: component.x, startY: component.y };
						selectInfrastructure(component.id);
						canvas.style.cursor = 'grabbing';
						return;
					}
				}
			} else if ($appState.activeTool === 'pan') {
				isDragging = true;
				dragStart = { x: event.clientX, y: event.clientY };
				canvas.style.cursor = 'grabbing';
			} else if ($appState.activeTool === 'scale') {
				scaleDrawing = true;
				tempScaleLine = { x1: x, y1: y, x2: x, y2: y };
			}
		}
	}

	function handleMouseMove(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const project = $appState.currentProject;
		if (!project) return;

		const { transform } = project;
		// Correct coordinate transformation for accurate placement
		const x = (event.clientX - rect.left) / transform.zoom - transform.panX;
		const y = (event.clientY - rect.top) / transform.zoom - transform.panY;

		if (draggingItem) {
			// Update position of dragged item
			if (draggingItem.type === 'camera') {
				updateCamera(draggingItem.id, { x, y });
			} else if (draggingItem.type === 'infrastructure') {
				updateInfrastructure(draggingItem.id, { x, y });
			}
			draw();
		} else if ($appState.activeTool === 'select') {
			// Update cursor based on hover state
			let hoveringOverItem = false;
			for (const camera of project.cameras) {
				const distance = Math.sqrt((camera.x - x) ** 2 + (camera.y - y) ** 2);
				if (distance < 20) {
					hoveringOverItem = true;
					break;
				}
			}
			if (!hoveringOverItem) {
				for (const component of project.infrastructure) {
					const distance = Math.sqrt((component.x - x) ** 2 + (component.y - y) ** 2);
					if (distance < 20) {
						hoveringOverItem = true;
						break;
					}
				}
			}
			canvas.style.cursor = hoveringOverItem ? 'grab' : 'default';
		} else if (isDragging) {
			// Handle panning (can be triggered by right-click or pan tool + left-click)
			const deltaX = event.clientX - dragStart.x;
			const deltaY = event.clientY - dragStart.y;
			
			// Use store function for proper reactivity
			updateTransform({
				panX: project.transform.panX + deltaX / project.transform.zoom,
				panY: project.transform.panY + deltaY / project.transform.zoom
			});
			
			dragStart = { x: event.clientX, y: event.clientY };
		} else if (scaleDrawing && tempScaleLine) {
			tempScaleLine.x2 = x;
			tempScaleLine.y2 = y;
			draw();
		}
	}

	function handleMouseUp() {
		if (draggingItem) {
			// End dragging operation
			wasDragging = true;
			draggingItem = null;
			canvas.style.cursor = 'default';
		} else if (scaleDrawing && tempScaleLine) {
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
				
				setDrawnScaleLine(line);
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
		// Correct coordinate transformation for accurate placement
		const x = (event.clientX - rect.left) / transform.zoom - transform.panX;
		const y = (event.clientY - rect.top) / transform.zoom - transform.panY;

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

	function handleContextMenu(event: MouseEvent) {
		// Prevent right-click context menu
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

	export function getCanvasElements() {
		return {
			canvas,
			svgElement
		};
	}

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
		oncontextmenu={handleContextMenu}
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
					{@const range = (camera.rangeOverride || model.range) * $appState.currentProject.scale.pixelsPerFoot}
					{@const coneSize = camera.coneSize || 0.3}
					{@const startAngle = camera.rotation - fov / 2}
					{@const endAngle = camera.rotation + fov / 2}
					{@const x = camera.x * transform.zoom + transform.panX * transform.zoom}
					{@const y = camera.y * transform.zoom + transform.panY * transform.zoom}
					{@const scaledRange = range * transform.zoom * coneSize}
					
					<path
						d="M {x} {y} 
						   L {x + Math.cos((startAngle * Math.PI) / 180) * scaledRange} {y + Math.sin((startAngle * Math.PI) / 180) * scaledRange}
						   A {scaledRange} {scaledRange} 0 0 1 {x + Math.cos((endAngle * Math.PI) / 180) * scaledRange} {y + Math.sin((endAngle * Math.PI) / 180) * scaledRange}
						   Z"
						fill={model.color}
						stroke={model.color}
						class="camera-fov {isSelected ? 'selected' : ''}"
					/>
				{/if}
			{/each}
		{/if}
	</svg>
</div>