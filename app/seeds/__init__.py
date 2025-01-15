from flask.cli import AppGroup
from .users import seed_users, undo_users
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
        undo_users()
        undo_distribution_centers()
    seed_users()
    seed_distribution_centers()


# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    """Undo all seeds"""
    undo_users()
    undo_distribution_centers()
