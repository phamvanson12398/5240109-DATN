import React from 'react';
import '@/features/checkout/styles/CheckoutPath.css';
import { AccountBalance, LibraryAddCheck, LocalShipping } from '@mui/icons-material';

/**
 * CheckoutPath — Stepper thanh trạng thái thanh toán (Shipping → Confirm → Payment).
 * @param {number} activePath - 0: Shipping, 1: OrderConfirm, 2: Payment
 */
function CheckoutPath({ activePath }) {
  const steps = [
    { label: 'Thông tin giao hàng', icon: <LocalShipping /> },
    { label: 'Xác nhận đơn',        icon: <LibraryAddCheck /> },
    { label: 'Thanh toán',           icon: <AccountBalance /> },
  ];

  return (
    <div className="checkoutPath">
      {steps.map((step, index) => (
        <div
          className="checkoutPath-step"
          key={index}
          active={activePath === index ? 'true' : 'false'}
          completed={activePath >= index ? 'true' : 'false'}
        >
          <p className="checkoutPath-icon">{step.icon}</p>
          <p className="checkoutPath-label">{step.label}</p>
        </div>
      ))}
    </div>
  );
}

export default CheckoutPath;
