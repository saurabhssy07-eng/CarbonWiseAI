import React from 'react';
import { renderToString } from 'react-dom/server';
import Challenges from './src/pages/Challenges.jsx';
import { MemoryRouter } from 'react-router-dom';

try {
  const html = renderToString(
    <MemoryRouter>
      <Challenges />
    </MemoryRouter>
  );
  console.log("RENDERED OK!");
} catch (e) {
  console.error("CRASH:", e);
}
