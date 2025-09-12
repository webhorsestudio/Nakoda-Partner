import React, { memo } from 'react';
import NewTaskTab from './NewTaskTab';

// Wrapper component that prevents NewTaskTab from re-rendering
// when parent component re-renders due to usePartnerAuth state changes
function NewTaskTabWrapper() {
  return <NewTaskTab />;
}

// Memoize the wrapper to prevent unnecessary re-renders
export default memo(NewTaskTabWrapper);
