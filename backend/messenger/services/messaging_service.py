import logging
import threading
from datetime import datetime
import grpc
import jwt
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from messenger.generated import messaging_pb2, messaging_pb2_grpc
from messenger.config.database import get_db_session
from messenger.models.user import User
from messenger.models.thread import Thread, ThreadParticipant
from messenger.models.message import Message

# do this here for now, match auth_service.py
JWT_SECRET = "some-secret-key"
JWT_ALGORITHM = "HS256"

logger = logging.getLogger(__name__)

class MessagingService(messaging_pb2_grpc.MessagingServiceServicer):
    def __init__(self):
        # Thread ID -> list of (user_id, response_queue) tuples for connected clients
        self.subscribers = {}
        self.lock = threading.Lock()

    def _validate_token(self, token):
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload.get("user_id")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None
    
    def _thread_to_proto(self, thread, db):
        # participants
        participants = db.query(User).join(ThreadParticipant).filter(
            ThreadParticipant.thread_id == thread.id
        ).all()
        
        participant_protos = [
            messaging_pb2.User(id=user.id, username=user.username)
            for user in participants
        ]
        
        last_message = db.query(Message).filter(
            Message.thread_id == thread.id
        ).order_by(Message.created_at.desc()).first()
        
        last_message_proto = None
        if last_message:
            sender = db.query(User).filter(User.id == last_message.sender_id).first()
            last_message_proto = messaging_pb2.Message(
                id=last_message.id,
                content=last_message.content,
                sender_id=last_message.sender_id,
                sender_username=sender.username if sender else "Unknown",
                created_at=int(last_message.created_at.timestamp())
            )
        
        return messaging_pb2.Thread(
            id=thread.id,
            name=thread.name or "",
            participants=participant_protos,
            last_message=last_message_proto,
            updated_at=int(thread.updated_at.timestamp())
        )
    
    def _message_to_proto(self, message, sender_username):
        return messaging_pb2.Message(
            id=message.id,
            content=message.content,
            sender_id=message.sender_id,
            sender_username=sender_username,
            created_at=int(message.created_at.timestamp())
        )
    
    def _find_existing_dm_thread(self, db, user_id_1, user_id_2):
        return db.query(Thread).join(ThreadParticipant).filter(
            Thread.name.is_(None)
        ).group_by(Thread.id).having(
            func.count(ThreadParticipant.user_id) == 2
        ).filter(
            Thread.id.in_(
                db.query(ThreadParticipant.thread_id)
                .filter(ThreadParticipant.user_id.in_([user_id_1, user_id_2]))
                .group_by(ThreadParticipant.thread_id)
                .having(func.count(ThreadParticipant.user_id) == 2)
            )
        ).first()
    
    def GetThreads(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info("GetThreads failed: invalid or expired token")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.GetThreadsResponse()
        
        try:
            db = get_db_session()
            
            threads = db.query(Thread).join(ThreadParticipant).filter(
                ThreadParticipant.user_id == user_id
            ).order_by(Thread.updated_at.desc()).all()
            
            thread_protos = []
            for thread in threads:
                thread_proto = self._thread_to_proto(thread, db)
                thread_protos.append(thread_proto)
            
            db.close()
            
            logger.info(f"GetThreads successful - user_id: {user_id}, threads_count: {len(thread_protos)}")
            return messaging_pb2.GetThreadsResponse(threads=thread_protos)
            
        except Exception as e:
            logger.error(f"GetThreads error - user_id: {user_id}, error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return messaging_pb2.GetThreadsResponse()
    
    def GetMessages(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"GetMessages failed: invalid or expired token - thread_id: {request.thread_id}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.GetMessagesResponse()
        
        try:
            db = get_db_session()
            
            participant = db.query(ThreadParticipant).filter(
                ThreadParticipant.user_id == user_id,
                ThreadParticipant.thread_id == request.thread_id
            ).first()
            
            if not participant:
                logger.info(f"GetMessages failed: permission denied - user_id: {user_id}, thread_id: {request.thread_id}")
                context.set_code(grpc.StatusCode.PERMISSION_DENIED)
                context.set_details("You are not a participant in this thread")
                return messaging_pb2.GetMessagesResponse()
            
            limit = request.limit if request.limit > 0 else 50
            offset = request.offset if request.offset > 0 else 0
            
            messages = db.query(Message).filter(
                Message.thread_id == request.thread_id
            ).order_by(Message.created_at.desc()).limit(limit).offset(offset).all()
            
            message_protos = []
            for message in messages:
                sender = db.query(User).filter(User.id == message.sender_id).first()
                message_proto = self._message_to_proto(
                    message, 
                    sender.username if sender else "Unknown"
                )
                message_protos.append(message_proto)
            
            db.close()
            
            logger.info(f"GetMessages successful - user_id: {user_id}, thread_id: {request.thread_id}, messages_count: {len(message_protos)}")
            return messaging_pb2.GetMessagesResponse(messages=message_protos)
            
        except Exception as e:
            logger.error(f"GetMessages error - user_id: {user_id}, thread_id: {request.thread_id}, error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return messaging_pb2.GetMessagesResponse()
    
    def SendMessage(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"SendMessage failed: invalid or expired token - thread_id: {request.thread_id}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.SendMessageResponse(success=False, message="Invalid token")
        
        try:
            db = get_db_session()
            
            participant = db.query(ThreadParticipant).filter(
                ThreadParticipant.user_id == user_id,
                ThreadParticipant.thread_id == request.thread_id
            ).first()
            
            if not participant:
                logger.info(f"SendMessage failed: permission denied - user_id: {user_id}, thread_id: {request.thread_id}")
                return messaging_pb2.SendMessageResponse(
                    success=False, 
                    message="You are not a participant in this thread"
                )
            
            new_message = Message(
                content=request.content,
                sender_id=user_id,
                thread_id=request.thread_id
            )
            db.add(new_message)
            
            thread = db.query(Thread).filter(Thread.id == request.thread_id).first()
            if thread:
                thread.updated_at = datetime.utcnow()
            
            db.commit()
            
            sender = db.query(User).filter(User.id == user_id).first()
            message_proto = self._message_to_proto(
                new_message, 
                sender.username if sender else "Unknown"
            )
            
            db.close()
            
            # Broadcast to streaming clients (exclude sender)
            self._broadcast_message(request.thread_id, message_proto, exclude_sender_id=user_id)
            
            logger.info(f"SendMessage successful - user_id: {user_id}, thread_id: {request.thread_id}, message_id: {new_message.id}, content_length: {len(request.content)}")
            return messaging_pb2.SendMessageResponse(
                success=True,
                message="Message sent successfully",
                sent_message=message_proto
            )
            
        except Exception as e:
            logger.error(f"SendMessage error - user_id: {user_id}, thread_id: {request.thread_id}, error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return messaging_pb2.SendMessageResponse(
                success=False, 
                message="Internal server error"
            )
    
    def CreateThread(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"CreateThread failed: invalid or expired token - participants: {request.participant_usernames}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.CreateThreadResponse(success=False, message="Invalid token")
        
        try:
            db = get_db_session()
            
            participant_users = db.query(User).filter(
                User.username.in_(request.participant_usernames)
            ).all()
            
            if len(participant_users) != len(request.participant_usernames):
                logger.info(f"CreateThread failed: users not found - user_id: {user_id}, participants: {request.participant_usernames}")
                return messaging_pb2.CreateThreadResponse(
                    success=False,
                    message="One or more users not found"
                )
            
            current_user = db.query(User).filter(User.id == user_id).first()
            if current_user not in participant_users:
                participant_users.append(current_user)
            
            is_dm = len(participant_users) == 2 and not request.name
            
            if is_dm:
                user_ids = sorted([user.id for user in participant_users])
                existing_thread = self._find_existing_dm_thread(db, user_ids[0], user_ids[1])
                
                if existing_thread:
                    thread_proto = self._thread_to_proto(existing_thread, db)
                    db.close()
                    
                    logger.info(f"CreateThread found existing DM - user_id: {user_id}, thread_id: {existing_thread.id}, participants: {[u.username for u in participant_users]}")
                    return messaging_pb2.CreateThreadResponse(
                        success=True,
                        message="Found existing conversation",
                        thread=thread_proto
                    )
            
            new_thread = Thread(name=request.name if request.name else None)
            db.add(new_thread)
            db.commit()
            
            for user in participant_users:
                participant = ThreadParticipant(
                    thread_id=new_thread.id,
                    user_id=user.id
                )
                db.add(participant)
            
            db.commit()
            
            thread_proto = self._thread_to_proto(new_thread, db)
            
            db.close()
            
            logger.info(f"CreateThread successful - user_id: {user_id}, thread_id: {new_thread.id}, participants: {[u.username for u in participant_users]}, name: {request.name}")
            return messaging_pb2.CreateThreadResponse(
                success=True,
                message="Thread created successfully",
                thread=thread_proto
            )
            
        except Exception as e:
            logger.error(f"CreateThread error - user_id: {user_id}, participants: {request.participant_usernames}, error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return messaging_pb2.CreateThreadResponse(
                success=False,
                message="Internal server error"
            )
    
    def JoinThread(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"JoinThread failed: invalid or expired token - thread_id: {request.thread_id}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.JoinThreadResponse(success=False, message="Invalid token")
        
        try:
            db = get_db_session()
            
            # Check if user is a participant in this thread
            participant = db.query(ThreadParticipant).filter(
                ThreadParticipant.user_id == user_id,
                ThreadParticipant.thread_id == request.thread_id
            ).first()
            
            if not participant:
                logger.info(f"JoinThread failed: permission denied - user_id: {user_id}, thread_id: {request.thread_id}")
                db.close()
                return messaging_pb2.JoinThreadResponse(
                    success=False, 
                    message="You are not a participant in this thread"
                )
            
            db.close()
            
            logger.info(f"JoinThread successful - user_id: {user_id}, thread_id: {request.thread_id}")
            return messaging_pb2.JoinThreadResponse(
                success=True,
                message="Successfully joined thread for streaming"
            )
            
        except Exception as e:
            logger.error(f"JoinThread error - user_id: {user_id}, thread_id: {request.thread_id}, error: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal server error: {str(e)}")
            return messaging_pb2.JoinThreadResponse(
                success=False,
                message="Internal server error"
            )
    
    def LeaveThread(self, request, context):
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"LeaveThread failed: invalid or expired token - thread_id: {request.thread_id}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return messaging_pb2.LeaveThreadResponse(success=False, message="Invalid token")
        
        logger.info(f"LeaveThread successful - user_id: {user_id}, thread_id: {request.thread_id}")
        return messaging_pb2.LeaveThreadResponse(
            success=True,
            message="Successfully left thread streaming"
        )
    
    def StreamThreadMessages(self, request, context):
        import queue
        
        user_id = self._validate_token(request.token)
        if not user_id:
            logger.info(f"StreamThreadMessages failed: invalid or expired token - thread_id: {request.thread_id}")
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Invalid or expired token")
            return
        
        try:
            db = get_db_session()
            
            participant = db.query(ThreadParticipant).filter(
                ThreadParticipant.user_id == user_id,
                ThreadParticipant.thread_id == request.thread_id
            ).first()
            
            if not participant:
                logger.info(f"StreamThreadMessages failed: permission denied - user_id: {user_id}, thread_id: {request.thread_id}")
                db.close()
                yield messaging_pb2.MessageStreamResponse(error="You are not a participant in this thread")
                return
            
            db.close()
            
            response_queue = queue.Queue()
            thread_id = request.thread_id
            
            with self.lock:
                if thread_id not in self.subscribers:
                    self.subscribers[thread_id] = []
                self.subscribers[thread_id].append((user_id, response_queue))
            
            yield messaging_pb2.MessageStreamResponse(
                status=messaging_pb2.ConnectionStatus(connected=True, message="Connected to thread stream")
            )
            
            logger.info(f"StreamThreadMessages started - user_id: {user_id}, thread_id: {thread_id}")
            
            try:
                while context.is_active():
                    try:
                        response = response_queue.get(timeout=1)
                        yield response
                    except queue.Empty:
                        continue
                    except Exception as e:
                        logger.error(f"Error in StreamThreadMessages response: {str(e)}")
                        break
            
            finally:
                with self.lock:
                    if thread_id in self.subscribers:
                        # Remove the (user_id, response_queue) tuple
                        self.subscribers[thread_id] = [
                            (uid, queue) for uid, queue in self.subscribers[thread_id] 
                            if queue != response_queue
                        ]
                        if not self.subscribers[thread_id]:
                            del self.subscribers[thread_id]
                
                logger.info(f"StreamThreadMessages ended - user_id: {user_id}, thread_id: {thread_id}")
        
        except Exception as e:
            logger.error(f"StreamThreadMessages error - user_id: {user_id}, thread_id: {request.thread_id}, error: {str(e)}")
            yield messaging_pb2.MessageStreamResponse(error=f"Internal server error: {str(e)}")
    
    def _broadcast_message(self, thread_id, message_proto, exclude_sender_id=None):
        with self.lock:
            if thread_id in self.subscribers:
                response = messaging_pb2.MessageStreamResponse(new_message=message_proto)
                
                active_subscribers = []
                for user_id, subscriber_queue in self.subscribers[thread_id]:
                    # don't send to sender
                    if exclude_sender_id and user_id == exclude_sender_id:
                        active_subscribers.append((user_id, subscriber_queue))
                        continue
                        
                    try:
                        subscriber_queue.put(response)
                        active_subscribers.append((user_id, subscriber_queue))
                    except:
                        logger.info(f"Removed disconnected subscriber from thread {thread_id}")
                
                if active_subscribers:
                    self.subscribers[thread_id] = active_subscribers
                else:
                    del self.subscribers[thread_id]
                    logger.info(f"No active subscribers left for thread {thread_id}")
    
