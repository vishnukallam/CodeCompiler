# Use Node.js 20 on Debian (slim version for smaller image)
FROM node:20-slim

# Install Java 17 and Python 3
# We include python3-pip for package management
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the server source code
COPY . .

# Create temporary directories for code execution
RUN mkdir -p temp lib

# Expose the server port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
