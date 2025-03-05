# GameStudAI Server

This is the backend server for the GameStudAI application. It handles API requests to the Replicate service for generating 3D models from images.

## Setup

1. Make sure you have Node.js installed (v16 or higher)
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in this directory with the following content:
   ```
   PORT=3001
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```
   Replace `your_replicate_api_token_here` with your actual Replicate API token.

## Running the Server

There are several ways to run the server:

### Standard Start
```
npm start
```
This will start the server using the API token in your `.env` file.

### Development Mode
```
npm run dev
```
This will start the server in development mode with nodemon, which will automatically restart the server when you make changes.

### Interactive Start
```
npm run start:with-token
```
This will prompt you to enter your Replicate API token and then start the server. This is useful if you don't want to store your API token in the `.env` file.

## API Endpoints

### Test Endpoint
```
GET /api/test
```
Returns a simple response to confirm the server is running and the API token is configured.

### Run Model Endpoint
```
POST /api/replicate/run
```
Runs the Trellis model to generate a 3D model from an image.

Request body:
```json
{
  "version": "firtoz/trellis:4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251",
  "input": {
    "images": ["data:image/jpeg;base64,..."],
    "texture_size": 1024,
    "mesh_simplify": 0.5,
    "generate_model": true,
    "save_gaussian_ply": true,
    "ss_sampling_steps": 25
  }
}
```

Response:
```json
{
  "output": {
    "model_file": "https://replicate.delivery/pbxt/...",
    "color_video": "https://replicate.delivery/pbxt/...",
    "gaussian_ply": "https://replicate.delivery/pbxt/...",
    "normal_video": "https://replicate.delivery/pbxt/...",
    "combined_video": "https://replicate.delivery/pbxt/..."
  }
}
```

## Troubleshooting

- If you get a "Network Error" when trying to generate a model, make sure the server is running and the API token is correctly configured.
- If you get a "CORS Error", make sure the server is running on port 3001 and the frontend is configured to use `http://localhost:3001` as the API base URL.
- If you get an "API Token Error", make sure your Replicate API token is valid and correctly configured in the `.env` file. 