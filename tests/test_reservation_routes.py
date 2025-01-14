def test_create_reservation(client, auth_recipient, test_listing):
    """Test creating a reservation"""
    auth_recipient.login()
    response = client.post('/api/reservations', json={
        'listing_id': test_listing.id,
        'quantity_reserved': 2,
        'pickup_time': (datetime.utcnow() + timedelta(hours=24)).isoformat()
    })
    assert response.status_code == 201
    assert response.json['listing_id'] == test_listing.id

def test_get_user_reservations(client, auth_recipient):
    """Test getting user's reservations"""
    auth_recipient.login()
    response = client.get('/api/reservations/user')
    assert response.status_code == 200
    assert 'reservations' in response.json 