# Direct Approach for Running the AI Model Generator

If you're experiencing issues with the standard setup, you can use this direct approach which simplifies the integration with the Replicate API.

## Setup Instructions

1. Edit the file `server/direct-run.js` and replace the API token:

   Find this line:
   ```javascript
   const API_TOKEN = 'your_replicate_api_token_here';
   ```
   
   Replace it with your actual Replicate API token:
   ```javascript
   const API_TOKEN = 'REPLACE_WITH_YOUR_API_TOKEN';
   ```

2. Run the application with the direct approach:
   ```
   npm run start:direct
   ```

This will start both the frontend and a simplified backend server that directly communicates with the Replicate API using your token.

## How It Works

The direct approach:
1. Uses a hard-coded API token in the server code
2. Simplifies the server implementation to focus only on the essential functionality
3. Removes the need for environment variables and token management
4. Provides a more direct path to the Replicate API

## Troubleshooting

If you still encounter issues:

1. Make sure your Replicate API token is valid and has not expired
2. Check that you have sufficient credits in your Replicate account
3. Ensure you're using the correct model version (`firtoz/trellis:4876f2a8da1c544772dffa32e8889da4a1bab3a1f5c1937bfcfccb99ae347251`)
4. Try running the example from `/Users/reneturcios/Desktop/replicate_major/my-replicate-app` to verify your token works

## Security Note

This approach hard-codes your API token in the source code, which is not recommended for production use. This is only intended as a temporary solution for testing and development. 