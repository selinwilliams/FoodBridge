from functools import wraps

def handle_errors(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return {'errors': str(e)}, 500
    return wrapped 