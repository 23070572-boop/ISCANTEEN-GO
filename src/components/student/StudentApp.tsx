import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentHome } from './StudentHome';
import { Step1ChooseSlot } from './Step1ChooseSlot';
import { Step2SelectMenu } from './Step2SelectMenu';
import { CartCheckoutModal } from './CartCheckoutModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { MyOrdersView } from './MyOrdersView';
import { AIAssistantView } from './AIAssistantView';
import { ProfileView } from './ProfileView';
import { Order } from '../../types';

export const StudentApp: React.FC = () => {
  const { studentTab, setStudentTab, selectedSlot } = useApp();

  const [orderStep, setOrderStep] = useState<'slot' | 'menu'>('slot');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justPlacedOrder, setJustPlacedOrder] = useState<Order | null>(null);

  // If tab changes to order and no slot is selected, default to slot step
  React.useEffect(() => {
    if (studentTab === 'order' && !selectedSlot) {
      setOrderStep('slot');
    } else if (studentTab === 'order' && selectedSlot) {
      setOrderStep('menu');
    }
  }, [studentTab, selectedSlot]);

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#faf9f6] flex flex-col">
      {/* Dynamic View rendering based on studentTab */}
      {studentTab === 'home' && <StudentHome />}

      {studentTab === 'order' && (
        <>
          {orderStep === 'slot' || !selectedSlot ? (
            <Step1ChooseSlot onSlotConfirmed={() => setOrderStep('menu')} />
          ) : (
            <Step2SelectMenu
              onChangeSlot={() => setOrderStep('slot')}
              onOpenCart={() => setIsCartOpen(true)}
            />
          )}
        </>
      )}

      {studentTab === 'my-orders' && <MyOrdersView />}

      {studentTab === 'ai' && <AIAssistantView />}

      {studentTab === 'profile' && <ProfileView />}

      {/* Cart & Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(order) => {
          setIsCartOpen(false);
          setJustPlacedOrder(order);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={justPlacedOrder}
        isOpen={!!justPlacedOrder}
        onClose={() => setJustPlacedOrder(null)}
        onViewMyOrders={() => {
          setJustPlacedOrder(null);
          setStudentTab('my-orders');
        }}
      />
    </main>
  );
};
