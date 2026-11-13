// CASA · comportamento da página
// - "Aberto agora" com o dia e a hora reais de Gravataí (horário de Brasília)
// - Modo noite automático das 19h às 6h (forçar com ?turno=noite ou ?turno=dia)
// - Todo link de WhatsApp sai com a mensagem pronta e a saudação certa pra hora
(function () {
  'use strict';

  var WA_PHONE = '5551993494670';
  var TZ = 'America/Sao_Paulo';

  var MENSAGENS = {
    emergencia: 'Preciso de atendimento de emergência para o meu pet. Vocês podem atender agora?',
    agendar: 'Gostaria de agendar uma consulta para o meu pet.'
  };

  function horaSP(d) {
    var h = Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }).format(d));
    return h % 24;
  }

  function diaSemanaSP(d) {
    var curto = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d);
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[curto];
  }

  function textoAgora(d) {
    var dia = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'long' }).format(d).replace('-feira', '');
    var hm = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d);
    return dia + ', ' + hm;
  }

  function saudacao(h) {
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function linkWA(msg) {
    var texto = saudacao(horaSP(new Date())) + ', CASA! ' + msg;
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(texto);
  }

  function mensagemDe(el) {
    return el.getAttribute('data-wa-msg') || MENSAGENS[el.getAttribute('data-wa')] || MENSAGENS.agendar;
  }

  function atualizarLinks() {
    document.querySelectorAll('[data-wa], [data-wa-msg]').forEach(function (el) {
      el.href = linkWA(mensagemDe(el));
    });
  }

  function aplicarTurno(d) {
    var forcado = new URLSearchParams(location.search).get('turno');
    var h = horaSP(d);
    var noite = forcado ? forcado === 'noite' : (h >= 19 || h < 6);
    document.documentElement.setAttribute('data-turno', noite ? 'noite' : 'dia');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', noite ? '#14171B' : '#2E3136');
  }

  function atualizarRelogio() {
    var d = new Date();
    document.querySelectorAll('[data-agora]').forEach(function (el) { el.textContent = textoAgora(d); });
    var hoje = diaSemanaSP(d);
    document.querySelectorAll('.horas tr').forEach(function (tr) {
      tr.classList.toggle('hoje', Number(tr.getAttribute('data-dia')) === hoje);
    });
    aplicarTurno(d);
    atualizarLinks();
  }

  atualizarRelogio();
  setInterval(atualizarRelogio, 30000);

  // garante a saudação certa no momento do toque e marca a opção escolhida na lista de emergência
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-wa], [data-wa-msg]');
    if (!el) return;
    el.href = linkWA(mensagemDe(el));
    if (el.classList.contains('caso')) {
      document.querySelectorAll('.caso.marcado').forEach(function (c) { c.classList.remove('marcado'); });
      el.classList.add('marcado');
    }
  });

  // topo com linha depois de rolar; botão flutuante (desktop) depois do hero
  var topo = document.getElementById('topo');
  var hero = document.getElementById('inicio');
  var flutua = document.querySelector('.flutua');
  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle('rolou', y > 8);
    if (flutua && hero) flutua.classList.toggle('visivel', y > hero.offsetTop + hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
})();
