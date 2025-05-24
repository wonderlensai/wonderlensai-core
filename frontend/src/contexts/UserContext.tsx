import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface UserContextType {
  age: number | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  age: number | null;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, age }) => {
  return (
    <UserContext.Provider value={{ age }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 