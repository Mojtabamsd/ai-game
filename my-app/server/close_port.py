import psutil
import os
import signal

def close_port(port):
    """Find and close the process using a specific port"""
    for conn in psutil.net_connections(kind='inet'):
        if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
            pid = conn.pid
            if pid:
                try:
                    process = psutil.Process(pid)
                    print(f"Closing process {process.name()} (PID: {pid}) on port {port}")
                    os.kill(pid, signal.SIGTERM)  # Graceful termination
                except Exception as e:
                    print(f"Could not close process {pid}: {e}")

if __name__ == "__main__":
    port_to_close = 3002  # Change this to the port you want to close
    close_port(port_to_close)
