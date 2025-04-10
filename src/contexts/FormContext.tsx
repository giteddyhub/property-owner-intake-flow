
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FormContextType, FormState, Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { ownerService } from '@/services/ownerService';
import { propertyService } from '@/services/propertyService';
import { assignmentService } from '@/services/assignmentService';
import { useToast } from '@/hooks/use-toast';

const initialState: FormState = {
  owners: [],
  properties: [],
  assignments: [],
  currentStep: 0
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<FormState>(initialState);
  const { toast } = useToast();

  // Load initial data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load owners
        const owners = await ownerService.listOwners();
        
        // Load properties
        const properties = await propertyService.listProperties();
        
        // Load assignments
        const assignments = await assignmentService.listAssignments();
        
        setState(prev => ({
          ...prev,
          owners,
          properties,
          assignments,
        }));
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load data from the database.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  const addOwner = async (owner: Owner) => {
    try {
      const newOwner = { ...owner, id: uuidv4() };
      const savedOwner = await ownerService.createOwner(newOwner);
      
      if (savedOwner) {
        setState(prev => ({
          ...prev,
          owners: [...prev.owners, savedOwner]
        }));
        
        toast({
          title: "Success",
          description: "Owner added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding owner:", error);
      toast({
        title: "Error",
        description: "Failed to add owner.",
        variant: "destructive",
      });
    }
  };

  const updateOwner = async (index: number, owner: Owner) => {
    try {
      const updatedOwner = await ownerService.updateOwner(owner);
      
      if (updatedOwner) {
        setState(prev => {
          const newOwners = [...prev.owners];
          newOwners[index] = updatedOwner;
          return { ...prev, owners: newOwners };
        });
        
        toast({
          title: "Success",
          description: "Owner updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating owner:", error);
      toast({
        title: "Error",
        description: "Failed to update owner.",
        variant: "destructive",
      });
    }
  };

  const removeOwner = async (index: number) => {
    try {
      const ownerId = state.owners[index].id;
      const success = await ownerService.deleteOwner(ownerId);
      
      if (success) {
        setState(prev => {
          const newOwners = [...prev.owners];
          newOwners.splice(index, 1);
          
          // Remove assignments for this owner
          const newAssignments = prev.assignments.filter(
            assignment => assignment.ownerId !== ownerId
          );
          
          return { 
            ...prev, 
            owners: newOwners,
            assignments: newAssignments
          };
        });
        
        toast({
          title: "Success",
          description: "Owner removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error removing owner:", error);
      toast({
        title: "Error",
        description: "Failed to remove owner.",
        variant: "destructive",
      });
    }
  };

  const addProperty = async (property: Property) => {
    try {
      const newProperty = { ...property, id: uuidv4() };
      const savedProperty = await propertyService.createProperty(newProperty);
      
      if (savedProperty) {
        setState(prev => ({
          ...prev,
          properties: [...prev.properties, savedProperty]
        }));
        
        toast({
          title: "Success",
          description: "Property added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property.",
        variant: "destructive",
      });
    }
  };

  const updateProperty = async (index: number, property: Property) => {
    try {
      const updatedProperty = await propertyService.updateProperty(property);
      
      if (updatedProperty) {
        setState(prev => {
          const newProperties = [...prev.properties];
          newProperties[index] = updatedProperty;
          return { ...prev, properties: newProperties };
        });
        
        toast({
          title: "Success",
          description: "Property updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property.",
        variant: "destructive",
      });
    }
  };

  const removeProperty = async (index: number) => {
    try {
      const propertyId = state.properties[index].id;
      const success = await propertyService.deleteProperty(propertyId);
      
      if (success) {
        setState(prev => {
          const newProperties = [...prev.properties];
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
        
        toast({
          title: "Success",
          description: "Property removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error removing property:", error);
      toast({
        title: "Error",
        description: "Failed to remove property.",
        variant: "destructive",
      });
    }
  };

  const addAssignment = async (assignment: OwnerPropertyAssignment) => {
    try {
      const savedAssignment = await assignmentService.createAssignment(assignment);
      
      if (savedAssignment) {
        setState(prev => ({
          ...prev,
          assignments: [...prev.assignments, savedAssignment]
        }));
        
        toast({
          title: "Success",
          description: "Assignment added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      toast({
        title: "Error",
        description: "Failed to add assignment.",
        variant: "destructive",
      });
    }
  };

  const updateAssignment = async (index: number, assignment: OwnerPropertyAssignment) => {
    try {
      const updatedAssignment = await assignmentService.updateAssignment(assignment);
      
      if (updatedAssignment) {
        setState(prev => {
          const newAssignments = [...prev.assignments];
          newAssignments[index] = updatedAssignment;
          return { ...prev, assignments: newAssignments };
        });
        
        toast({
          title: "Success",
          description: "Assignment updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment.",
        variant: "destructive",
      });
    }
  };

  const removeAssignment = async (index: number) => {
    try {
      const { propertyId, ownerId } = state.assignments[index];
      const success = await assignmentService.deleteAssignment(propertyId, ownerId);
      
      if (success) {
        setState(prev => {
          const newAssignments = [...prev.assignments];
          newAssignments.splice(index, 1);
          return { ...prev, assignments: newAssignments };
        });
        
        toast({
          title: "Success",
          description: "Assignment removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast({
        title: "Error",
        description: "Failed to remove assignment.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4)
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
      currentStep: Math.max(0, Math.min(step, 4))
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
