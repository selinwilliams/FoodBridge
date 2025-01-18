export const mockProvider = {
    id: 1,
    user_id: 1,
    business_name: "Fresh Foods Market",
    business_type: "RESTAURANT",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip_code: "94105",
    phone: "(555) 123-4567",
    email: "contact@freshfoods.com",
    website: "www.freshfoods.com",
    profile_image: "/prvrd.png",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-03-20T15:30:00Z",
    status: "active",
    verified: true,
    ratings: 4.5,
    total_donations: 150,
    active_listings: 8
};

// Helper functions
export const getMockProviderMetrics = () => {
    return {
        totalDonations: mockProvider.total_donations,
        activeListings: mockProvider.active_listings,
        rating: mockProvider.ratings,
        completedDeliveries: 142
    };
}; 