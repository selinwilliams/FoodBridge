# FoodBridge

FoodBridge is a platform that connects food service providers with recipients to reduce food waste and help those in need.

## Technical Stack

### Backend
- **Framework**: Flask (Python)
  - Flask-Login for authentication
  - Flask-WTF for form validation
  - Flask-CORS for CORS
  - Flask-Migrate for migrations
- **Database**: PostgreSQL
  - SQLAlchemy ORM
  - Alembic for migrations
- **Authentication**:
  - Flask-Login (session management)
  - CSRF protection
  - Werkzeug (password hashing)

### Frontend
- **Framework**: React (JavaScript)
  - Built with Vite
  - React Router
  - Redux + Redux Toolkit
- **State Management**:
  - Redux (global state)
  - React Context (modals)
  - Redux Thunk (async)
- **Styling**:
  - CSS Modules
  - Modern CSS (flexbox, grid)
  - Custom animations

### Additional Features
- Google Maps API integration
- Real-time notifications
- Image upload and processing
- Email service integration

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for caching)

### Installation

1. Clone and setup backend:
```bash
git clone https://github.com/selinwilliams/foodbridge.git
cd foodbridge

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Unix
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

2. Setup frontend:
```bash
cd react-vite
npm install
```

3. Configure environment:
```bash
# Copy example env file
cp .env.example .env

# Update .env with your values
DATABASE_URL=postgresql://user:password@localhost:5432/foodbridge
SCHEMA=foodbridge_schema
SECRET_KEY=your-secret-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

4. Initialize database:
```bash
flask db upgrade
flask seed all
```

5. Start development servers:
```bash
# Terminal 1 - Backend
flask run

# Terminal 2 - Frontend
cd react-vite
npm run dev
```

## API Documentation


## Base URL
```
Development: http://localhost:5000/api
Production: https://foodbridge-api.example.com/api
```

### AUTHENTICATION ENDPOINTS

#### Sign Up

Creates a new user account.

Require Authentication: false

Request:
- Method: POST
- URL: /api/auth/signup
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "user_type": "provider",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "123-456-7890"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "user_type": "provider",
      "first_name": "John",
      "last_name": "Doe",
      "token": "your-auth-token"
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "email": "Email is required",
        "email": "Email must be unique",
        "password": "Password must be at least 6 characters"
      }
    }
    ```

## FOOD LISTING ENDPOINTS

### Create Food Listing

Creates a new food listing.

Require Authentication: true
Authorization: Provider only

Request:
- Method: POST
- URL: /api/listings
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "title": "Fresh Produce",
      "description": "Assorted vegetables",
      "quantity": 50.5,
      "unit": "kg",
      "expiration_date": "2024-03-20T15:00:00Z",
      "distribution_center_id": 1,
      "allergens": ["nuts", "dairy"]
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "provider_id": 1,
      "title": "Fresh Produce",
      "description": "Assorted vegetables",
      "quantity": 50.5,
      "unit": "kg",
      "expiration_date": "2024-03-20T15:00:00Z",
      "status": "available",
      "distribution_center_id": 1,
      "allergens": ["nuts", "dairy"],
      "created_at": "2024-03-15T10:00:00Z"
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "title": "Title is required",
        "quantity": "Quantity must be greater than 0",
        "expiration_date": "Expiration date is required"
      }
    }
    ```

### Get All Food Listings

Returns all available food listings.

Require Authentication: true

Request:
- Method: GET
- URL: /api/listings
- Query Parameters:
    - status (optional): Filter by status
    - provider_id (optional): Filter by provider
    - distribution_center_id (optional): Filter by distribution center
    - page (optional): Page number
    - per_page (optional): Items per page

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "listings": [
        {
          "id": 1,
          "provider_id": 1,
          "title": "Fresh Produce",
          "description": "Assorted vegetables",
          "quantity": 50.5,
          "unit": "kg",
          "expiration_date": "2024-03-20T15:00:00Z",
          "status": "available",
          "distribution_center_id": 1,
          "allergens": ["nuts", "dairy"],
          "created_at": "2024-03-15T10:00:00Z",
          "provider": {
            "business_name": "Fresh Foods Market",
            "address": "123 Main St"
          }
        }
      ],
      "page": 1,
      "total_pages": 5,
      "total_items": 100
    }
    ```

## Development

### Running Tests
```bash
# Backend tests
pytest

