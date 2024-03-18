#!/usr/bin/python3


from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

IP = '192.168.1.100'

class PhotoRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/files':
            try:
                files = os.listdir(self.directory)
                files_text = '\n'.join(files)
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.send_header('Content-Disposition', 'attachment')
                self.end_headers()
                self.wfile.write(files_text.encode('utf-8'))
            except BrokenPipeError:
                pass  # Ignore BrokenPipeError
        else:
            return SimpleHTTPRequestHandler.do_GET(self)
    
    def do_DELETE(self):
        if self.path.startswith('/delete/'):
            file_name = self.path.split('/')[-1]
            file_path = os.path.join(self.directory, file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'File deleted successfully')
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Invalid request')

if __name__ == '__main__':
    try:
        # Specify the directory containing image files
        # print(os.getcwd())
        print(os.chdir(os.path.expanduser('~/photo/')))
        # photo_directory = os.chdir(os.path.expanduser('~/photo/'))
        # os.chdir(photo_directory)  # Change the current working directory

        server_address = (IP, 8080)
        # server_address = ('', 8080)
        handler = lambda *args: PhotoRequestHandler(*args)
        httpd = HTTPServer(server_address, handler)
        print('Server running on: ' + IP + ':8000')
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('^C received, shutting down the server')
        httpd.socket.close()





