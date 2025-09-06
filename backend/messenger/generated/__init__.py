import sys
import os
# grpc tools protoc command generates stubs with absolute imports, my project structure doesn't like this
# adding this crappy workaround, fix if I have time
# Add this directory to Python path so generated files can find each other
_current_dir = os.path.dirname(__file__)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

# Import modules to make them available
try:
    from . import auth_pb2
    from . import auth_pb2_grpc
except ImportError:
    # Fallback if relative imports don't work
    import auth_pb2
    import auth_pb2_grpc

__all__ = ['auth_pb2', 'auth_pb2_grpc']