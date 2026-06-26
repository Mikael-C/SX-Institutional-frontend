import React from 'react';

function ChainBadge({ chain }) {
  const getChainClass = () => {
    const name = (chain || '').toLowerCase();
    if (name.includes('hoodi')) return 'badge badge-hoodi';
    if (name.includes('base')) return 'badge badge-base-sepolia';
    return 'badge badge-info';
  };

  const getChainLabel = () => {
    const name = (chain || '').toLowerCase();
    if (name.includes('hoodi')) return 'Hoodi';
    if (name.includes('base')) return 'Base Sepolia';
    return chain || 'Unknown';
  };

  return <span className={getChainClass()}>{getChainLabel()}</span>;
}

export default ChainBadge;
