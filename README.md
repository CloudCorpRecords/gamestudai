# GameStudAI

GameStudAI is a comprehensive tool for game developers that integrates AI-powered features to streamline the game development process. This application includes an AI 3D model generator that can create 3D models from images using the Trellis AI model.

## Features

- **AI 3D Model Generator**: Generate 3D models from images using the Trellis AI model
- **Settings Management**: Securely store and manage API keys
- **Backend Server**: Handles API requests to Replicate securely

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Replicate API key (get one at [https://replicate.com](https://replicate.com))

## Setup Instructions

### Frontend Setup

1. Clone the repository:
   ```
   git clone https://github.com/CloudCorpRecords/gamestudai.git
   cd gamestudai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install server dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=3001
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```
   Replace `your_replicate_api_token_here` with your actual Replicate API token.

4. Start the backend server:
   ```
   npm run dev
   ```

## Using the AI 3D Model Generator

1. Ensure both frontend and backend servers are running
2. Navigate to the AI Model Generator tab in the application
3. Upload an image (clear subject with simple background works best)
4. Configure the generation parameters
5. Click "Generate 3D Model"
6. Wait for the generation to complete (typically takes 3-5 minutes)
7. Download or view the generated 3D model and preview videos

## Technical Details

- Frontend: React with TypeScript
- Backend: Node.js with Express
- 3D Model Generation: Trellis AI model via Replicate API

## Troubleshooting

- If you encounter CORS issues, ensure both frontend and backend servers are running
- Check that your Replicate API token is correctly set in the server's `.env` file
- For model generation issues, check the browser console for detailed error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details. 