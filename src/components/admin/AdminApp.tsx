import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { AdminDashboard } from './AdminDashboard';
import { KitchenDisplayView } from './KitchenDisplayView';
import { PickupCounterView } from './PickupCounterView';
import { OrdersManagementView } from './OrdersManagementView';
import { RefundsManagementView } from './RefundsManagementView';
import { MenuManagementView } from './MenuManagementView';
import { SlotConfigView } from './SlotConfigView';
import { StudentsManagementView } from './StudentsManagementView';
import { RevenueReportsView } from './RevenueReportsView';
import { RevenueSimulatorView } from './RevenueSimulatorView';

export const AdminApp: React.FC = () => {
  const { adminTab } = useApp();

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-[#faf9f6] flex flex-col">
      <AdminNav />

      <main className="flex-1">
        {adminTab === 'dashboard' && <AdminDashboard />}
        {adminTab === 'kitchen' && <KitchenDisplayView />}
        {adminTab === 'pickup' && <PickupCounterView />}
        {adminTab === 'orders' && <OrdersManagementView />}
        {adminTab === 'refunds' && <RefundsManagementView />}
        {adminTab === 'menu' && <MenuManagementView />}
        {adminTab === 'slots' && <SlotConfigView />}
        {adminTab === 'students' && <StudentsManagementView />}
        {adminTab === 'revenue' && <RevenueReportsView />}
        {adminTab === 'simulator' && <RevenueSimulatorView />}
      </main>
    </div>
  );
};
