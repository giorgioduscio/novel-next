#!/bin/sh
# Mostra l'indirizzo IP da inserire nel browser di un'altro dispositivo per collegarsi
IP=$(ipconfig | grep -A 8 "Scheda LAN wireless Wi-Fi:" | grep "Indirizzo IPv4" | tail -1 | awk -F: '{print $2}' | tr -d ' ' | tr -d '\r')
if [ -z "$IP" ]; then
  IP=$(ipconfig | grep -A 8 "Scheda Ethernet" | grep "Indirizzo IPv4" | tail -1 | awk -F: '{print $2}' | tr -d ' ' | tr -d '\r')
fi
if [ -z "$IP" ]; then
  IP="localhost"
fi
echo "http://$IP:3000"
