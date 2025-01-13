#!/bin/bash

# 預設的證書檔案名稱
CERT_DIR="./certs"
CERT_FILE="${CERT_DIR}/server.crt"
KEY_FILE="${CERT_DIR}/server.key"

# 建立證書目錄（如果不存在）
mkdir -p "$CERT_DIR"

# 如果證書不存在，則生成自簽名憑證
if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "正在生成自簽名 SSL 憑證..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=US/ST=Test/L=Test/O=Test/OU=Test/CN=localhost"
  echo "憑證生成完成："
  echo " - 憑證：$CERT_FILE"
  echo " - 私鑰：$KEY_FILE"
fi

# 預設伺服器端口
PORT=8443

# 啟動 HTTPS Web Server
echo "啟動 HTTPS Web Server，端口：$PORT"
echo "訪問：https://localhost:$PORT"

# 使用 Python 啟動 HTTPS 伺服器
python3 - <<EOF
import http.server
import ssl

# 設定伺服器參數
server_address = ('', $PORT)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# 使用 SSLContext 替代 wrap_socket
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="$CERT_FILE", keyfile="$KEY_FILE")
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving on https://localhost:{server_address[1]}")
httpd.serve_forever()
EOF
