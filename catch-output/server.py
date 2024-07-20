from flask import Flask, request
from threading import Timer
import time
import os

app = Flask(__name__)

data_chunks = []
last_update_time = None
timeout = 10  # seconds
output_file_path = 'output_file.bin'
output_file_dir = 'output_dir'

def write_to_file():
    global data_chunks
    if data_chunks:
        # Sort the chunks by the index header
        data_chunks.sort(key=lambda chunk: chunk['index'])
        # Write data to the file in order
        with open(os.path.join(output_file_dir, output_file_path), 'wb') as f:
            for chunk in data_chunks:
                f.write(chunk['data'])
        data_chunks = []
        print(f"Data written to {output_file_path}")

def check_inactivity():
    global last_update_time
    if time.time() - last_update_time >= timeout:
        write_to_file()

@app.route('/upload', methods=['POST'])
def upload():
    global last_update_time
    data = request.get_data()  # Ensure we get raw binary data
    index = int(request.headers.get('index'))
    
    # Debug: log received data length and index
    print(f"Received chunk of length {len(data)} with index {index}")
    
    data_chunks.append({'index': index, 'data': data})
    last_update_time = time.time()
    
    # Set a timer to check for inactivity
    Timer(timeout, check_inactivity).start()
    
    return 'Data received', 200

if __name__ == '__main__':
    if not os.path.exists(output_file_dir):
        os.makedirs(output_file_dir)
    app.run(debug=True, port=5000)
