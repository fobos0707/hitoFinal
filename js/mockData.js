/* ==========================================================================
   RITMO · Hito 2 · mockData.js
   Datos simulados que hacen de "base de datos" del Proyecto 1.
   Se cargan como script clásico (no módulo ES) para que la web funcione
   también abriendo los .html con doble clic (file://), donde los módulos
   quedan bloqueados por CORS.

   Tablas simuladas:  usuarios · categorias · recintos · eventos
   (cada evento incluye embebidos su line-up y sus tipos de entrada, como
   si fueran las tablas hijas artista_evento y tipo_entrada ya unidas).
   ========================================================================== */
(function () {
  'use strict';
  var Ritmo = (window.Ritmo = window.Ritmo || {});

  var IMG = {
    festival: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85',
    indie:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    house:    'https://images.unsplash.com/photo-1603910234616-3b5f4a6be2b4?auto=format&fit=crop&w=1200&q=85',
    crowd:    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85',
    live:     'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85',
    stage:    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85',
    rock:     'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=85',
    jazz:     'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1200&q=85'
  };

  /* --- Tabla USUARIOS (demo). En un backend real la contraseña NUNCA se
         guardaría en claro: aquí es solo una simulación didáctica. -------- */
  var usuarios = [
    { id: 1, nombre: 'Marina Costa', email: 'marina@ritmo.com', password: 'Ritmo2026', rol: 'Exploradora musical' },
    { id: 2, nombre: 'Lucas Martín', email: 'lucas@ritmo.com', password: 'Ritmo2026', rol: 'Organizador' }
  ];

  /* --- Tabla CATEGORIAS (géneros). El orden define el de los filtros. ---- */
  var categorias = [
    { slug: 'electronica', nombre: 'Electrónica' },
    { slug: 'indie',       nombre: 'Indie' },
    { slug: 'pop',         nombre: 'Pop' },
    { slug: 'rock',        nombre: 'Rock' },
    { slug: 'jazz',        nombre: 'Jazz' }
  ];

  /* --- Tabla RECINTOS ---------------------------------------------------- */
  var recintos = [
    { id: 'wizink',      nombre: 'WiZink Center',  ciudad: 'Madrid' },
    { id: 'riviera',     nombre: 'La Riviera',     ciudad: 'Madrid' },
    { id: 'barcelo',     nombre: 'Sala Barceló',   ciudad: 'Madrid' },
    { id: 'berlin',      nombre: 'Café Berlín',    ciudad: 'Madrid' },
    { id: 'razzmatazz',  nombre: 'Razzmatazz',     ciudad: 'Barcelona' },
    { id: 'apolo',       nombre: 'Sala Apolo',     ciudad: 'Barcelona' }
  ];

  /* --- Tabla EVENTOS (array de objetos) ----------------------------------
     fecha: ISO "AAAA-MM-DD" · hora: "HH:MM" · destacado: sale en la parte
     superior del dashboard. entradas[].disponibles: stock simulado.        */
  var eventos = [
    {
      id: 'neon-pulse', titulo: 'Neon Pulse Festival',
      categoria: 'electronica', etiqueta: 'Electrónica',
      fecha: '2026-05-24', hora: '20:30', horaFin: '05:00', recintoId: 'wizink',
      imagen: IMG.festival, destacado: true,
      subtitulo: 'Una noche. Tres escenarios. Energía infinita.',
      tituloDescripcion: 'La ciudad se ilumina esta noche',
      descripcion: 'Neon Pulse reúne a los artistas más vibrantes de la escena electrónica en una experiencia audiovisual inmersiva. Prepárate para sentir el ritmo, perder la noción del tiempo y bailar hasta el amanecer.',
      lineup: [
        { nombre: 'Luna K',  estilo: 'Techno melódico',   hora: '00:30', foto: 'https://images.unsplash.com/photo-1619229725920-ac8b63b0631a?auto=format&fit=crop&w=200&q=80' },
        { nombre: 'Solaris', estilo: 'Progressive house', hora: '23:00', foto: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=200&q=80' },
        { nombre: 'NØVA',    estilo: 'Electropop',        hora: '21:30', foto: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?auto=format&fit=crop&w=200&q=80' }
      ],
      entradas: [
        { tipo: 'General',        descripcion: 'Acceso al recinto',     precio: 42, disponibles: 120 },
        { tipo: 'VIP Experience', descripcion: 'Fast lane + zona VIP',  precio: 89, disponibles: 18 }
      ]
    },
    {
      id: 'indie-nights', titulo: 'Indie Nights',
      categoria: 'indie', etiqueta: 'Indie rock',
      fecha: '2026-06-07', hora: '21:00', horaFin: '00:30', recintoId: 'riviera',
      imagen: IMG.indie, destacado: true,
      subtitulo: 'Guitarras, melodías y noches que se alargan.',
      tituloDescripcion: 'Lo mejor del indie nacional en una sola noche',
      descripcion: 'Cuatro bandas emergentes y un cabeza de cartel para llenar La Riviera de guitarras. Un cartel pensado para quienes descubren música nueva cada semana.',
      lineup: [
        { nombre: 'Los Domingos',    estilo: 'Indie rock',   hora: '21:00' },
        { nombre: 'Paloma Sur',      estilo: 'Dream pop',    hora: '22:00' },
        { nombre: 'Cometa Eléctrico', estilo: 'Indie rock',  hora: '23:15' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso a pista', precio: 28, disponibles: 200 },
        { tipo: 'Grada',   descripcion: 'Asiento numerado', precio: 38, disponibles: 40 }
      ]
    },
    {
      id: 'electric-bloom', titulo: 'Electric Bloom',
      categoria: 'electronica', etiqueta: 'House',
      fecha: '2026-06-18', hora: '22:00', horaFin: '04:00', recintoId: 'razzmatazz',
      imagen: IMG.house, destacado: true,
      subtitulo: 'House de la mañana a la noche.',
      tituloDescripcion: 'Seis horas de house sin pausa',
      descripcion: 'La sala grande de Razzmatazz se llena de flores de neón y bajos cálidos. Sesiones largas, sonido impecable y la mejor pista de Barcelona.',
      lineup: [
        { nombre: 'Marea',   estilo: 'Deep house',  hora: '22:00' },
        { nombre: 'Kito B.', estilo: 'Tech house',  hora: '00:00' },
        { nombre: 'Aura',    estilo: 'House',       hora: '02:00' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso al recinto', precio: 35, disponibles: 150 },
        { tipo: 'VIP Experience', descripcion: 'Zona reservada + copa', precio: 70, disponibles: 12 }
      ]
    },
    {
      id: 'amplificados', titulo: 'Amplificados',
      categoria: 'rock', etiqueta: 'Rock',
      fecha: '2026-07-04', hora: '21:30', horaFin: '01:00', recintoId: 'apolo',
      imagen: IMG.rock, destacado: false,
      subtitulo: 'Riffs, sudor y volumen al máximo.',
      tituloDescripcion: 'El rock suena fuerte en Barcelona',
      descripcion: 'Una noche de rock de los de siempre: tres bandas, dos amplificadores por cabeza y cero concesiones. Tapones recomendados.',
      lineup: [
        { nombre: 'Hierro Dulce',  estilo: 'Hard rock',   hora: '21:30' },
        { nombre: 'Los Cuervos',   estilo: 'Rock urbano', hora: '22:45' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso a pista', precio: 31, disponibles: 180 }
      ]
    },
    {
      id: 'aurora-tour', titulo: 'Aurora Tour',
      categoria: 'pop', etiqueta: 'Pop',
      fecha: '2026-06-27', hora: '21:00', horaFin: '23:30', recintoId: 'wizink',
      imagen: IMG.stage, destacado: false,
      subtitulo: 'Estadio lleno, coreografías y luces.',
      tituloDescripcion: 'La gira pop del verano',
      descripcion: 'Aurora presenta su nuevo álbum en un directo con banda completa, ocho bailarines y un montaje de luces pensado para cantarlo todo.',
      lineup: [
        { nombre: 'Aurora',    estilo: 'Pop', hora: '21:45' },
        { nombre: 'Nico Vega', estilo: 'Pop alternativo', hora: '21:00' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso a pista', precio: 55, disponibles: 400 },
        { tipo: 'VIP Experience', descripcion: 'Primeras filas + meet & greet', precio: 140, disponibles: 25 }
      ]
    },
    {
      id: 'blue-note-sessions', titulo: 'Blue Note Sessions',
      categoria: 'jazz', etiqueta: 'Jazz',
      fecha: '2026-07-12', hora: '20:00', horaFin: '23:00', recintoId: 'berlin',
      imagen: IMG.jazz, destacado: false,
      subtitulo: 'Jazz en directo, a pocos metros del escenario.',
      tituloDescripcion: 'Una noche de standards y mucha improvisación',
      descripcion: 'Cuarteto en formato club: mesas pequeñas, luz tenue y un repertorio que va de Coltrane a composiciones propias. Aforo muy reducido.',
      lineup: [
        { nombre: 'Elena Ruiz Quartet', estilo: 'Jazz contemporáneo', hora: '20:00' },
        { nombre: 'Trío Meridiano',     estilo: 'Hard bop',           hora: '21:45' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Entrada de pie', precio: 24, disponibles: 30 },
        { tipo: 'VIP Experience', descripcion: 'Mesa reservada', precio: 45, disponibles: 2 }
      ]
    },
    {
      id: 'costa-brava-sessions', titulo: 'Costa Brava Sessions',
      categoria: 'indie', etiqueta: 'Indie folk',
      fecha: '2026-08-15', hora: '19:30', horaFin: '23:00', recintoId: 'razzmatazz',
      imagen: IMG.crowd, destacado: false,
      subtitulo: 'Atardecer, voces y guitarras acústicas.',
      tituloDescripcion: 'El mejor indie folk antes de que caiga el sol',
      descripcion: 'Sesiones acústicas pensadas para escuchar con calma: voces cuidadas, instrumentos de verdad y un público respetuoso.',
      lineup: [
        { nombre: 'Marta Olmo',  estilo: 'Folk',        hora: '19:30' },
        { nombre: 'Rio Alto',    estilo: 'Indie folk',  hora: '21:00' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso al recinto', precio: 26, disponibles: 90 }
      ]
    },
    {
      id: 'pop-atlas', titulo: 'Pop Atlas',
      categoria: 'pop', etiqueta: 'Synth pop',
      fecha: '2026-09-05', hora: '21:00', horaFin: '00:30', recintoId: 'barcelo',
      imagen: IMG.live, destacado: false,
      subtitulo: 'Sintetizadores, estribillos y pista de baile.',
      tituloDescripcion: 'Un viaje por el pop de los últimos veinte años',
      descripcion: 'Tres artistas que han marcado el synth pop actual en un solo cartel. Ideal para bailar, cantar y repetir.',
      lineup: [
        { nombre: 'Violeta Neón', estilo: 'Synth pop', hora: '21:00' },
        { nombre: 'Casio Club',   estilo: 'Electropop', hora: '22:30' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso a pista', precio: 33, disponibles: 220 }
      ]
    },
    {
      id: 'riff-valley', titulo: 'Riff Valley',
      categoria: 'rock', etiqueta: 'Rock alternativo',
      fecha: '2026-10-03', hora: '21:00', horaFin: '01:00', recintoId: 'riviera',
      imagen: IMG.rock, destacado: false,
      subtitulo: 'Cuatro bandas, un solo valle de riffs.',
      tituloDescripcion: 'Rock alternativo para toda la noche',
      descripcion: 'Un festival de sala con cuatro bandas de rock alternativo que han llenado las listas independientes este año.',
      lineup: [
        { nombre: 'Marea Baja',  estilo: 'Rock alternativo', hora: '21:00' },
        { nombre: 'Vértigo',     estilo: 'Post-rock',        hora: '22:00' },
        { nombre: 'Los Ecos',    estilo: 'Rock alternativo', hora: '23:15' }
      ],
      entradas: [
        { tipo: 'General', descripcion: 'Acceso a pista', precio: 29, disponibles: 160 },
        { tipo: 'VIP Experience', descripcion: 'Barra libre + zona superior', precio: 65, disponibles: 20 }
      ]
    }
  ];

  Ritmo.mock = {
    usuarios: usuarios,
    categorias: categorias,
    recintos: recintos,
    eventos: eventos,
    imagenes: IMG
  };
})();
