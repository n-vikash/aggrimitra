PROMPT USED:

  Build a full-stack agriculture chatbot called AgriMitra for Indian farmers using React, Vite, Tailwind CSS, FastAPI,     Python, SQLite, and the Groq API.
  
  I want the application to have a clean, modern design with a green and cream color theme. Include a home page, AI chat, plant disease detection, crop recommendations, weather information, government schemes, and an about page. The interface should be responsive and work properly on both desktop and mobile.
  
  The chat should support English, Hindi, and Telugu. Users should be able to ask farming-related questions, receive useful answers, start new conversations, view recent chats, reopen previous conversations, and clear the current conversation. Store conversation history in SQLite.
  
  For plant disease detection, allow users to upload crop or leaf images and analyze them using a suitable vision-capable AI model. For crop recommendations, collect the farmer's state, district, season, soil type, water availability, and optional soil test results before generating recommendations. The weather page should use a real weather API when configured, and the government schemes page should provide official links with reliable information.
  
  Please clearly define all the required API endpoints, including what each endpoint does, the request parameters or body, the response format, and possible error responses. Make sure the frontend and backend communicate correctly and handle loading states, validation, and API failures.
  
  Also, clearly define the responsibilities of each AI model. Specify which model handles normal conversations, crop recommendations, and plant disease image analysis. Use models that support the required tasks, keep model names configurable, and handle API errors and rate limits properly. Do not use a text-only model for image analysis.
  
  Define the authentication and user identity requirements as well. Decide whether the application should work without registration or require user accounts. If authentication is not necessary for the initial version, use a suitable session or conversation identifier to manage chat history. Make sure users cannot access other users' private conversations and explain how the approach can be extended to support authentication in the future.
  
  For the UI, keep the navbar fixed at the top and the sidebar fixed on the left. The sidebar and main content should scroll independently. On mobile, provide a working hamburger menu and make sure the layout does not overflow the screen. Use consistent spacing, readable typography, appropriate icons, loading indicators, error messages, and helpful empty states.
  
  Keep the project organized into separate frontend and backend folders. Use environment variables for configuration and keep the Groq API key strictly on the backend. Include a `.env.example` containing placeholders only, and make sure `.env`, virtual environments, `node_modules`, local databases, and generated build files are excluded from Git.
  
  Prepare the project for deployment using GitHub, Vercel for the frontend, and Render for the backend. Configure the frontend API URL through `VITE_API_URL`, configure backend secrets through deployment environment variables, and ensure the production application does not depend on localhost URLs. Include a README with installation, configuration, API documentation, testing, and deployment instructions.

Before completing the project, test all pages and API endpoints, verify conversation creation and retrieval, test image upload validation, check the responsive layout, and fix any errors. Do not leave essential features as placeholders or return fake data when a real API integration is required. If a feature needs an external API key, clearly explain how to configure it and provide an appropriate fallback when it is unavailable.

Keep the implementation straightforward, secure, maintainable, and suitable for a student project that can be demonstrated as a working application.
