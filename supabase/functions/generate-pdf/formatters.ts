
/**
 * Utility functions for formatting data in the PDF
 */
export const formatters = {
  /**
   * Formats property type for display
   */
  formatPropertyType(propertyType: string): string {
    if (!propertyType) return "N/A";
    
    const types = {
      "RESIDENTIAL": "Residential",
      "B&B": "B&B",
      "COMMERCIAL": "Commercial",
      "LAND": "Land",
      "OTHER": "Other"
    };
    
    return types[propertyType] || propertyType;
  },

  /**
   * Formats activity type for display
   */
  formatActivityType(activityType: string): string {
    if (!activityType) return "N/A";
    
    const activities = {
      "purchased": "Purchased in 2024",
      "sold": "Sold in 2024",
      "both": "Purchased & Sold in 2024",
      "owned_all_year": "Owned all year"
    };
    
    return activities[activityType] || activityType;
  },

  /**
   * Formats date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Formats number with commas
   */
  formatNumber(num: number): string {
    if (num === null || num === undefined) return "N/A";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  /**
   * Formats marital status for display
   */
  formatMaritalStatus(status: string): string {
    if (!status) return "N/A";
    
    const statuses = {
      "UNMARRIED": "Unmarried",
      "MARRIED": "Married",
      "DIVORCED": "Divorced",
      "WIDOWED": "Widowed"
    };
    
    return statuses[status] || status;
  },

  /**
   * Formats occupancy statuses array for display
   */
  formatOccupancyStatuses(statuses: any[]): string {
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return "Not specified";
    }
    
    return statuses.map(status => {
      if (typeof status === 'string') {
        return this.formatOccupancyStatus(status);
      } else if (status && typeof status === 'object' && 'status' in status && 'months' in status) {
        return `${this.formatOccupancyStatus(status.status)} (${status.months} months)`;
      }
      return "Unknown";
    }).join(", ");
  },

  /**
   * Formats occupancy status for display
   */
  formatOccupancyStatus(status: string): string {
    if (!status) return "N/A";
    
    const statuses = {
      "PERSONAL_USE": "Personal Use",
      "LONG_TERM_RENT": "Long-term Rental",
      "SHORT_TERM_RENT": "Short-term Rental"
    };
    
    return statuses[status] || status;
  }
};
