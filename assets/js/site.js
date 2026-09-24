"use strict";

const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* =========================================================
   Nome letra por letra
   ========================================================= */
function dividirLetras() {
  let i = 0;
  $$("[data-dividir]").forEach((linha) => {
    const texto = linha.textContent;
    linha.setAttribute("aria-label", texto);
    linha.textContent = "";
    linha.style.setProperty("--n", texto.length);
    [...texto].forEach((letra, j) => {
      const span = document.createElement("span");
      span.className = "letra";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", i++);
      span.style.setProperty("--j", j);
      span.textContent = letra;
      linha.append(span);
    });
  });
}

/* =========================================================
   Cargo digitando e apagando
   ========================================================= */
async function digitarCargos() {
  const alvo = $("#cargo");
  const cargos = JSON.parse(alvo.dataset.cargos);
  if (menosMovimento) return;

  let indice = 0;
  await esperar(2200);
  for (;;) {
    const atual = cargos[indice];
    for (let c = atual.length; c >= 0; c--) {
      alvo.textContent = atual.slice(0, c);
      await esperar(28);
    }
    indice = (indice + 1) % cargos.length;
    const proximo = cargos[indice];
    for (let c = 1; c <= proximo.length; c++) {
      alvo.textContent = proximo.slice(0, c);
      await esperar(55);
    }
    await esperar(2200);
  }
}

/* =========================================================
   JSON digitado na janela do hero
   ========================================================= */
const JSON_TOKENS = [
  ["p", "{\n"],
  ["c", '  "nome"'], ["p", ": "], ["s", '"Victor Turatti de Oliveira"'], ["p", ",\n"],
  ["c", '  "idade"'], ["p", ": "], ["n", "24"], ["p", ",\n"],
  ["c", '  "formação"'], ["p", ": "], ["s", '"Engenharia da Computação"'], ["p", ",\n"],
  ["c", '  "cargo"'], ["p", ": "], ["s", '"Analista de TI"'], ["p", ",\n"],
  ["c", '  "empresa"'], ["p", ": "], ["s", '"EndoMaster"'], ["p", ",\n"],
  ["c", '  "especialidades"'], ["p", ": [\n"],
  ["s", '    "ERP Protheus"'], ["p", ",\n"],
  ["s", '    "Infraestrutura de TI"'], ["p", ",\n"],
  ["s", '    "Desenvolvimento Web"'], ["p", "\n  ],\n"],
  ["c", '  "café"'], ["p", ": "], ["b", "true"], ["p", "\n}"],
];

async function digitarJson() {
  const alvo = $("#codigo-json");
  const cursor = document.createElement("span");
  cursor.className = "caret-codigo";

  if (menosMovimento) {
    for (const [classe, texto] of JSON_TOKENS) {
      const span = document.createElement("span");
      span.className = classe;
      span.textContent = texto;
      alvo.append(span);
    }
    return;
  }

  await esperar(700);
  alvo.append(cursor);
  for (const [classe, texto] of JSON_TOKENS) {
    const span = document.createElement("span");
    span.className = classe;
    alvo.insertBefore(span, cursor);
    for (let c = 1; c <= texto.length; c += 2) {
      span.textContent = texto.slice(0, c);
      await esperar(9);
    }
    span.textContent = texto;
  }
}

/* =========================================================
   Circuitos: trilhas de placa com pulsos de luz.
   As trilhas perto do mouse acendem.
   ========================================================= */
