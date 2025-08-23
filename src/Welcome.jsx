import React, { useState } from 'react';

export default function Welcome({ suggestion, onPromptClick }) {
  const welcomeTexts = [
    "How can I help you today?",
    "What would you like to explore?",
    "Ready to assist with your questions",
    "Let's solve problems together",
    "What's on your mind?"
  ];

  // Pick a random text on component mount (page refresh)
  const [randomText] = useState(() => {
    return welcomeTexts[Math.floor(Math.random() * welcomeTexts.length)];
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in px-4">
      {/* Random welcome message on refresh */}
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-medium mb-4 text-foreground">
          {randomText}
        </h1>
      </div>
    </div>
  );
}