# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
 
WORKDIR /app
 
COPY package*.json ./
RUN npm ci --prefer-offline
 
COPY . .
RUN npm run build
 
# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner
 
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
 
# Copy built Angular app
COPY --from=builder /app/dist/superheroes/browser /usr/share/nginx/html
 
# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]