function circuitos() {
  const canvas = $("#circuitos");
  const ctx = canvas.getContext("2d");
  const CELULA = 36;
  // Direções de trilha de placa: horizontal, vertical e diagonais de 45°
  const DIRECOES = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const mouse = { x: -9999, y: -9999, ativo: false };
  let largura = 0, altura = 0, dpr = 1;
  let trilhas = [];
  let pulsos = [];
  let camadaApagada, camadaAcesa, mascara;

  const novaCamada = () => {
    const c = document.createElement("canvas");
    c.width = largura * dpr;
    c.height = altura * dpr;
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  };

  // Uma trilha: começa num ponto da grade e dobra algumas vezes
  function criarTrilha() {
    const colunas = Math.ceil(largura / CELULA);
    const linhas = Math.ceil(altura / CELULA);
    let x = Math.floor(Math.random() * colunas) * CELULA;
    let y = Math.floor(Math.random() * linhas) * CELULA;
    const pontos = [[x, y]];
    let direcao = DIRECOES[Math.floor(Math.random() * 4)];
    const segmentos = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segmentos; s++) {
      const passos = 2 + Math.floor(Math.random() * 6);
      x += direcao[0] * passos * CELULA;
      y += direcao[1] * passos * CELULA;
      pontos.push([x, y]);
      // Dobra 45° ou 90°, como numa placa de verdade
      const opcoes = DIRECOES.filter(([dx, dy]) => {
        const produto = dx * direcao[0] + dy * direcao[1];
        return produto >= 0 && !(dx === direcao[0] && dy === direcao[1]);
      });
      direcao = opcoes[Math.floor(Math.random() * opcoes.length)];
    }
    // Comprimento acumulado, para o pulso andar em velocidade constante
    let total = 0;
    const trechos = [];
    for (let i = 1; i < pontos.length; i++) {
      const comp = Math.hypot(pontos[i][0] - pontos[i - 1][0], pontos[i][1] - pontos[i - 1][1]);
      trechos.push({ de: pontos[i - 1], para: pontos[i], inicio: total, comp });
      total += comp;
    }
    return { pontos, trechos, total };
  }

  function pontoEm(trilha, distancia) {
    const d = Math.max(0, Math.min(trilha.total, distancia));
    const t = trilha.trechos.find((tr) => d <= tr.inicio + tr.comp) ?? trilha.trechos.at(-1);
    const f = t.comp ? (d - t.inicio) / t.comp : 0;
    return [t.de[0] + (t.para[0] - t.de[0]) * f, t.de[1] + (t.para[1] - t.de[1]) * f];
  }

  function desenharTrilhas(camada, alfaLinha, alfaPad) {
    const g = camada.getContext("2d");
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const trilha of trilhas) {
      g.strokeStyle = `rgba(47, 123, 255, ${alfaLinha})`;
      g.lineWidth = 1.2;
      g.beginPath();
      trilha.pontos.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      // Pads nas pontas: anel com furo, como uma via de placa
      for (const [x, y] of [trilha.pontos[0], trilha.pontos.at(-1)]) {
        g.fillStyle = `rgba(0, 209, 255, ${alfaPad})`;
        g.beginPath();
        g.arc(x, y, 3.2, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#05080F";
        g.beginPath();
        g.arc(x, y, 1.3, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  // Trilhas cuja ponta ou algum ponto de dobra está perto de (x, y)
  function trilhasPerto(x, y, raio) {
    return trilhas.filter((t) => t.pontos.some(([px, py]) => Math.hypot(px - x, py - y) < raio));
  }

  function criar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const quantidade = Math.round(Math.min(70, Math.max(22, (largura * altura) / 26000)));
    trilhas = Array.from({ length: quantidade }, criarTrilha);
    pulsos = [];

    camadaApagada = novaCamada();
    camadaAcesa = novaCamada();
    mascara = novaCamada();
    desenharTrilhas(camadaApagada, 0.08, 0.16);
    desenharTrilhas(camadaAcesa, 0.55, 0.75);
  }

  function novoPulso(trilha = trilhas[Math.floor(Math.random() * trilhas.length)], forte = false) {
    pulsos.push({
      trilha,
      pos: 0,
      velocidade: 0.8 + Math.random() * 0.8,
      cauda: 50 + Math.random() * 40,
      cor: forte || Math.random() < 0.7 ? "0, 209, 255" : "47, 123, 255",
    });
  }

  function quadro() {
    ctx.clearRect(0, 0, largura, altura);
    ctx.drawImage(camadaApagada, 0, 0, largura, altura);

    // Trilhas acesas perto do mouse, com borda suave
    if (mouse.ativo) {
      const m = mascara.getContext("2d");
      m.save();
      m.setTransform(1, 0, 0, 1, 0, 0);
      m.clearRect(0, 0, mascara.width, mascara.height);
      m.restore();
      m.globalCompositeOperation = "source-over";
      m.drawImage(camadaAcesa, 0, 0, largura, altura);
      m.globalCompositeOperation = "destination-in";
      const luz = m.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
      luz.addColorStop(0, "rgba(0,0,0,0.9)");
      luz.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = luz;
      m.fillRect(0, 0, largura, altura);
      m.globalCompositeOperation = "source-over";
      ctx.drawImage(mascara, 0, 0, largura, altura);
    }

    // Pulsos de luz correndo pelas trilhas
    if (pulsos.length < 5 && Math.random() < 0.02) novoPulso();
    ctx.lineCap = "round";
    for (const p of pulsos) {
      p.pos += p.velocidade;
      const passos = 8;
      for (let i = 0; i < passos; i++) {
        const [x1, y1] = pontoEm(p.trilha, p.pos - (p.cauda * i) / passos);
        const [x2, y2] = pontoEm(p.trilha, p.pos - (p.cauda * (i + 1)) / passos);
        ctx.strokeStyle = `rgba(${p.cor}, ${0.7 * (1 - i / passos)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      const [x, y] = pontoEm(p.trilha, p.pos);
      const brilho = ctx.createRadialGradient(x, y, 0, x, y, 10);
      brilho.addColorStop(0, `rgba(${p.cor}, 0.9)`);
      brilho.addColorStop(1, `rgba(${p.cor}, 0)`);
      ctx.fillStyle = brilho;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    pulsos = pulsos.filter((p) => p.pos - p.cauda < p.trilha.total);

    if (!document.hidden) requestAnimationFrame(quadro);
  }

  criar();
  window.addEventListener("resize", () => {
    criar();
    if (menosMovimento) ctx.drawImage(camadaApagada, 0, 0, largura, altura);
  });

  if (menosMovimento) {
    // Só as trilhas paradas, sem pulsos nem luz do mouse
    ctx.drawImage(camadaApagada, 0, 0, largura, altura);
    return;
  }

  let ultimoPulsoMouse = 0;
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.ativo = e.pointerType === "mouse";
    const agora = performance.now();
    if (mouse.ativo && agora - ultimoPulsoMouse > 350 && pulsos.length < 14) {
      const perto = trilhasPerto(e.clientX, e.clientY, 120);
      if (perto.length) {
        ultimoPulsoMouse = agora;
        novoPulso(perto[Math.floor(Math.random() * perto.length)], true);
      }
    }
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    trilhasPerto(e.clientX, e.clientY, 200).slice(0, 8).forEach((t) => novoPulso(t, true));
  });
  document.addEventListener("pointerleave", () => (mouse.ativo = false));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(quadro); });
  requestAnimationFrame(quadro);
}

/* =========================================================
   Interações de rolagem
   - títulos sobem palavra por palavra
   - rótulos <secao /> se digitam ao aparecer
   - o topo some suavemente e o cartão do topo tem parallax
   - capturas dos projetos com parallax
   - o menu some ao descer e volta ao subir
   ========================================================= */
function interacoesRolagem() {
  // Títulos palavra por palavra (o gradiente vai para cada palavra)
  let n = 0;
  $$(".secao-titulo, .contato-titulo").forEach((titulo) => {
    n = 0;
    titulo.setAttribute("aria-label", titulo.textContent.replace(/\s+/g, " ").trim());
    const nos = [...titulo.childNodes];
    titulo.textContent = "";
    for (const no of nos) {
      const gradiente = no.nodeType === 1 && no.classList.contains("gradiente");
      const palavras = no.textContent.split(/\s+/).filter(Boolean);
      palavras.forEach((palavra) => {
        const fora = document.createElement("span");
        fora.className = "palavra";
        fora.setAttribute("aria-hidden", "true");
        const dentro = document.createElement("span");
        dentro.className = "palavra-in" + (gradiente ? " gradiente" : "");
        dentro.style.setProperty("--w", n++);
        dentro.textContent = palavra;
        fora.append(dentro);
        titulo.append(fora, " ");
      });
    }
  });

  // Rótulos que se digitam
  const rotulos = $$(".secao-tag");
  rotulos.forEach((r) => { r.dataset.texto = r.textContent; r.style.minHeight = "1.7em"; });
  if (!menosMovimento) {
    rotulos.forEach((r) => (r.textContent = ""));
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach(async (e) => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const texto = e.target.dataset.texto;
        for (let i = 1; i <= texto.length; i++) {
          e.target.textContent = texto.slice(0, i);
          await esperar(35);
        }
      });
    }, { threshold: 1 });
    rotulos.forEach((r) => obs.observe(r));
  }

  if (menosMovimento) return;

  const topo = $(".topo");
  const heroTexto = $(".hero-texto");
  const heroCartao = $(".hero-cartao-area");
  const visuais = $$(".pilha-visual");
  const imagensAcad = $$(".cartao-acad-imagem img");
  let anterior = window.scrollY;
  let pendente = false;

  function atualizar() {
    pendente = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Menu some ao descer e volta ao subir
    if (y > 500 && y > anterior + 4 && !$("#nav-links").classList.contains("aberto")) topo.classList.add("escondido");
    else if (y < anterior - 4 || y < 500) topo.classList.remove("escondido");
    anterior = y;

    // Topo: o texto se afasta e o cartão fica para trás
    if (y < vh * 1.2) {
      const t = Math.min(1, y / vh);
      heroTexto.style.transform = `translateY(${y * 0.22}px)`;
      heroTexto.style.opacity = String(1 - t * 0.9);
      heroCartao.style.translate = `0 ${y * 0.1}px`;
      heroCartao.style.opacity = String(1 - t * 0.7);
    }

    // Parallax nas capturas dos projetos profissionais
    for (const v of visuais) {
      const r = v.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const centro = (r.top + r.height / 2 - vh / 2) / vh;
      v.querySelector(".navegador").style.translate = `0 ${centro * -24}px`;
      v.querySelector(".celular").style.translate = `0 ${centro * -70}px`;
    }

    // Imagens dos acadêmicos deslizam dentro da moldura
    for (const img of imagensAcad) {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const centro = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.setProperty("--par", `${centro * 30}px`);
    }
  }

  window.addEventListener("scroll", () => {
    if (!pendente) {
      pendente = true;
      requestAnimationFrame(atualizar);
    }
  }, { passive: true });
  atualizar();
}

/* =========================================================
   Botões magnéticos, inclinação 3D e holofote
   ========================================================= */
function interacoesPonteiro() {
  if (!ponteiroFino || menosMovimento) return;

  $$(".magnetico").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });

  $$(".inclinar").forEach((el) => {
    const intensidade = Number(el.dataset.intensidade) || 10;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * intensidade * 2}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * intensidade * 2}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  // O cartão do hero também reage ao mouse em qualquer ponto da tela
  const cartaoHero = $(".hero .cartao-3d");
  window.addEventListener("pointermove", (e) => {
    if (window.scrollY > window.innerHeight) return;
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    cartaoHero.style.setProperty("--ry", `${px * 14}deg`);
    cartaoHero.style.setProperty("--rx", `${-py * 12}deg`);
  });

  const holofotes = $$(".holofote");
  window.addEventListener("pointermove", (e) => {
    for (const el of holofotes) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  });
}

/* =========================================================
   Revelar ao rolar e contadores
   ========================================================= */
function revelarAoRolar() {
  // Irmãos entram em cascata
  const grupos = new Map();
  $$(".revelar").forEach((el) => {
    const pai = el.parentElement;
    const i = grupos.get(pai) ?? 0;
    el.style.setProperty("--atraso", `${Math.min(i, 5) * 0.1}s`);
    grupos.set(pai, i + 1);
  });

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        $$("[data-contar]", entrada.target).forEach(contar);
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  $$(".revelar").forEach((el) => observador.observe(el));
}

function contar(el) {
  const alvo = Number(el.dataset.contar);
  if (menosMovimento) {
    el.textContent = alvo;
    return;
  }
  const inicio = performance.now();
  const duracao = 1400;
  (function passo(agora) {
    const t = Math.min((agora - inicio) / duracao, 1);
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(passo);
  })(inicio);
}

/* =========================================================
   Rolagem: progresso, topo, linha do tempo e pilha de projetos
   ========================================================= */
function aoRolar() {
  const topo = $(".topo");
  const progresso = $(".progresso");
  const trilho = $(".linha-tempo-trilho");
  const linhaTempo = $(".linha-tempo");
  const cartoes = $$(".pilha-cartao");
  cartoes.forEach((c, i) => c.style.setProperty("--posicao", i));
  let pendente = false;

  function atualizar() {
    pendente = false;
    const rolado = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progresso.style.setProperty("--p", total > 0 ? rolado / total : 0);
    topo.classList.toggle("rolou", rolado > 40);

    // Linha do tempo preenche até o meio da tela
    const r = linhaTempo.getBoundingClientRect();
    const preenchido = (window.innerHeight * 0.6 - r.top) / r.height;
    trilho.style.setProperty("--preenchido", Math.max(0, Math.min(1, preenchido)));

    // Cada cartão da pilha encolhe quando o próximo sobe por cima
    if (window.innerWidth > 960) {
      cartoes.forEach((cartao, i) => {
        const proximo = cartoes[i + 1];
        if (!proximo) return;
        const distancia = proximo.getBoundingClientRect().top - cartao.getBoundingClientRect().top;
        const progressoPilha = Math.max(0, Math.min(1, 1 - distancia / cartao.offsetHeight));
        cartao.style.setProperty("--escala", 1 - progressoPilha * 0.06);
        cartao.style.setProperty("--brilho", 1 - progressoPilha * 0.35);
      });
    }
  }

  window.addEventListener("scroll", () => {
    if (!pendente) {
      pendente = true;
      requestAnimationFrame(atualizar);
    }
  }, { passive: true });
  window.addEventListener("resize", atualizar);
  atualizar();
}

/* =========================================================
   Navegação: pílula deslizante, seção ativa e menu do celular
   ========================================================= */
function navegacao() {
  const linksBox = $("#nav-links");
  const pilula = $(".nav-pilula");
  const botao = $(".nav-botao");
  const links = $$("a", linksBox);
  links.forEach((a, i) => a.style.setProperty("--i", i));

  function moverPilula(link) {
    if (!link) {
      pilula.style.setProperty("--o", 0);
      return;
    }
    pilula.style.setProperty("--l", `${link.offsetLeft}px`);
    pilula.style.setProperty("--w", `${link.offsetWidth}px`);
    pilula.style.setProperty("--o", 1);
  }

  const ativo = () => links.find((a) => a.getAttribute("aria-current") === "true");
  links.forEach((a) => a.addEventListener("pointerenter", () => moverPilula(a)));
  linksBox.addEventListener("pointerleave", () => moverPilula(ativo()));

  const secoes = [$("#inicio"), ...links.map((a) => $(a.getAttribute("href")))].filter((s) => s && !s.hidden);
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute("href") === `#${entrada.target.id}`) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
        moverPilula(ativo());
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  secoes.forEach((s) => observador.observe(s));

  function alternar(abrir) {
    linksBox.classList.toggle("aberto", abrir);
    botao.setAttribute("aria-expanded", String(abrir));
    $(".sr-only", botao).textContent = abrir ? "Fechar menu" : "Abrir menu";
    document.body.style.overflow = abrir ? "hidden" : "";
  }
  botao.addEventListener("click", () => alternar(!linksBox.classList.contains("aberto")));
  links.forEach((a) => a.addEventListener("click", () => alternar(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && linksBox.classList.contains("aberto")) {
      alternar(false);
      botao.focus();
    }
  });
}

/* =========================================================
   Copiar e-mail e imagem ampliada
   ========================================================= */
function avisar(mensagem) {
  const aviso = $("#aviso");
  aviso.textContent = mensagem;
  aviso.classList.add("visivel");
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => aviso.classList.remove("visivel"), 2200);
}

function copiarEmail() {
  $$("[data-copiar]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(botao.dataset.copiar);
        botao.classList.add("copiado");
        $(".copiar-texto", botao).textContent = "Copiado ✓";
        avisar("E-mail copiado para a área de transferência");
        setTimeout(() => {
          botao.classList.remove("copiado");
          $(".copiar-texto", botao).textContent = "Copiar e-mail";
        }, 2200);
      } catch {
        avisar("Não deu para copiar. Selecione o e-mail e copie manualmente.");
      }
    });
  });
}

