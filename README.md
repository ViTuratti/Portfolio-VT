# Portfólio · Victor Turatti

Site pessoal em HTML, CSS e JavaScript puros, sem build.

## Interações

- Abertura em terminal (só na primeira visita da sessão; clique ou tecla pula)
- Fundo com auroras, constelação de partículas que reage ao mouse e textura de grão
- Nome montado letra por letra, cargo digitando e cartão `victor_turatti.json` em 3D
- Cursor personalizado, botões magnéticos e holofote que segue o mouse nos cartões
- Projetos profissionais empilhando ao rolar; acadêmicos com inclinação 3D e borda em gradiente
- Linha do tempo que se preenche com a rolagem, contadores animados e barra de progresso
- Certificados com filtro por instituição, total de horas e miniaturas que ampliam
- Botão para copiar o e-mail

Quem prefere menos movimento (`prefers-reduced-motion`) recebe o site sem animações pesadas. No celular não há cursor personalizado nem inclinação.

## Como abrir

Abra o `index.html` no navegador, ou sirva a pasta:

```bash
npx serve .
```

## Como adicionar um certificado

1. Coloque o PDF em `certificados/`.
2. Gere a miniatura (imagem da primeira página) em `assets/img/certificados/`.
3. Acrescente um item em `assets/js/certificados.js`:

```js
{
  nome: "Nome do curso",
  emissor: "Alura",            // FIAP, Alura, Udemy e TOTVS já têm cor própria
  data: "2025-03",
  horas: 8,
  pdf: "certificados/arquivo.pdf",
  imagem: "assets/img/certificados/arquivo.jpg",
  validacao: "https://...",    // opcional
},
```

## Arquivos

```
index.html
assets/css/estilo.css
assets/js/site.js            todas as animações e interações
assets/js/certificados.js    lista de certificados
assets/img/                  capturas dos projetos e miniaturas dos certificados
certificados/                PDFs dos certificados
```
