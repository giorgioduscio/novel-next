# Usa un'immagine ufficiale Node.js basata su Alpine (leggera)
FROM node:20-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia tutto il progetto Next.js
COPY . .

# Installa le dipendenze
RUN npm install

# Espone la porta dell'applicazione (es. 3000)
EXPOSE 3000

# Comando di avvio
CMD ["npm", "run", "dev"]