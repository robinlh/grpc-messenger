from concurrent import futures
import grpc
from grpc_reflection.v1alpha import reflection

from messenger.generated import auth_pb2, auth_pb2_grpc

from messenger.services.auth_service import AuthService

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    auth_pb2_grpc.add_AuthServiceServicer_to_server(AuthService(), server)
    
    # reflection so I can grpcurl
    SERVICE_NAMES = (
        auth_pb2.DESCRIPTOR.services_by_name['AuthService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    
    listen_addr = '[::]:50051'
    server.add_insecure_port(listen_addr)
    
    print(f"Starting Messenger gRPC Server on {listen_addr}")
    print("gRPC reflection enabled")
    print("Authentication service ready")
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.stop(0)

def main():
    serve()

if __name__ == "__main__":
    main()
