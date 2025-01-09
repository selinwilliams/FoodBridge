from flask.cli import AppGroup
from .users import seed_users, undo_users
from .providers import seed_providers, undo_providers

seed_commands = AppGroup('seed')

# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    seed_users()
    seed_providers()
    print("Database seeded!")

# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    undo_providers()
    undo_users()
    print("Database unseeded!")
