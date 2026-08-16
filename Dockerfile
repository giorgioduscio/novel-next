# Usa un'immagine ufficiale Node.js basata su Alpine (leggera)
FROM node:20-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia solo package.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Espone la porta dell'applicazione (es. 3000)
EXPOSE 3000

# Comando di avvio
CMD ["npm", "run", "dev", "--", "--port", "3000"]