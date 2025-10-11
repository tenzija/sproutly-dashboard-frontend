// src/shims/emptyAsyncStorage.ts
const storage = {
	getItem: async (key: string) => {
		void key;
		return null as string | null;
	},
	setItem: async (key: string, value: string) => {
		void key;
		void value;
	},
	removeItem: async (key: string) => {
		void key;
	},
	clear: async () => {},
};

export default storage;
export const getItem = storage.getItem;
export const setItem = storage.setItem;
export const removeItem = storage.removeItem;
export const clear = storage.clear;
