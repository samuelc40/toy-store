import React from 'react';
import { Receipt, Eye } from 'lucide-react';

function AdminOrders() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>Manage Orders</h3>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Track shipment states and process customer transactions.</p>
      </div>

      <div className="responsive-table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>STATUS</th>
              <th>TOTAL</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="ORDER ID" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>#TV-9021</td>
              <td data-label="CUSTOMER" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', textAlign: 'inherit' }}>Alex Miller</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>alex.m@gmail.com</span>
              </td>
              <td data-label="STATUS">
                <span style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block' }}>Processing</span>
              </td>
              <td data-label="TOTAL" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>$134.99</td>
              <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', padding: 0 }}>
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
            <tr>
              <td data-label="ORDER ID" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>#TV-8812</td>
              <td data-label="CUSTOMER" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', textAlign: 'inherit' }}>Sarah Jenkins</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>s.jenkins@hotmail.com</span>
              </td>
              <td data-label="STATUS">
                <span style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block' }}>Shipped</span>
              </td>
              <td data-label="TOTAL" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>$45.00</td>
              <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', padding: 0 }}>
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
