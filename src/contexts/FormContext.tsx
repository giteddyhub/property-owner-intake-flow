
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FormContextType, FormState, Owner, Property, OwnerPropertyAssignment } from '@/types/form';

const initialState: FormState = {
  owners: [],
  properties: [],
  assignments: [],
  currentStep: 0
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<FormState>(initialState);

  const addOwner = (owner: Owner) => {
    const newOwner = { ...owner, id: uuidv4() };
    setState(prev => ({
      ...prev,
      owners: [...prev.owners, newOwner]
    }));
  };

  const updateOwner = (index: number, owner: Owner) => {
    setState(prev => {
      const newOwners = [...prev.owners];
      newOwners[index] = owner;
      return { ...prev, owners: newOwners };
    });
  };

  const removeOwner = (index: number) => {
    setState(prev => {
      const newOwners = [...prev.owners];
      newOwners.splice(index, 1);
      
      // Remove assignments for this owner
      const ownerId = prev.owners[index].id;
      const newAssignments = prev.assignments.filter(
        assignment => assignment.ownerId !== ownerId
      );
      
      return { 
        ...prev, 
        owners: newOwners,
        assignments: newAssignments
      };
    });
  };

  const addProperty = (property: Property) => {
    const newProperty = { ...property, id: uuidv4() };
    setState(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty]
    }));
  };

  const updateProperty = (index: number, property: Property) => {
    setState(prev => {
      const newProperties = [...prev.properties];
      newProperties[index] = property;
      return { ...prev, properties: newProperties };
    });
  };

  const removeProperty = (index: number) => {
    setState(prev => {
      const newProperties = [...prev.properties];
      const propertyId = prev.properties[index].id;
      newProperties.splice(index, 1);
      
      // Remove assignments for this property
      const newAssignments = prev.assignments.filter(
        assignment => assignment.propertyId !== propertyId
      );
      
      return { 
        ...prev, 
        properties: newProperties,
        assignments: newAssignments
      };
    });
  };

  const addAssignment = (assignment: OwnerPropertyAssignment) => {
    setState(prev => ({
      ...prev,
      assignments: [...prev.assignments, assignment]
    }));
  };

  const updateAssignment = (index: number, assignment: OwnerPropertyAssignment) => {
    setState(prev => {
      const newAssignments = [...prev.assignments];
      newAssignments[index] = assignment;
      return { ...prev, assignments: newAssignments };
    });
  };

  const removeAssignment = (index: number) => {
    setState(prev => {
      const newAssignments = [...prev.assignments];
      newAssignments.splice(index, 1);
      return { ...prev, assignments: newAssignments };
    });
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5)
    }));
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  const goToStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, 5))
    }));
  };

  return (
    <FormContext.Provider
      value={{
        state,
        addOwner,
        updateOwner,
        removeOwner,
        addProperty,
        updateProperty,
        removeProperty,
        addAssignment,
        updateAssignment,
        removeAssignment,
        nextStep,
        prevStep,
        goToStep
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
