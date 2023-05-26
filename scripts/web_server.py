#!/usr/bin/python3


# PORT = 8009
DIRECTORY = "/home/nick/trionix/src/arctic/scripts/templates/"
# # IP = "45.10.1.137"
IP = "192.168.0.143"


import http.server 
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver
import time
import rospy


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def kill_socets(ser):
    ser.server_close()


def run(server_class=HTTPServer, handler_class=Handler):
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    return httpd


if __name__ == "__main__":  
    # rospy.init_node('web_server', anonymous='false')

    # rospy.on_shutdown(kill_socets)
    serv = run()
    try:
        serv.serve_forever()
    except KeyboardInterrupt:
        pass
    

    serv.server_close()
    print("Server stopped.")
