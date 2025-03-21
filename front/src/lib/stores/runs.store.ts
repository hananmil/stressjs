import axios from 'axios';
import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

function createRunsStore() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { subscribe, set } = writable<any[]>([]);

	async function load(testId: string) {
		if (!browser) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await axios.get<any[]>(`${PUBLIC_API_URL}/runs/${testId}`);
		set(
			result.data
				.filter((r) => r)
				.map((run) => {
					if (!run) {
						console.error('Run not found');
						return;
					}
					if (run.endTime) run.endTime = new Date(run.endTime);
					if (run.startTime) run.startTime = new Date(run.startTime);
					if (run.lastUpdated) run.lastUpdated = new Date(run.lastUpdated);
					return run;
				})
				.sort((a, b) => (a.startTime > b.startTime ? -1 : 1))
		);
	}

	return {
		subscribe,
		load: async (testId: string) => {
			await load(testId);
		},
		clear: () => set([]),
		start: async (testId: string, duration: number, users: number, rampUp: number) => {
			await axios.post(`${PUBLIC_API_URL}/runs`, {
				durationMinutes: duration,
				users,
				rampUpMinutes: rampUp,
				testId
			});
		},
		stop: async (runId: string) => {
			await axios.post(`${PUBLIC_API_URL}/runs/${runId}/stop`);
		},
		delete: async (runId: string) => {
			await axios.delete(`${PUBLIC_API_URL}/runs/${runId}`);
		}
	};
}

export const runsStore = createRunsStore();