# Frontend tests
npm test
```

### Code Style
We follow:
- PEP 8 for Python
- Airbnb JavaScript Style Guide

## Deployment

Detailed deployment guides for:
- Render
- Heroku
- AWS

## License

MIT License - see LICENSE.md

## Support
- Email: support@foodbridge.com
- Documentation: docs.foodbridge.com

## RESERVATION ENDPOINTS

### Create Reservation

Creates a new reservation for a food listing.

Require Authentication: true
Authorization: Recipient only

Request:
- Method: POST
- URL: /api/reservations
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "listing_id": 1,
      "pickup_time": "2024-03-16T14:00:00Z",
      "notes": "Will pick up with refrigerated truck"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "listing_id": 1,
      "recipient_id": 2,
      "pickup_time": "2024-03-16T14:00:00Z",
      "status": "pending",
      "notes": "Will pick up with refrigerated truck",
      "created_at": "2024-03-15T10:00:00Z",
      "listing": {
        "title": "Fresh Produce",
        "provider": {
          "business_name": "Fresh Foods Market",
          "address": "123 Main St"
        }
      }
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "listing_id": "Listing not available",
        "pickup_time": "Pickup time must be in the future"
      }
    }
    ```

### Update Reservation Status

Updates the status of an existing reservation.

Require Authentication: true
Authorization: Provider or Recipient involved in reservation

Request:
- Method: PUT
- URL: /api/reservations/:id/status
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "status": "confirmed"
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "status": "confirmed",
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```

## DISTRIBUTION CENTER ENDPOINTS

### Create Distribution Center

Creates a new distribution center.

Require Authentication: true
Authorization: Admin only

Request:
- Method: POST
- URL: /api/distribution-centers
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "name": "Downtown Food Bank",
      "address": "456 Center St",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "contact_person": "Jane Smith",
      "phone": "555-0123",
      "operating_hours": "Mon-Fri 9AM-5PM"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "name": "Downtown Food Bank",
      "address": "456 Center St",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "contact_person": "Jane Smith",
      "phone": "555-0123",
      "operating_hours": "Mon-Fri 9AM-5PM",
      "created_at": "2024-03-15T10:00:00Z"
    }
    ```

### Get Nearby Distribution Centers

Returns distribution centers within specified radius.

Require Authentication: true

Request:
- Method: GET
- URL: /api/distribution-centers/nearby
- Query Parameters:
    - latitude: Current latitude
    - longitude: Current longitude
    - radius: Search radius in kilometers (default: 10)

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "centers": [
        {
          "id": 1,
          "name": "Downtown Food Bank",
          "address": "456 Center St",
          "distance": 2.5,
          "operating_hours": "Mon-Fri 9AM-5PM"
        }
      ]
    }
    ```

## IMPACT METRICS ENDPOINTS

### Record Impact Metric

Records impact metrics for a provider.

Require Authentication: true
Authorization: Provider only

Request:
- Method: POST
- URL: /api/metrics
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "food_weight": 100.5,
      "estimated_meals": 120,
      "date": "2024-03-15"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "provider_id": 1,
      "food_weight": 100.5,
      "estimated_meals": 120,
      "date": "2024-03-15",
      "created_at": "2024-03-15T10:00:00Z"
    }
    ```

### Get Provider Impact Summary

Returns impact metrics summary for a provider.

Require Authentication: true
Authorization: Provider or Admin

Request:
- Method: GET
- URL: /api/metrics/providers/:id/summary
- Query Parameters:
    - start_date: Start date for metrics
    - end_date: End date for metrics

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "total_weight": 1500.5,
      "total_meals": 1800,
      "monthly_breakdown": [
        {
          "month": "2024-03",
          "weight": 500.5,
          "meals": 600
        }
      ]
    }
    ```

## ALLERGEN ALERTS ENDPOINTS

### Create Allergen Alert

Creates a new allergen alert for a user.

Require Authentication: true

Request:
- Method: POST
- URL: /api/allergens/alerts
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "allergen_name": "peanuts"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "user_id": 1,
      "allergen_name": "peanuts",
      "created_at": "2024-03-15T10:00:00Z"
    }
    ```

### Get User Allergen Alerts

Returns all allergen alerts for a user.

Require Authentication: true

