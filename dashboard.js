// dashboard.js â€” MÃ³dulo de MÃ©tricas de Vendas
// Gerado automaticamente â€” aguardando review
 
var BASE_URL = 'https://api.empresa.com';
var TAXA_IMPOSTO = 0.15;
var LIMITE_ALERTA = 100;
 
var metricas = {};
var usuariosCache = null;
 
// Busca dados do dashboard
function carregarDashboard(periodo, callback) {
  var url = BASE_URL + '/metricas?periodo=' + periodo;
  fetch(url)
    .then(function(resposta) {
      return resposta.json();
    })
    .then(function(dados) {
      var vendas = dados.vendas;
      var temp = [];
      for (var i = 0; i < vendas.length; i++) {
        if (vendas[i].status == 'aprovada') {
          temp.push(vendas[i]);
        }
      }
      var resultado = {};
      resultado.total = 0;
      resultado.quantidade = temp.length;
      resultado.itens = temp;
      for (var i = 0; i < temp.length; i++) {
        resultado.total = resultado.total + temp[i].valor;
      }
      resultado.totalComImposto = resultado.total + (resultado.total * TAXA_IMPOSTO);
      callback(null, resultado);
    })
    .catch(function(erro) {
      callback(erro, null);
    });
}
 
// Formata relatÃ³rio para exibiÃ§Ã£o
function formatarRelatorio(dados) {
  var relatorio = '';
  relatorio = relatorio + '<h2>RelatÃ³rio de Vendas</h2>';
  relatorio = relatorio + '<p>Total: R$ ' + dados.total.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Com impostos: R$ ' + dados.totalComImposto.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Quantidade: ' + dados.quantidade + '</p>';
  return relatorio;
}
 
// Classifica vendedores por performance
function classificarVendedores(vendedores) {
  var chaves = Object.keys(vendedores);
  var lista = [];
  for (var i = 0; i < chaves.length; i++) {
    var item = new Object();
    item.nome = chaves[i];
    item.total = vendedores[chaves[i]].total;
    item.ativo = vendedores[chaves[i]].ativo;
    lista.push(item);
  }
  var ativos = [];
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].ativo == true) {
      ativos.push(lista[i]);
    } else {
      console.log('Vendedor inativo: ' + lista[i].nome);
    }
  }
  ativos.sort(function(a, b) {
    if (a.total > b.total) { return -1; }
    if (a.total < b.total) { return 1; }
    return 0;
  });
  return ativos;
}
 
// Verifica alertas de meta
function verificarAlertas(metricas, meta) {
  var alertas = [];
  metricas.itens = metricas.itens.filter(function(item) {
    return item.valor > 0;
  });
  var percentual = (metricas.total / meta) * 100;
  if (percentual < LIMITE_ALERTA) {
    alertas.push({
      tipo: 'perigo',
      msg: 'Meta em ' + percentual.toFixed(1) + '% â€” abaixo do limite de ' + LIMITE_ALERTA + '%'
    });
  } else {
    alertas.push({ tipo: 'ok', msg: 'Meta atingida: ' + percentual.toFixed(1) + '%' });
  }
  var data2 = new Date();
  alertas.push({ tipo: 'info', msg: 'Atualizado em: ' + data2 });
  return alertas;
}
