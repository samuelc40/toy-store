import React from 'react';
import { ShoppingBag, Plus, Edit, Trash } from 'lucide-react';

function AdminProducts() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2c2a2e', fontSize: '20px', fontWeight: 800 }}>Manage Products</h3>
          <p style={{ margin: '4px 0 0 0', color: '#a09cb0', fontSize: '14px' }}>Add, edit, or delete items in the ToyVault inventory.</p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#8c52ff',
          color: '#ffffff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #6929df',
          transition: 'all 0.1s'
        }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #eaeaef', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#faf9fc', borderBottom: '1px solid #eaeaef' }}>
              <th style={{ padding: '16px 24px', color: '#7b7888', fontWeight: '700', fontSize: '13px' }}>PRODUCT</th>
              <th style={{ padding: '16px 24px', color: '#7b7888', fontWeight: '700', fontSize: '13px' }}>CATEGORY</th>
              <th style={{ padding: '16px 24px', color: '#7b7888', fontWeight: '700', fontSize: '13px' }}>PRICE</th>
              <th style={{ padding: '16px 24px', color: '#7b7888', fontWeight: '700', fontSize: '13px' }}>STOCK</th>
              <th style={{ padding: '16px 24px', color: '#7b7888', fontWeight: '700', fontSize: '13px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eaeaef' }}>
              <td style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f3e8ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContext: 'center', color: '#8c52ff' }}>
                  <ShoppingBag size={20} style={{ margin: 'auto' }} />
                </div>
                <span style={{ fontWeight: '700', color: '#2c2a2e' }}>RC Off-Road Monster Truck</span>
              </td>
              <td style={{ padding: '20px 24px', color: '#7b7888' }}>RC Cars</td>
              <td style={{ padding: '20px 24px', fontWeight: '700', color: '#2c2a2e' }}>$89.99</td>
              <td style={{ padding: '20px 24px', color: '#16a34a', fontWeight: '700' }}>42 In Stock</td>
              <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: '#8c52ff', marginRight: '12px', cursor: 'pointer' }}><Edit size={16} /></button>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash size={16} /></button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContext: 'center', color: '#0284c7' }}>
                  <ShoppingBag size={20} style={{ margin: 'auto' }} />
                </div>
                <span style={{ fontWeight: '700', color: '#2c2a2e' }}>Diecast 1969 Chevy Camaro</span>
              </td>
              <td style={{ padding: '20px 24px', color: '#7b7888' }}>Diecast</td>
              <td style={{ padding: '20px 24px', fontWeight: '700', color: '#2c2a2e' }}>$45.00</td>
              <td style={{ padding: '20px 24px', color: '#ff9900', fontWeight: '700' }}>5 Low Stock</td>
              <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: '#8c52ff', marginRight: '12px', cursor: 'pointer' }}><Edit size={16} /></button>
                <button style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash size={16} /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
