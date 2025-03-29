# Maven Dependency Visualization Dockerfile
FROM nginx:alpine

# Copy built frontend
COPY ../src/frontend /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
