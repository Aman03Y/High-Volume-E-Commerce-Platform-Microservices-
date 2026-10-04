import React, { useState } from 'react';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useToast } from './Toast';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export const AdminStatusUpdater = ({ order, onStatusUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status || 'PENDING');
  const [isUpdating, setIsUpdating] = useState(false);
  const { addLog } = useLog();
  const { addToast } = useToast();

  const handleUpdate = async () => {
    if (selectedStatus === order.status) return;
    setIsUpdating(true);

    try {
      const payload = {
        ...order,
        status: selectedStatus
      };
      
      const response = await handleApiCall('order-service', 'put', `/api/orders/${order.id}`, payload, addLog);
      
      if (response.success) {
        addToast(`Order #${order.id} status updated to ${selectedStatus}`, 'success');
        if (onStatusUpdated) onStatusUpdated();
      } else {
        addToast('Failed to update status', 'error');
        // revert select
        setSelectedStatus(order.status);
      }
    } catch (error) {
      addToast('Error updating status', 'error');
      setSelectedStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-center justify-center">
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="text-[10px] font-bold text-black uppercase tracking-wider bg-white border border-black px-2 py-1 focus:outline-none"
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {selectedStatus !== order.status && (
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="px-2 py-1 text-[9px] font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition-colors uppercase w-full"
        >
          {isUpdating ? 'Wait...' : 'Save'}
        </button>
      )}
    </div>
  );
};
