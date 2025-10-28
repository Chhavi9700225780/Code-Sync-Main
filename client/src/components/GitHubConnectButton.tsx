import React from 'react';
import { useAppContext } from "@/context/AppContext"; // To check connection status

function GitHubConnectButton() {
  const { currentUser } = useAppContext(); // Assuming currentUser gets GitHub details eventually

  // Construct the backend URL for initiating the GitHub OAuth flow
  // Make sure VITE_BACKEND_URL points to your deployed Render backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const githubAuthUrl = `${backendUrl}/api/auth/github`;

  // Conditionally render the button based on whether the user is already connected
  // You might need a more specific check, like `currentUser.githubId`
  const isConnected = !!currentUser?.githubAccessToken; // Example check

  if (isConnected) {
    return (
      <div>
        <p>✅ GitHub Account Connected ({currentUser.username})</p>
        {/* Optional: Add a disconnect button here */}
      </div>
    );
  }

  return (
    <a
      href={githubAuthUrl}
      className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
    >
      Connect GitHub Account
    </a>
  );
}

export default GitHubConnectButton;