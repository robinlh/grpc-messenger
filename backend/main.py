import logging
from concurrent import futures
import grpc
from grpc_reflection.v1alpha import reflection

from messenger.generated import auth_pb2, auth_pb2_grpc, messaging_pb2, messaging_pb2_grpc

from messenger.services.auth_service import AuthService
from messenger.services.messaging_service import MessagingService

def serve():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    auth_pb2_grpc.add_AuthServiceServicer_to_server(AuthService(), server)
    messaging_pb2_grpc.add_MessagingServiceServicer_to_server(MessagingService(), server)
    
    # reflection so I can grpcurl
    SERVICE_NAMES = (
        auth_pb2.DESCRIPTOR.services_by_name['AuthService'].full_name,
        messaging_pb2.DESCRIPTOR.services_by_name['MessagingService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    
    listen_addr = '[::]:50051'
    server.add_insecure_port(listen_addr)
    
    logging.info(f"Starting Messenger gRPC Server on {listen_addr}")
    logging.info("gRPC reflection enabled")
    logging.info("Authentication and messaging services ready")
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logging.info("\nShutting down server...")
        server.stop(0)

def main():
    serve()

if __name__ == "__main__":
    main()
