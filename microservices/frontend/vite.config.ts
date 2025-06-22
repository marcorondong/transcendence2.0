import { defineConfig } from "vite";
// @ts-ignore
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
	plugins: [tailwindcss()],
	// build: {
	// 	watch: {
	// 		// https://rollupjs.org/configuration-options/#watch
	// 	},
	// },
	server: {
		host: true, // This sets host to '0.0.0.0' internally
		port: 5173,
		proxy: {
			"/proxy": {
				target: "https://nginx:443",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/proxy/, ""),
				secure: false,
			},
			"/pong-api": {
				target: "https://nginx:443",
				ws: true, // <- Enable WebSocket proxying
				changeOrigin: true,
				secure: false, // <- skip SSL verification for self-signed cert
			},
			"/chat-api": {
				target: "https://nginx:443",
				ws: true, // <- Enable WebSocket proxying
				changeOrigin: true,
				secure: false, // <- skip SSL verification for self-signed cert
			},
		},
	},
});
