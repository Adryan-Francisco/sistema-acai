#!/bin/bash
set -e
echo "📦 Instalando dependências do servidor..."
cd server
npm ci
echo "✅ Servidor pronto para iniciar!"