Request:
- Method: GET
- URL: /api/allergens/alerts

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "alerts": [
        {
          "id": 1,
          "allergen_name": "peanuts",
          "created_at": "2024-03-15T10:00:00Z"
        }
      ]
    }
    ```

### Delete Allergen Alert

Deletes an allergen alert.

Require Authentication: true
Authorization: Alert owner only

Request:
- Method: DELETE
- URL: /api/allergens/alerts/:id

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted allergen alert"
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Allergen alert not found"
    }
    ```

## PROVIDER ENDPOINTS

### Get All Providers

Returns a list of all providers.

Require Authentication: true

Request:
- Method: GET
- URL: /api/providers
- Query Parameters:
    - business_type (optional): Filter by type (restaurant, grocery, farm)
    - latitude (optional): Center latitude for proximity search
    - longitude (optional): Center longitude for proximity search
    - radius (optional): Search radius in kilometers

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "providers": [
        {
          "id": 1,
          "user_id": 1,
          "business_name": "Fresh Foods Market",
          "address": "123 Main St",
          "latitude": 37.7749,
          "longitude": -122.4194,
          "business_type": "grocery",
          "created_at": "2024-03-15T10:00:00Z",
          "user": {
            "first_name": "John",
            "last_name": "Doe",
            "phone": "123-456-7890"
          }
        }
      ]
    }
    ```

### Get Provider Details

Returns details of a specific provider.

Require Authentication: true

Request:
- Method: GET
- URL: /api/providers/:id

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "user_id": 1,
      "business_name": "Fresh Foods Market",
      "address": "123 Main St",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "business_type": "grocery",
      "created_at": "2024-03-15T10:00:00Z",
      "user": {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "123-456-7890"
      },
      "active_listings": [
        {
          "id": 1,
          "title": "Fresh Produce",
          "status": "available"
        }
      ]
    }
    ```

### Update Provider

Updates provider information.

Require Authentication: true
Authorization: Provider owner only

Request:
- Method: PUT
- URL: /api/providers/:id
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "business_name": "Fresh Foods Market Updated",
      "address": "124 Main St",
      "business_type": "grocery",
      "latitude": 37.7749,
      "longitude": -122.4194
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "user_id": 1,
      "business_name": "Fresh Foods Market Updated",
      "address": "124 Main St",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "business_type": "grocery",
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```

### Delete Provider

Deletes a provider profile.

Require Authentication: true
Authorization: Provider owner or Admin only

Request:
- Method: DELETE
- URL: /api/providers/:id
- Headers:
    - Authorization: Bearer <token>

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted provider"
    }
    ```

## FOOD LISTING ENDPOINTS (Additional)

### Update Food Listing

Updates an existing food listing.

Require Authentication: true
Authorization: Provider owner only

Request:
- Method: PUT
- URL: /api/listings/:id
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "title": "Updated Fresh Produce",
      "description": "Updated description",
      "quantity": 45.5,
      "unit": "kg",
      "expiration_date": "2024-03-21T15:00:00Z",
      "allergens": ["nuts", "dairy", "soy"]
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "provider_id": 1,
      "title": "Updated Fresh Produce",
      "description": "Updated description",
      "quantity": 45.5,
      "unit": "kg",
      "expiration_date": "2024-03-21T15:00:00Z",
      "status": "available",
      "allergens": ["nuts", "dairy", "soy"],
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```

### Delete Food Listing

Deletes an existing food listing.

Require Authentication: true
Authorization: Provider owner only

Request:
- Method: DELETE
- URL: /api/listings/:id
- Headers:
    - Authorization: Bearer <token>

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted listing"
    }
    ```

### Search Food Listings by Location

Returns food listings within a specified radius.

Require Authentication: true

Request:
- Method: GET
- URL: /api/listings/nearby
- Query Parameters:
    - latitude: Current latitude
    - longitude: Current longitude
    - radius: Search radius in kilometers (default: 10)
    - allergens (optional): Exclude listings with specific allergens

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "listings": [
        {
          "id": 1,
          "provider_id": 1,
          "title": "Fresh Produce",
          "distance": 2.5,
          "provider": {
            "business_name": "Fresh Foods Market",
            "address": "123 Main St"
          }
        }
      ]
    }
    ```

## DISTRIBUTION CENTER ENDPOINTS (Additional)

### Get All Distribution Centers

Returns a list of all distribution centers.

Require Authentication: true

Request:
- Method: GET
- URL: /api/distribution-centers
- Query Parameters:
    - latitude (optional): Center latitude for proximity search
    - longitude (optional): Center longitude for proximity search
    - radius (optional): Search radius in kilometers
    - operating (optional): Filter by currently operating (based on hours)

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "centers": [
        {
          "id": 1,
          "name": "Downtown Food Bank",
          "address": "456 Center St",
          "latitude": 37.7749,
          "longitude": -122.4194,
          "contact_person": "Jane Smith",
          "phone": "555-0123",
          "operating_hours": "Mon-Fri 9AM-5PM",
          "distance": 1.5,
          "is_operating": true
        }
      ]
    }
    ```

