import os
import jwt
import grpc
from typing import Optional, Dict, Any

JWT_SECRET = os.getenv("JWT_SECRET", "some-secret-key")
JWT_ALGORITHM = "HS256"

def validate_jwt_token(token: str, context: grpc.ServicerContext) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            'user_id': payload.get('user_id'),
            'username': payload.get('username')
        }
    except jwt.ExpiredSignatureError:
        context.set_code(grpc.StatusCode.UNAUTHENTICATED)
        context.set_details("Token has expired")
        return None
    except jwt.InvalidTokenError:
        context.set_code(grpc.StatusCode.UNAUTHENTICATED)
        context.set_details("Invalid token")
        return None