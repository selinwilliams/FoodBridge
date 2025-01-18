// Mock data for food listings
export const mockFoodListings = [
    {
        id: 1,
        provider_id: 1,
        title: "Fresh Organic Vegetables",
        description: "Assorted organic vegetables including carrots, broccoli, and lettuce",
        food_type: "PRODUCE",
        quantity: 25.5,
        unit: "kg",
        expiration_date: "2024-03-25T15:00:00Z",
        status: "available",
        allergens: [],
        created_at: "2024-03-20T10:00:00Z",
        image_url: "/vegetables.jpg"
    },
    {
        id: 2,
        provider_id: 1,
        title: "Artisan Bread Selection",
        description: "Freshly baked artisan breads including sourdough and whole wheat",
        food_type: "BAKERY",
        quantity: 40,
        unit: "pieces",
        expiration_date: "2024-03-22T18:00:00Z",
        status: "pending",
        allergens: ["gluten", "wheat"],
        created_at: "2024-03-20T09:30:00Z",
        image_url: "/bread.jpg"
    },
    {
        id: 3,
        provider_id: 1,
        title: "Mixed Fruit Basket",
        description: "Seasonal fruits including apples, oranges, and bananas",
        food_type: "PRODUCE",
        quantity: 15,
        unit: "kg",
        expiration_date: "2024-03-23T12:00:00Z",
        status: "available",
        allergens: [],
        created_at: "2024-03-20T11:15:00Z",
        image_url: "/fruits.jpg"
    },
    {
        id: 4,
        provider_id: 1,
        title: "Dairy Products",
        description: "Assorted dairy including milk, yogurt, and cheese",
        food_type: "DAIRY",
        quantity: 30,
        unit: "items",
        expiration_date: "2024-03-24T10:00:00Z",
        status: "completed",
        allergens: ["dairy", "lactose"],
        created_at: "2024-03-19T14:20:00Z",
        image_url: "/dairy.jpg"
    },
    {
        id: 5,
        provider_id: 1,
        title: "Canned Goods",
        description: "Various canned vegetables and fruits",
        food_type: "PANTRY",
        quantity: 50,
        unit: "cans",
        expiration_date: "2024-06-20T00:00:00Z",
        status: "available",
        allergens: [],
        created_at: "2024-03-20T08:45:00Z",
        image_url: "/canned.jpg"
    },
    {
        id: 6,
        provider_id: 1,
        title: "Fresh Pasta",
        description: "Handmade fresh pasta assortment",
        food_type: "PREPARED",
        quantity: 20,
        unit: "kg",
        expiration_date: "2024-03-22T20:00:00Z",
        status: "pending",
        allergens: ["gluten", "eggs"],
        created_at: "2024-03-20T13:00:00Z",
        image_url: "/pasta.jpg"
    },
    {
        id: 7,
        provider_id: 1,
        title: "Frozen Meals",
        description: "Pre-prepared frozen meals",
        food_type: "FROZEN",
        quantity: 35,
        unit: "meals",
        expiration_date: "2024-04-20T00:00:00Z",
        status: "available",
        allergens: ["soy", "dairy"],
        created_at: "2024-03-20T15:30:00Z",
        image_url: "/frozen.jpg"
    },
    {
        id: 8,
        provider_id: 1,
        title: "Snack Pack",
        description: "Assorted healthy snacks and nuts",
        food_type: "SNACKS",
        quantity: 100,
        unit: "packs",
        expiration_date: "2024-04-15T00:00:00Z",
        status: "available",
        allergens: ["nuts", "peanuts"],
        created_at: "2024-03-20T16:45:00Z",
        image_url: "/snacks.jpg"
    }
];

// Helper function to get listings by status
export const getListingsByStatus = (status) => {
    return mockFoodListings.filter(listing => listing.status === status);
};

// Helper function to get listings by food type
export const getListingsByType = (foodType) => {
    return mockFoodListings.filter(listing => listing.food_type === foodType);
};

// Helper function to calculate metrics
export const calculateMetrics = () => {
    return {
        total: mockFoodListings.length,
        available: getListingsByStatus('available').length,
        pending: getListingsByStatus('pending').length,
        completed: getListingsByStatus('completed').length
    };
};

// Helper function to get recent listings
export const getRecentListings = (limit = 5) => {
    return [...mockFoodListings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
};