### Update Distribution Center

Updates an existing distribution center.

Require Authentication: true
Authorization: Admin only

Request:
- Method: PUT
- URL: /api/distribution-centers/:id
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "name": "Updated Food Bank",
      "address": "457 Center St",
      "contact_person": "Jane Wilson",
      "phone": "555-0124",
      "operating_hours": "Mon-Sat 9AM-6PM"
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "name": "Updated Food Bank",
      "address": "457 Center St",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "contact_person": "Jane Wilson",
      "phone": "555-0124",
      "operating_hours": "Mon-Sat 9AM-6PM",
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```

### Delete Distribution Center

Deletes a distribution center.

Require Authentication: true
Authorization: Admin only

Request:
- Method: DELETE
- URL: /api/distribution-centers/:id
- Headers:
    - Authorization: Bearer <token>

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted distribution center"
    }
    ```

## IMPACT METRICS ENDPOINTS

### Create Impact Metric

Records a new impact metric.

Require Authentication: true
Authorization: Provider only

Request:
- Method: POST
- URL: /api/metrics
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "provider_id": 1,
      "food_weight": 100.5,
      "estimated_meals": 120,
      "date": "2024-03-15"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "provider_id": 1,
      "food_weight": 100.5,
      "estimated_meals": 120,
      "date": "2024-03-15",
      "created_at": "2024-03-15T10:00:00Z"
    }
    ```

### Get Provider Metrics

Returns metrics for a specific provider.

Require Authentication: true
Authorization: Provider owner or Admin

Request:
- Method: GET
- URL: /api/metrics/providers/:id
- Query Parameters:
    - start_date: Start date for metrics
    - end_date: End date for metrics
    - group_by: Group results by (day, week, month, year)

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "metrics": [
        {
          "period": "2024-03",
          "total_weight": 1500.5,
          "total_meals": 1800,
          "listings_count": 25,
          "completion_rate": 95.5
        }
      ],
      "summary": {
        "total_weight": 1500.5,
        "total_meals": 1800,
        "average_monthly_weight": 500.2,
        "average_monthly_meals": 600
      }
    }
    ```

### Update Impact Metric

Updates an existing impact metric.

Require Authentication: true
Authorization: Provider owner or Admin

Request:
- Method: PUT
- URL: /api/metrics/:id
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "food_weight": 110.5,
      "estimated_meals": 130
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "provider_id": 1,
      "food_weight": 110.5,
      "estimated_meals": 130,
      "date": "2024-03-15",
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```

### Delete Impact Metric

Deletes an impact metric.

Require Authentication: true
Authorization: Provider owner or Admin

Request:
- Method: DELETE
- URL: /api/metrics/:id
- Headers:
    - Authorization: Bearer <token>

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted impact metric"
    }
    ```

## ALLERGEN ALERTS ENDPOINTS (Additional)

### Check Listing Against User Alerts

Checks if a food listing contains any allergens that a user has alerts for.

Require Authentication: true

Request:
- Method: GET
- URL: /api/allergens/check/:listing_id
- Headers:
    - Authorization: Bearer <token>

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "has_allergens": true,
      "matching_allergens": ["nuts", "dairy"],
      "listing_id": 1,
      "listing_title": "Fresh Produce"
    }
    ```

### Batch Update Allergen Alerts

Updates multiple allergen alerts for a user.

Require Authentication: true

Request:
- Method: PUT
- URL: /api/allergens/alerts/batch
- Headers:
    - Content-Type: application/json
    - Authorization: Bearer <token>
- Body:
    ```json
    {
      "allergens": ["peanuts", "dairy", "soy"]
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "user_id": 1,
      "allergens": ["peanuts", "dairy", "soy"],
      "updated_at": "2024-03-15T11:00:00Z"
    }
    ```
