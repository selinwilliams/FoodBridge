from flask.cli import AppGroup
from .users import seed_users, undo_users
from .providers import seed_providers, undo_providers
from .food_listings import seed_food_listings, undo_food_listings
from .distribution_centers import seed_distribution_centers, undo_distribution_centers
from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    """Seed all tables"""
    if environment == 'production':
        undo_food_listings()
        undo_providers()
        undo_distribution_centers()
        undo_users()
    seed_users()
    seed_distribution_centers()
    seed_providers()
    seed_food_listings()


# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    """Undo all seeds"""
    undo_food_listings()
    undo_providers()
    undo_distribution_centers()
    undo_users()