function ampliarImagens() {
  const dialogo = $("#ampliacao");
  const imagem = $("img", dialogo);
  const legenda = $(".ampliacao-legenda", dialogo);

  $$("[data-ampliar]").forEach((el) => {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `Ampliar: ${el.dataset.legenda}`);
    const abrir = () => {
      imagem.src = el.dataset.ampliar;
      imagem.alt = $("img", el)?.alt ?? "";
      legenda.textContent = el.dataset.legenda ?? "";
      dialogo.showModal();
    };
    el.addEventListener("click", abrir);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    });
  });
  dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
}

/* =========================================================
   Certificados (lista em assets/js/certificados.js)
   ========================================================= */
// Cor de cada instituição, usada no selo e no brilho do cartão
const CORES_EMISSOR = { FIAP: "#ED145B", Alura: "#3FA9F5", Udemy: "#A435F0", TOTVS: "#FF7A45" };
const VISIVEIS_DE_INICIO = 6;

function certificados() {
  const lista = Array.isArray(window.CERTIFICADOS) ? window.CERTIFICADOS : [];
  if (!lista.length) {
    $("[data-certificados]")?.remove();
    return;
  }

  const mesAno = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" });
  const horas = (h) => `${String(h).replace(".", ",")} h`;
  const criar = (tag, classe, texto) => {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto != null) el.textContent = texto;
    return el;
  };
  const link = (href, texto) => {
    const a = criar("a", "certificado-link", texto);
    a.href = encodeURI(href);
    a.target = "_blank";
    a.rel = "noopener";
    a.append(criar("span", null, " ↗"));
    return a;
  };

  const itens = lista.map((c) => {
    const li = criar("li", "certificado");
    li.dataset.emissor = c.emissor;
    li.style.setProperty("--marca", CORES_EMISSOR[c.emissor] ?? "#2F7BFF");

    const imagem = criar("div", "certificado-imagem");
    imagem.dataset.ampliar = c.imagem;
    imagem.dataset.legenda = `${c.nome} · ${c.emissor}`;
    const img = criar("img");
    img.src = c.imagem;
    img.alt = `Certificado: ${c.nome}, ${c.emissor}`;
    img.loading = "lazy";
    img.width = 900;
    img.height = 636;
    imagem.append(img);

    const corpo = criar("div", "certificado-corpo");
    const [ano, mes] = String(c.data).split("-").map(Number);
    corpo.append(
      criar("span", "certificado-emissor", c.emissor),
      criar("h3", null, c.nome),
      criar("p", "certificado-meta", `${mesAno.format(new Date(ano, mes - 1))} · ${horas(c.horas)}`)
    );
    const links = criar("div", "certificado-links");
    links.append(link(c.pdf, "Abrir PDF"));
    if (c.validacao) links.append(link(c.validacao, "Validar"));
    corpo.append(links);

    li.append(imagem, corpo);
    return li;
  });

  const ul = $("#lista-certificados");
  ul.replaceChildren(...itens);
  $("#certificados").hidden = false;

  // Filtros por instituição, com contagem
  const contagem = lista.reduce((m, c) => m.set(c.emissor, (m.get(c.emissor) ?? 0) + 1), new Map());
  const filtros = [["Todos", lista.length], ...[...contagem].sort((a, b) => b[1] - a[1])];
  const caixaFiltros = $("#cert-filtros");
  let filtro = "Todos";
  let expandido = false;
  const botaoMais = $("#cert-mais");

  caixaFiltros.replaceChildren(...filtros.map(([nome, qtd]) => {
    const b = criar("button", "cert-filtro");
    b.type = "button";
    b.dataset.filtro = nome;
    b.setAttribute("aria-pressed", String(nome === filtro));
    if (CORES_EMISSOR[nome]) b.style.setProperty("--marca", CORES_EMISSOR[nome]);
    b.append(criar("span", null, nome), criar("span", "cert-filtro-qtd", qtd));
    return b;
  }));

  function aplicar() {
    const doFiltro = itens.filter((li) => filtro === "Todos" || li.dataset.emissor === filtro);
    const limite = expandido || filtro !== "Todos" ? Infinity : VISIVEIS_DE_INICIO;
    itens.forEach((li) => (li.hidden = true));
    doFiltro.forEach((li, i) => {
      if (i >= limite) return;
      li.hidden = false;
      // Reinicia a animação de entrada, em cascata
      li.classList.remove("entrando");
      li.style.setProperty("--atraso", `${Math.min(i, 8) * 50}ms`);
      void li.offsetWidth;
      li.classList.add("entrando");
    });
    // "Ver todos / Mostrar menos" só faz sentido sem filtro
    botaoMais.parentElement.hidden = filtro !== "Todos" || doFiltro.length <= VISIVEIS_DE_INICIO;
    $("span", botaoMais).textContent = expandido ? "Mostrar menos" : `Ver todos os ${lista.length}`;
  }

  caixaFiltros.addEventListener("click", (e) => {
    const b = e.target.closest(".cert-filtro");
    if (!b) return;
    filtro = b.dataset.filtro;
    $$(".cert-filtro", caixaFiltros).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    aplicar();
  });
  botaoMais.addEventListener("click", () => {
    expandido = !expandido;
    aplicar();
    if (!expandido) $("#certificados").scrollIntoView({ behavior: menosMovimento ? "auto" : "smooth" });
  });
  aplicar();
}

/* =========================================================
   Início
   ========================================================= */
certificados();
dividirLetras();
navegacao();
aoRolar();
circuitos();
interacoesRolagem();
revelarAoRolar();
interacoesPonteiro();
copiarEmail();
ampliarImagens();

// Sem tela de carregamento: o topo entra assim que a página abre
requestAnimationFrame(() => document.body.classList.add("pronto"));
digitarJson();
digitarCargos();
