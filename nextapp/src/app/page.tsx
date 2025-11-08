'use client';

import { useState, useEffect } from 'react';
import IssuesMap from '../lib/IssuesMap';
import type { MapIssue } from '../lib/types';

export default function HomePage() {
  const [issues, setIssues] = useState<MapIssue[]>([]);

  useEffect(() => {
    // Fetch issues from our mock API
    fetch('http://localhost:4000/api/issues')
      .then(res => res.json())
      .then(data => setIssues(data))
      .catch(console.error);
  }, []);

  const handleIssueClick = (issue: MapIssue) => {
    console.log('Clicked issue:', issue);
    // TODO: Show issue details modal/sidebar
  };

  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <IssuesMap 
        issues={issues}
        onIssueClick={handleIssueClick}
      />
    </main>
  );
}
