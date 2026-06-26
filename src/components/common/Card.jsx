import React from 'react';
import { motion } from 'framer-motion';

function Card({ title, children, className = '', headerRight = null }) {
  return (
    <motion.div
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </motion.div>
  );
}

export default Card;
