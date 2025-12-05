docker exec nginx-gateway cat /etc/nginx/nginx.conf 2>/dev/null || docker exec nginx-gateway cat /etc/nginx/conf.d/default.conf 2>/dev/null

docker exec nginx-gateway ls -la /etc/nginx/conf.d/

