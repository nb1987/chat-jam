# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./package*.json .

RUN npm install

# Copy all files
COPY . .

# Expose Vite's dev port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev"]
