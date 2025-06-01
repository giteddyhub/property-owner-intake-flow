
import { supabase } from '@/integrations/supabase/client';

export const fetchUserTotalRevenue = async (userId: string): Promise<number> => {
  try {
    console.log('Fetching total rental income for user:', userId);
    
    // Get all properties for this user and sum their rental income
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('rental_income')
      .eq('user_id', userId);

    if (propertiesError) {
      console.error('Error fetching user properties:', propertiesError);
      throw propertiesError;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties found for user, rental income is 0');
      return 0;
    }

    // Calculate total rental income
    const totalRentalIncome = properties.reduce((sum, property) => {
      const rentalIncome = Number(property.rental_income) || 0;
      return sum + rentalIncome;
    }, 0);

    console.log(`Total rental income calculated: €${totalRentalIncome} from ${properties.length} properties`);
    return totalRentalIncome;
    
  } catch (error) {
    console.error('Error calculating total rental income:', error);
    return 0;
  }
};
