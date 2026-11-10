import React from 'react';

const DashboardCard = ({ titulo, valor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{titulo}</h3>
      <p className="text-2xl font-bold text-gray-900">{valor}</p>
    </div>
  );
};

export default DashboardCard;