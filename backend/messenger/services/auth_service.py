from datetime import datetime, timedelta

import grpc
import jwt

from messenger.generated import auth_pb2, auth_pb2_grpc
from messenger.config.database import get_db_session
from messenger.models.user import User

JWT_SECRET = "some-secret-key"  # use env variable
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24

class AuthService(auth_pb2_grpc.AuthServiceServicer):

    def Login(self, request, context):
        try:
            db = get_db_session()
            
            user = db.query(User).filter(User.username == request.username).first()
            
            if not user:
                return auth_pb2.LoginResponse(
                    success=False,
                    token="",
                    message="User not found",
                    user_id=0,
                    username=""
                )
            
            # Simple password check (in production, use proper password hashing)
            if user.password_hash != request.password:
                return auth_pb2.LoginResponse(
                    success=False,
                    token="",
                    message="Invalid password",
                    user_id=0,
                    username=""
                )
            
            # Generate JWT token
            payload = {
                "user_id": user.id,
                "username": user.username,
                "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
            
            db.close()
            
            return auth_pb2.LoginResponse(
                success=True,
                token=token,
                message="Login successful",
                user_id=user.id,
                username=user.username
            )
            
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return auth_pb2.LoginResponse(
                success=False,
                token="",
                message="Internal server error",
                user_id=0,
                username=""
            )
    
    def ValidateToken(self, request, context):
        try:
            payload = jwt.decode(request.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            return auth_pb2.ValidateTokenResponse(
                valid=True,
                user_id=payload["user_id"],
                username=payload["username"]
            )
            
        except jwt.ExpiredSignatureError:
            return auth_pb2.ValidateTokenResponse(
                valid=False,
                user_id=0,
                username=""
            )
        except jwt.InvalidTokenError:
            return auth_pb2.ValidateTokenResponse(
                valid=False,
                user_id=0,
                username=""
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return auth_pb2.ValidateTokenResponse(
                valid=False,
                user_id=0,
                username=""
            )