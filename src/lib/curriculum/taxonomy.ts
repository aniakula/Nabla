import type { Topic } from "@/types/curriculum";

export const CURRICULUM_TOPICS: Topic[] = [
  {
    id: "math",
    slug: "math",
    name: "Mathematics",
    emoji: "🔢",
    summary: "Numbers, patterns, algebra, geometry, and beyond.",
    accent: "mint",
    levels: {
      elementary: [
        {
          id: "math-el-number-sense",
          slug: "number-sense",
          title: "Number sense",
          description:
            "Counting, place value, comparing numbers, and building intuition for how quantities relate.",
        },
        {
          id: "math-el-operations",
          slug: "operations",
          title: "Addition & subtraction",
          description:
            "Strategies for combining and taking apart numbers, including mental math and word problems.",
        },
        {
          id: "math-el-multiplication",
          slug: "multiplication-division",
          title: "Multiplication & division",
          description:
            "Equal groups, arrays, fact fluency, and early division as sharing and grouping.",
        },
        {
          id: "math-el-fractions",
          slug: "fractions-intro",
          title: "Fractions intro",
          description:
            "Parts of a whole, comparing fractions, and simple equivalence on number lines.",
        },
        {
          id: "math-el-geometry",
          slug: "geometry-shapes",
          title: "Shapes & measurement",
          description:
            "2D and 3D shapes, perimeter, area basics, time, money, and customary units.",
        },
      ],
      middle_school: [
        {
          id: "math-ms-ratios",
          slug: "ratios-proportions",
          title: "Ratios & proportions",
          description:
            "Rates, unit rates, percent, and proportional reasoning in tables and graphs.",
        },
        {
          id: "math-ms-integers",
          slug: "integers-rationals",
          title: "Integers & rationals",
          description:
            "Operations with negative numbers, fractions, decimals, and order of operations.",
        },
        {
          id: "math-ms-expressions",
          slug: "expressions-equations",
          title: "Expressions & equations",
          description:
            "Variables, simplifying expressions, one- and two-step equations, and inequalities.",
        },
        {
          id: "math-ms-geometry",
          slug: "geometry",
          title: "Geometry",
          description:
            "Angles, triangles, circles, transformations, volume, and the Pythagorean theorem.",
        },
        {
          id: "math-ms-statistics",
          slug: "statistics",
          title: "Statistics & probability",
          description:
            "Data displays, measures of center and spread, and basic probability models.",
        },
      ],
      high_school: [
        {
          id: "math-hs-algebra-1",
          slug: "algebra-1",
          title: "Algebra 1",
          description:
            "Linear functions, systems of equations, exponents, polynomials, and factoring.",
        },
        {
          id: "math-hs-geometry",
          slug: "geometry",
          title: "Geometry",
          description:
            "Proofs, congruence, similarity, coordinate geometry, and trigonometric ratios.",
        },
        {
          id: "math-hs-algebra-2",
          slug: "algebra-2",
          title: "Algebra 2",
          description:
            "Quadratics, exponentials, logarithms, rational functions, and complex numbers.",
        },
        {
          id: "math-hs-precalc",
          slug: "pre-calculus",
          title: "Pre-calculus",
          description:
            "Functions, trigonometry, sequences, limits intro, and analytic geometry.",
        },
        {
          id: "math-hs-statistics",
          slug: "statistics",
          title: "Statistics",
          description:
            "Inference, distributions, regression, and designing studies with real data.",
        },
      ],
      advanced: [
        {
          id: "math-adv-calculus-1",
          slug: "calculus-1",
          title: "Calculus I",
          description:
            "Limits, derivatives, applications of differentiation, and introduction to integration.",
        },
        {
          id: "math-adv-calculus-2",
          slug: "calculus-2",
          title: "Calculus II",
          description:
            "Integration techniques, series, parametric curves, and polar coordinates.",
        },
        {
          id: "math-adv-linear-algebra",
          slug: "linear-algebra",
          title: "Linear algebra",
          description:
            "Vectors, matrices, linear transformations, eigenvalues, and systems of equations.",
        },
        {
          id: "math-adv-discrete",
          slug: "discrete-math",
          title: "Discrete mathematics",
          description:
            "Logic, sets, combinatorics, graphs, and proofs for computer science and math majors.",
        },
        {
          id: "math-adv-diff-eq",
          slug: "differential-equations",
          title: "Differential equations",
          description:
            "First-order ODEs, linear systems, Laplace transforms, and modeling physical systems.",
        },
      ],
    },
  },
  {
    id: "science",
    slug: "science",
    name: "Science",
    emoji: "🔬",
    summary: "Life, earth, physical sciences, and scientific inquiry.",
    accent: "sky",
    levels: {
      elementary: [
        {
          id: "sci-el-living",
          slug: "living-things",
          title: "Living things",
          description:
            "Plants, animals, habitats, life cycles, and what all living things need to survive.",
        },
        {
          id: "sci-el-earth",
          slug: "earth-space",
          title: "Earth & space",
          description:
            "Rocks, water cycle, weather patterns, seasons, and objects in the solar system.",
        },
        {
          id: "sci-el-matter",
          slug: "matter-energy",
          title: "Matter & energy",
          description:
            "Properties of materials, states of matter, forces, motion, and simple machines.",
        },
        {
          id: "sci-el-body",
          slug: "human-body",
          title: "Human body basics",
          description:
            "Major body systems, healthy habits, senses, and how we grow and stay well.",
        },
      ],
      middle_school: [
        {
          id: "sci-ms-life",
          slug: "life-science",
          title: "Life science",
          description:
            "Cells, genetics, evolution, ecosystems, and human impact on the environment.",
        },
        {
          id: "sci-ms-earth",
          slug: "earth-science",
          title: "Earth science",
          description:
            "Plate tectonics, geology, oceans, atmosphere, and natural resources.",
        },
        {
          id: "sci-ms-physical",
          slug: "physical-science",
          title: "Physical science",
          description:
            "Atoms, chemical reactions, energy transfer, waves, electricity, and magnetism.",
        },
        {
          id: "sci-ms-inquiry",
          slug: "scientific-inquiry",
          title: "Scientific inquiry",
          description:
            "Designing experiments, collecting data, analyzing results, and communicating findings.",
        },
      ],
      high_school: [
        {
          id: "sci-hs-biology",
          slug: "biology",
          title: "Biology",
          description:
            "Biochemistry, cells, genetics, evolution, ecology, and physiology.",
        },
        {
          id: "sci-hs-chemistry",
          slug: "chemistry",
          title: "Chemistry",
          description:
            "Atomic structure, bonding, stoichiometry, thermochemistry, and equilibrium.",
        },
        {
          id: "sci-hs-physics",
          slug: "physics",
          title: "Physics",
          description:
            "Kinematics, forces, energy, waves, electricity, and modern physics intro.",
        },
        {
          id: "sci-hs-env",
          slug: "environmental-science",
          title: "Environmental science",
          description:
            "Ecosystems, biodiversity, pollution, climate, and sustainability policy.",
        },
      ],
      advanced: [
        {
          id: "sci-adv-organic",
          slug: "organic-chemistry",
          title: "Organic chemistry",
          description:
            "Structure, reactivity, mechanisms, and synthesis of carbon-based compounds.",
        },
        {
          id: "sci-adv-molecular",
          slug: "molecular-biology",
          title: "Molecular biology",
          description:
            "DNA, RNA, gene expression, biotechnology, and lab techniques in modern biology.",
        },
        {
          id: "sci-adv-quantum",
          slug: "modern-physics",
          title: "Modern physics",
          description:
            "Relativity, quantum mechanics foundations, and applications in technology.",
        },
        {
          id: "sci-adv-astro",
          slug: "astrophysics",
          title: "Astrophysics",
          description:
            "Stars, galaxies, cosmology, and the physics that governs the universe at large scales.",
        },
      ],
    },
  },
  {
    id: "english",
    slug: "english",
    name: "English & Language Arts",
    emoji: "📖",
    summary: "Reading, writing, grammar, and communication skills.",
    accent: "lavender",
    levels: {
      elementary: [
        {
          id: "eng-el-phonics",
          slug: "phonics-decoding",
          title: "Phonics & decoding",
          description:
            "Letter sounds, blending, sight words, and building fluency in early readers.",
        },
        {
          id: "eng-el-comprehension",
          slug: "reading-comprehension",
          title: "Reading comprehension",
          description:
            "Main idea, details, sequencing, and asking questions about fiction and nonfiction.",
        },
        {
          id: "eng-el-writing",
          slug: "writing-basics",
          title: "Writing basics",
          description:
            "Sentences, paragraphs, narratives, and revising for clarity and conventions.",
        },
        {
          id: "eng-el-vocabulary",
          slug: "vocabulary",
          title: "Vocabulary & word study",
          description:
            "Context clues, affixes, synonyms, antonyms, and growing academic word knowledge.",
        },
      ],
      middle_school: [
        {
          id: "eng-ms-literature",
          slug: "literature",
          title: "Literature studies",
          description:
            "Theme, character, plot, point of view, and analyzing novels, drama, and poetry.",
        },
        {
          id: "eng-ms-informational",
          slug: "informational-text",
          title: "Informational text",
          description:
            "Structure of nonfiction, argument, evidence, and synthesizing multiple sources.",
        },
        {
          id: "eng-ms-writing",
          slug: "writing-workshop",
          title: "Writing workshop",
          description:
            "Expository and argumentative essays, research skills, and peer revision.",
        },
        {
          id: "eng-ms-grammar",
          slug: "grammar-mechanics",
          title: "Grammar & mechanics",
          description:
            "Sentence variety, punctuation, usage, and editing for formal academic writing.",
        },
      ],
      high_school: [
        {
          id: "eng-hs-american",
          slug: "american-literature",
          title: "American literature",
          description:
            "Major works and movements from colonial times through contemporary voices.",
        },
        {
          id: "eng-hs-world",
          slug: "world-literature",
          title: "World literature",
          description:
            "Global texts, cultural context, translation issues, and comparative analysis.",
        },
        {
          id: "eng-hs-rhetoric",
          slug: "rhetoric-composition",
          title: "Rhetoric & composition",
          description:
            "Audience, ethos/pathos/logos, advanced argument, and collegiate writing style.",
        },
        {
          id: "eng-hs-media",
          slug: "media-literacy",
          title: "Media literacy",
          description:
            "Critical analysis of news, film, social media, and digital storytelling.",
        },
      ],
      advanced: [
        {
          id: "eng-adv-creative",
          slug: "creative-writing",
          title: "Creative writing",
          description:
            "Fiction, poetry, and creative nonfiction craft with workshop feedback.",
        },
        {
          id: "eng-adv-critical",
          slug: "critical-theory",
          title: "Critical theory",
          description:
            "Literary criticism frameworks and scholarly interpretation of complex texts.",
        },
        {
          id: "eng-adv-technical",
          slug: "technical-writing",
          title: "Technical writing",
          description:
            "Documentation, UX copy, reports, and clear communication for professional audiences.",
        },
      ],
    },
  },
  {
    id: "history",
    slug: "history",
    name: "History & Social Studies",
    emoji: "🌍",
    summary: "Civics, geography, history, and how societies work.",
    accent: "lemon",
    levels: {
      elementary: [
        {
          id: "hist-el-community",
          slug: "community-civics",
          title: "Community & civics",
          description:
            "Rules, responsibilities, local government, and how communities solve problems together.",
        },
        {
          id: "hist-el-geography",
          slug: "geography",
          title: "Geography basics",
          description:
            "Maps, landforms, continents, cultures, and how people adapt to their environment.",
        },
        {
          id: "hist-el-us",
          slug: "us-history-intro",
          title: "U.S. history intro",
          description:
            "Important people, holidays, symbols, and key events in American history for young learners.",
        },
      ],
      middle_school: [
        {
          id: "hist-ms-world",
          slug: "world-history",
          title: "World history",
          description:
            "Ancient civilizations through early modern empires, trade, and cultural exchange.",
        },
        {
          id: "hist-ms-us",
          slug: "us-history",
          title: "U.S. history",
          description:
            "Colonial America through Reconstruction, westward expansion, and industrialization.",
        },
        {
          id: "hist-ms-civics",
          slug: "civics-government",
          title: "Civics & government",
          description:
            "Constitution, branches of government, rights, elections, and civic participation.",
        },
        {
          id: "hist-ms-economics",
          slug: "economics",
          title: "Economics basics",
          description:
            "Supply and demand, budgeting, markets, and how choices affect individuals and nations.",
        },
      ],
      high_school: [
        {
          id: "hist-hs-us",
          slug: "us-history",
          title: "U.S. history",
          description:
            "Gilded Age through the present: wars, reform movements, civil rights, and policy.",
        },
        {
          id: "hist-hs-world",
          slug: "world-history",
          title: "World history",
          description:
            "20th-century conflicts, decolonization, globalization, and contemporary issues.",
        },
        {
          id: "hist-hs-gov",
          slug: "government",
          title: "Government & politics",
          description:
            "Political ideology, institutions, policy-making, and comparative political systems.",
        },
        {
          id: "hist-hs-ap-human",
          slug: "human-geography",
          title: "Human geography",
          description:
            "Population, migration, urbanization, culture, and economic development patterns.",
        },
      ],
      advanced: [
        {
          id: "hist-adv-political",
          slug: "political-science",
          title: "Political science",
          description:
            "Theory of the state, international relations, and quantitative political analysis.",
        },
        {
          id: "hist-adv-economic",
          slug: "economic-history",
          title: "Economic history",
          description:
            "Long-run growth, institutions, inequality, and historical case studies of economies.",
        },
        {
          id: "hist-adv-philosophy",
          slug: "philosophy-ethics",
          title: "Philosophy & ethics",
          description:
            "Major thinkers, moral reasoning, logic, and applied ethics in society and law.",
        },
      ],
    },
  },
  {
    id: "computer-science",
    slug: "computer-science",
    name: "Computer Science",
    emoji: "💻",
    summary: "Computational thinking, programming, and digital systems.",
    accent: "peach",
    levels: {
      elementary: [
        {
          id: "cs-el-unplugged",
          slug: "computational-thinking",
          title: "Computational thinking",
          description:
            "Algorithms, patterns, debugging, and problem-solving without always using a screen.",
        },
        {
          id: "cs-el-blocks",
          slug: "block-coding",
          title: "Block-based coding",
          description:
            "Sequences, loops, events, and simple games with visual programming tools.",
        },
        {
          id: "cs-el-digital",
          slug: "digital-citizenship",
          title: "Digital citizenship",
          description:
            "Online safety, privacy, kindness, and responsible use of technology at school and home.",
        },
      ],
      middle_school: [
        {
          id: "cs-ms-python",
          slug: "python-basics",
          title: "Python basics",
          description:
            "Variables, conditionals, loops, functions, and small projects with text-based code.",
        },
        {
          id: "cs-ms-web",
          slug: "web-foundations",
          title: "Web foundations",
          description:
            "HTML, CSS, accessibility basics, and building simple static web pages.",
        },
        {
          id: "cs-ms-data",
          slug: "data-literacy",
          title: "Data literacy",
          description:
            "Spreadsheets, charts, cleaning data, and telling stories with numbers.",
        },
      ],
      high_school: [
        {
          id: "cs-hs-ap-csp",
          slug: "ap-computer-science-principles",
          title: "CS Principles",
          description:
            "Big ideas in computing, the internet, data, and impact of computing on society.",
        },
        {
          id: "cs-hs-ap-csa",
          slug: "ap-computer-science-a",
          title: "CS A (Java)",
          description:
            "Object-oriented programming, arrays, algorithms, and AP-style exam preparation.",
        },
        {
          id: "cs-hs-databases",
          slug: "databases",
          title: "Databases & SQL",
          description:
            "Relational models, queries, normalization, and building apps backed by data.",
        },
      ],
      advanced: [
        {
          id: "cs-adv-algorithms",
          slug: "algorithms",
          title: "Algorithms",
          description:
            "Complexity, sorting, graphs, dynamic programming, and interview-style problem sets.",
        },
        {
          id: "cs-adv-systems",
          slug: "computer-systems",
          title: "Computer systems",
          description:
            "Architecture, operating systems, concurrency, and how hardware runs your code.",
        },
        {
          id: "cs-adv-ml",
          slug: "machine-learning",
          title: "Machine learning intro",
          description:
            "Supervised learning, neural networks basics, ethics, and hands-on model training.",
        },
      ],
    },
  },
  {
    id: "languages",
    slug: "languages",
    name: "World Languages",
    emoji: "🗣️",
    summary: "Listening, speaking, reading, and writing in new languages.",
    accent: "sand",
    levels: {
      elementary: [
        {
          id: "lang-el-spanish",
          slug: "spanish-intro",
          title: "Spanish intro",
          description:
            "Greetings, colors, family, classroom phrases, and simple conversations.",
        },
        {
          id: "lang-el-french",
          slug: "french-intro",
          title: "French intro",
          description:
            "Basic vocabulary, pronunciation, and cultural traditions in Francophone countries.",
        },
        {
          id: "lang-el-mandarin",
          slug: "mandarin-intro",
          title: "Mandarin intro",
          description:
            "Pinyin, tones, characters intro, and everyday phrases for young learners.",
        },
      ],
      middle_school: [
        {
          id: "lang-ms-spanish-1",
          slug: "spanish-1",
          title: "Spanish I",
          description:
            "Present tense verbs, descriptions, school life, and presentational speaking tasks.",
        },
        {
          id: "lang-ms-french-1",
          slug: "french-1",
          title: "French I",
          description:
            "Core grammar, listening comprehension, and reading short authentic texts.",
        },
        {
          id: "lang-ms-latin",
          slug: "latin",
          title: "Latin",
          description:
            "Vocabulary roots, Roman culture, translation, and connections to English words.",
        },
      ],
      high_school: [
        {
          id: "lang-hs-spanish-2",
          slug: "spanish-2",
          title: "Spanish II",
          description:
            "Past tenses, object pronouns, extended writing, and cultural comparison projects.",
        },
        {
          id: "lang-hs-spanish-3",
          slug: "spanish-3",
          title: "Spanish III / AP prep",
          description:
            "Subjunctive, literature excerpts, formal essays, and AP Spanish Language skills.",
        },
        {
          id: "lang-hs-japanese",
          slug: "japanese",
          title: "Japanese",
          description:
            "Hiragana, katakana, kanji foundations, keigo basics, and JLPT-oriented study.",
        },
      ],
      advanced: [
        {
          id: "lang-adv-conversation",
          slug: "advanced-conversation",
          title: "Advanced conversation",
          description:
            "Fluency practice, debate, idioms, and media analysis for near-native proficiency.",
        },
        {
          id: "lang-adv-translation",
          slug: "translation-studies",
          title: "Translation studies",
          description:
            "Theory, nuance, localization, and professional standards for bilingual communication.",
        },
      ],
    },
  },
  {
    id: "arts",
    slug: "arts",
    name: "Arts & Music",
    emoji: "🎨",
    summary: "Visual art, music, drama, and creative expression.",
    accent: "lavender",
    levels: {
      elementary: [
        {
          id: "arts-el-visual",
          slug: "visual-art",
          title: "Visual art",
          description:
            "Drawing, color, collage, and art history stories that inspire young creators.",
        },
        {
          id: "arts-el-music",
          slug: "music",
          title: "Music & rhythm",
          description:
            "Beat, pitch, singing, simple instruments, and listening to diverse musical styles.",
        },
        {
          id: "arts-el-drama",
          slug: "drama",
          title: "Drama & movement",
          description:
            "Improvisation, character, stage basics, and confidence performing with others.",
        },
      ],
      middle_school: [
        {
          id: "arts-ms-studio",
          slug: "studio-art",
          title: "Studio art",
          description:
            "Perspective, shading, composition, and portfolio pieces across media.",
        },
        {
          id: "arts-ms-band",
          slug: "band-orchestra",
          title: "Band & orchestra",
          description:
            "Ensemble skills, reading notation, practice routines, and performance etiquette.",
        },
        {
          id: "arts-ms-digital",
          slug: "digital-art",
          title: "Digital art",
          description:
            "Layers, brushes, photo editing basics, and ethical use of reference material.",
        },
      ],
      high_school: [
        {
          id: "arts-hs-ap-studio",
          slug: "ap-studio-art",
          title: "AP Studio Art",
          description:
            "Sustained investigation, breadth, quality works, and AP portfolio requirements.",
        },
        {
          id: "arts-hs-music-theory",
          slug: "music-theory",
          title: "Music theory",
          description:
            "Harmony, voice leading, ear training, and analysis of classical and popular music.",
        },
        {
          id: "arts-hs-theater",
          slug: "theater-production",
          title: "Theater production",
          description:
            "Script analysis, directing, design, and mounting a full production.",
        },
      ],
      advanced: [
        {
          id: "arts-adv-film",
          slug: "film-studies",
          title: "Film studies",
          description:
            "Cinematography, editing, genre, and critical writing about moving images.",
        },
        {
          id: "arts-adv-art-history",
          slug: "art-history",
          title: "Art history",
          description:
            "Movements from antiquity to contemporary art with scholarly research methods.",
        },
      ],
    },
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return CURRICULUM_TOPICS.find((t) => t.slug === slug);
}
