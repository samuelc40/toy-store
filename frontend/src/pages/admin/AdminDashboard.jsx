import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, Receipt } from 'lucide-react';

function AdminDashboard() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', padding: '12px', borderRadius: '12px', display: 'flex' }}><LayoutDashboard size={24} /></div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Total Revenue</h4>
            <h2 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800 }}>$12,450.00</h2>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '12px', borderRadius: '12px', display: 'flex' }}><ShoppingBag size={24} /></div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Products</h4>
            <h2 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800 }}>142</h2>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)', padding: '12px', borderRadius: '12px', display: 'flex' }}><Receipt size={24} /></div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Active Orders</h4>
            <h2 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800 }}>38</h2>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', padding: '12px', borderRadius: '12px', display: 'flex' }}><Users size={24} /></div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Users</h4>
            <h2 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800 }}>1,204</h2>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>Dashboard Overview</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Store metrics, active carts, and transaction graphs will render here. Everything is ready for frontend admin metrics integration.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
