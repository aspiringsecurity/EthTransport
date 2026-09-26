import React from "react";

const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <div className="text-gray-400 mb-2">
        {icon}
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
