
# WasmView

WasmView is a tool for analyzing websites that use WebAssembly, featuring a modern web interface and a Node.js/Next.js backend.

## Demo & Source Code

- [Video Demo](https://youtu.be/kjKxL7L7zxI)
- [Source Code on GitHub](https://github.com/wasmview/wasmview.github.io/tree/master/)
- [Paper (IEEE)](https://ieeexplore.ieee.org/document/9270402)

## Requirements

- Node.js (recommended: >=18)

## Local Setup

1. **Install dependencies:**
	```sh
	npm install
	```

2. **(Optional) Edit `config.json`:**
	Change settings like server port, timeout, output folder, etc. Example:
	```json
	{
	  "node_server_port": 4000,
	  "time_to_wait": 30,
	  "output_folder": "./Output",
	  "number_of_screenshots": 5
	}
	```

3. **Build Next.js pages:**
	```sh
	npm run build
	```

4. **Start the server:**
	- For development:
	  ```sh
	  npm run dev
	  ```
	- For production:
	  ```sh
	  npm run prod
	  ```

5. **Open the UI:**
	Go to [http://localhost:4000](http://localhost:4000) (or your configured port) and enter a URL to analyze.


## Project Structure

- `server.js`: Custom Express/Next.js server
- `pages/`: Next.js pages
- `components/`: Reusable React components
- `public/`: Static assets (JS, images, CSS)
- `WebAssemblyAnalysis_Modules/`: Analysis and crawling modules

## Notes

If you encounter issues, check the Next.js documentation or open an issue on GitHub.