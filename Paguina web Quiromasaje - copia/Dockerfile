# Usamos una imagen ligera de Nginx para servir archivos estáticos
FROM nginx:alpine

# Copiamos todos los archivos de nuestra web al directorio por defecto de Nginx
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 (estándar para HTTP)
EXPOSE 80

# Nginx se inicia automáticamente, no hace falta CMD
