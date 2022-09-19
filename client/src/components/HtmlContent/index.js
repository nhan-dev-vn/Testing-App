import React from 'react';
import './style.css';

const Component = ({ content, className }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className={`html-content ${className}`}
    />
  );
};

export default Component;
