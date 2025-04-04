<script lang="ts">
	import { page } from '$app/state';
	import LineChart from '$lib/components/LineChart.svelte';
	import axios from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { env } from '$env/dynamic/public';
	import ScatterChart from '$lib/components/ScatterChart.svelte';
	import { runStore } from '$lib';

	let usersLabels = writable<string[]>([]);
	let usersData = writable<Record<string, number[]>>({});
	let httpLabels = writable<string[]>([]);
	let httpData = writable<Record<string, number[]>>({});
	let rpsLabels = writable<string[]>([]);
	let rpsData = writable<Record<string, number[]>>({});
	let testRunsData = writable<Record<string, number[]>>({});
	let testRunsLabels = writable<string[]>([]);
	let durVsRpsData = writable<Record<string, { x: number; y: number }[]>>({});
	function getData() {
		axios
			.get(`${env.PUBLIC_API_URL}/runs/report/${page.params.runId}`)
			.then((res) => {
				const data = res.data;
				if (data?.users) {
					usersData.set(data.users.data);
					usersLabels.set(data.users.labels);
				}
				if (data?.http) {
					httpData.set(data.http.data);
					httpLabels.set(data.http.labels);
				}
				if (data?.rps) {
					rpsData.set(data.rps.data);
					rpsLabels.set(data.rps.labels);
				}
				if (data?.durationVsRps) {
					durVsRpsData.set(data.durationVsRps);
				}
				if (data?.testExecution) {
					testRunsData.set(data.testExecution.data);
					testRunsLabels.set(data.testExecution.labels);
				}
			})
			.catch((err) => {
				console.error('Error fetching data:', err);
			});
	}

	let interval: number;
	async function getRun() {
		await getData();
		interval = setInterval(getData, 2000);
	}

	onMount(async () => {
		console.log('onMount');
		usersData.set({});
		usersLabels.set([]);
		httpData.set({});
		httpLabels.set([]);
		rpsData.set({});
		rpsLabels.set([]);
		getRun();
	});
	onDestroy(() => {
		console.log('onDestroy');
		clearInterval(interval);
	});
</script>

<div class="grid grid-cols-2 gap-4 p-4">
	<div class="col-span-2 flex flex-row gap-4">
		{#if $runStore}
			<div>Run id</div>
			<pre class="text-blue-500">{$runStore.id}</pre>
			<div>Status</div>
			<pre class="text-blue-500">{$runStore.status}</pre>
			<div>
				{$runStore.numberOfUsers} user{$runStore.numberOfUsers > 1 ? 's' : ''}
				{#if $runStore.rampUp > 0}
					with {$runStore.rampUp} ramp up
				{/if}
				for {Math.round($runStore.durationMinutes)} min {Math.round(
					($runStore.durationMinutes * 60) % 60
				)} sec on {$runStore.processes} process{$runStore.processes > 1 ? 'es' : ''}
			</div>
		{/if}
	</div>
	<div class="container h-60">
		<LineChart
			labels={$usersLabels}
			data={$usersData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'Users'
					},
					subtitle: {
						display: true,
						text: 'Users over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						suggestedMax: 10,
						title: {
							display: true,
							text: 'Active users'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container h-60">
		<LineChart
			labels={$httpLabels}
			data={$httpData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'HTTP'
					},
					subtitle: {
						display: true,
						text: 'Request duration over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'seconds'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container col-span-2 h-60">
		<LineChart
			labels={$rpsLabels}
			data={$rpsData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'HTTP RPS'
					},
					subtitle: {
						display: true,
						text: 'HTTP Requests per second over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Requests per second'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container col-span-2 h-60">
		<LineChart
			labels={$testRunsLabels}
			data={$testRunsData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'Test Runs'
					},
					subtitle: {
						display: true,
						text: 'Test runs over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Test runs'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container col-span-2 h-60">
		<ScatterChart
			data={$durVsRpsData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'Duration vs RPS'
					},
					subtitle: {
						display: true,
						text: 'Request duration vs Requests per second',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Duration (seconds)'
						}
					},
					x: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Requests per second'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
</div>
