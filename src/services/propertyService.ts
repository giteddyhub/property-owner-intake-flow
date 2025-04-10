
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/form";

export const propertyService = {
  // Create a new property
  async createProperty(property: Omit<Property, 'id'>): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        label: property.label,
        address_comune: property.address.comune,
        address_province: property.address.province,
        address_street: property.address.street,
        address_zip: property.address.zip,
        activity_2024: property.activity2024,
        purchase_date: property.purchaseDate ? new Date(property.purchaseDate).toISOString() : null,
        purchase_price: property.purchasePrice,
        sale_date: property.saleDate ? new Date(property.saleDate).toISOString() : null,
        sale_price: property.salePrice,
        property_type: property.propertyType,
        remodeling: property.remodeling,
        occupancy_statuses: property.occupancyStatuses,
        months_occupied: property.monthsOccupied,
        rental_income: property.rentalIncome
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating property:', error);
      return null;
    }

    return mapDbPropertyToProperty(data);
  },

  // List all properties
  async listProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      console.error('Error listing properties:', error);
      return [];
    }

    return data.map(mapDbPropertyToProperty);
  },

  // Update a property
  async updateProperty(property: Property): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        label: property.label,
        address_comune: property.address.comune,
        address_province: property.address.province,
        address_street: property.address.street,
        address_zip: property.address.zip,
        activity_2024: property.activity2024,
        purchase_date: property.purchaseDate ? new Date(property.purchaseDate).toISOString() : null,
        purchase_price: property.purchasePrice,
        sale_date: property.saleDate ? new Date(property.saleDate).toISOString() : null,
        sale_price: property.salePrice,
        property_type: property.propertyType,
        remodeling: property.remodeling,
        occupancy_statuses: property.occupancyStatuses,
        months_occupied: property.monthsOccupied,
        rental_income: property.rentalIncome
      })
      .eq('id', property.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return null;
    }

    return mapDbPropertyToProperty(data);
  },

  // Delete a property
  async deleteProperty(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return false;
    }

    return true;
  }
};

// Helper function to map database property to app property
function mapDbPropertyToProperty(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    label: dbProperty.label,
    address: {
      comune: dbProperty.address_comune,
      province: dbProperty.address_province,
      street: dbProperty.address_street,
      zip: dbProperty.address_zip
    },
    activity2024: dbProperty.activity_2024,
    purchaseDate: dbProperty.purchase_date ? new Date(dbProperty.purchase_date) : null,
    purchasePrice: dbProperty.purchase_price,
    saleDate: dbProperty.sale_date ? new Date(dbProperty.sale_date) : null,
    salePrice: dbProperty.sale_price,
    propertyType: dbProperty.property_type,
    remodeling: dbProperty.remodeling,
    occupancyStatuses: dbProperty.occupancy_statuses,
    monthsOccupied: dbProperty.months_occupied,
    rentalIncome: dbProperty.rental_income
  };
}
