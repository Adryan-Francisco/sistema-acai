import { formatDate, formatTime } from './dateUtils.js';

export const printReceipt = (pedido) => {
  const printWindow = window.open('', '', 'width=400,height=600');
  const complementosInclusos = pedido.detalhes_pedido?.complementos_padrao || [];
  const complementosAdicionais = pedido.detalhes_pedido?.complementos_adicionais || [];
  
  // Combinar complementos
  const todosComplementos = [
    ...complementosInclusos,
    ...complementosAdicionais.map(c => typeof c === 'object' ? c.nome : c)
  ];
  
  const totalComComplementos = complementosAdicionais.reduce((acc, c) => {
    return acc + (typeof c === 'object' ? c.preco || 0 : 0);
  }, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cupom #${pedido.id}</title>
      <meta charset="UTF-8">
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: 'Courier New', Courier, monospace; 
          padding: 15px; 
          font-size: 12px;
          line-height: 1.4;
          max-width: 350px;
          background: white;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 15px;
        }
        
        .header .logo {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        
        .header .subtitle {
          font-size: 12px;
          margin: 3px 0;
          color: #333;
        }
        
        .divider {
          border-bottom: 2px dashed #000;
          margin: 10px 0;
        }
        
        .client-section {
          background: #f5f5f5;
          border: 1px solid #999;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
        }
        
        .client-label {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 3px;
        }
        
        .client-name {
          font-size: 13px;
          font-weight: bold;
          margin: 3px 0;
        }
        
        .client-info {
          font-size: 10px;
          color: #555;
          margin: 2px 0;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 12px;
          margin: 12px 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .item-line {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-size: 11px;
          padding: 2px 0;
        }
        
        .item-name {
          flex: 1;
        }
        
        .item-value {
          text-align: right;
          margin-left: 10px;
        }
        
        .extras-list {
          list-style: none;
          padding: 0;
          margin: 5px 0;
        }
        
        .extras-list li {
          padding-left: 15px;
          position: relative;
          margin: 3px 0;
          font-size: 11px;
        }
        
        .extras-list li:before {
          content: "→";
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        
        .observacoes-box {
          background: #fff9e6;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 8px;
          margin: 10px 0;
          font-size: 10px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .total-section {
          background: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-size: 11px;
        }
        
        .total-line.subtotal {
          border-bottom: 1px dashed #999;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        
        .total-line.main-total {
          font-size: 14px;
          font-weight: bold;
          color: #d32f2f;
        }
        
        .status-line {
          margin: 10px 0;
          font-size: 11px;
          text-align: center;
          background: #e8f5e9;
          padding: 8px;
          border-radius: 4px;
          font-weight: bold;
          color: #2e7d32;
        }
        
        .payment-confirmed {
          text-align: center;
          margin: 10px 0;
          color: #2e7d32;
          font-weight: bold;
          background: #e8f5e9;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #4caf50;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
          color: #666;
          padding-top: 10px;
          border-top: 2px dashed #000;
        }
        
        .footer-text {
          margin: 4px 0;
        }
        
        @media print {
          body { 
            padding: 10px;
            width: 80mm;
            font-size: 11px;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🍇 AÇAÍ</div>
        <div class="subtitle">━━━━━━━━━━━</div>
        <div class="subtitle">CUPOM FISCAL</div>
        <div class="subtitle">Pedido #${pedido.id.substring(0, 8)}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="client-section">
        <div class="client-label">CLIENTE</div>
        <div class="client-name">${pedido.nome_cliente ? pedido.nome_cliente.toUpperCase() : 'NÃO INFORMADO'}</div>
        <div class="client-info">📅 ${formatDate(pedido.created_at)}</div>
        <div class="client-info">⏰ ${formatTime(pedido.created_at)}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="section-title">📦 PEDIDO</div>
      <div class="item-line">
        <div class="item-name"><strong>Tamanho:</strong></div>
        <div class="item-value">${pedido.detalhes_pedido?.tamanho || '-'}</div>
      </div>
      <div class="item-line">
        <div class="item-name"><strong>Tipo:</strong></div>
        <div class="item-value">${pedido.detalhes_pedido?.tipo_acai || 'Moda da Casa'}</div>
      </div>
      <div class="item-line">
        <div class="item-name"><strong>Pagamento:</strong></div>
        <div class="item-value">${pedido.detalhes_pedido?.metodo_pagamento || '-'}</div>
      </div>
      
      ${todosComplementos.length > 0 ? `
      <div class="section-title">✨ COMPLEMENTOS</div>
      <ul class="extras-list">
        ${todosComplementos.map(c => '<li>' + c + '</li>').join('')}
      </ul>
      ` : ''}
      
      ${pedido.observacoes ? `
      <div class="section-title">📝 OBSERVAÇÕES</div>
      <div class="observacoes-box">${pedido.observacoes}</div>
      ` : ''}
      
      <div class="divider"></div>
      
      <div class="total-section">
        <div class="total-line subtotal">
          <span>Subtotal:</span>
          <span>R$ ${(parseFloat(pedido.detalhes_pedido?.total || 0) - totalComComplementos).toFixed(2)}</span>
        </div>
        ${totalComComplementos > 0 ? `
        <div class="total-line">
          <span>Complementos:</span>
          <span>R$ ${totalComComplementos.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-line main-total">
          <span>TOTAL:</span>
          <span>R$ ${parseFloat(pedido.detalhes_pedido?.total || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div class="status-line">
        STATUS: ${pedido.status?.toUpperCase() || 'PENDENTE'}
      </div>
      
      ${pedido.payment_status === 'paid' ? `
      <div class="payment-confirmed">
        ✓ PAGAMENTO CONFIRMADO
      </div>
      ` : ''}
      
      <div class="footer">
        <div class="footer-text">Obrigado pela preferência!</div>
        <div class="footer-text">Acesse: www.acai.com.br</div>
        <div class="footer-text">━━━━━━━━━━━━━━━━</div>
        <div class="footer-text" style="font-size: 9px; color: #999;">
          Emitido em ${new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
