// Track B of the SEO strategy — the /learn content engine. These are the
// "answer pages" that capture the large student-query traffic (squares 1 to 30,
// 1 ton to kg, acetone formula, …) and funnel it, via a soft CTA, into the
// commercial service pages. Structure follows the concept-page template in the
// strategy doc: the exact query as the H1, a direct answer / table in the first
// screen (to win featured snippets), worked examples, related concepts, and a
// "learn this with a 1:1 mentor" call to action.
//
// This is the seed set — the P1, low-difficulty, high-volume concepts from the
// Keyword Universe tab. Every entry is one data object; scaling the engine to
// the hundreds of pages the strategy calls for is adding entries here, not new
// routes. Numeric tables are GENERATED below so they can never drift from being
// arithmetically correct.

export type LearnSubject = {
  slug: string; // /learn/{slug}
  name: string;
  /** Hub H1 */
  heading: string;
  description: string;
};

export type ConceptTable = {
  caption?: string;
  headers: string[];
  rows: (string | number)[][];
};

export type ConceptSection = {
  heading: string;
  body: string[]; // paragraphs
};

export type WorkedExample = {
  prompt: string;
  steps: string[];
};

export type Concept = {
  slug: string; // /learn/{subjectSlug}/{slug}
  subjectSlug: string;
  /** H1 — the exact search query, e.g. "Squares 1 to 30" */
  heading: string;
  /** <title>, leads with the keyword */
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  monthlyVolume: number;
  /** Answer-first block — 1–3 short sentences that directly answer the query. */
  answer: string;
  table?: ConceptTable;
  sections?: ConceptSection[];
  workedExamples?: WorkedExample[];
  faqs: { question: string; answer: string }[];
  /** Other concept slugs (same or cross subject) to interlink. */
  related?: { subjectSlug: string; slug: string; label: string }[];
  /** Which subject/grade service page this page's CTA should point at. */
  ctaService: string; // path under /online-tuition, "" = core
  ctaLabel: string;
  /** When true, rendered as a step-by-step HowTo (conversions). */
  isConversion?: boolean;
  howToSteps?: string[];
};

export const learnSubjects: LearnSubject[] = [
  {
    slug: "maths",
    name: "Maths",
    heading: "Maths — Concepts, Tables & Solved Problems",
    description:
      "Squares, cubes, prime numbers, shapes and the solved-value tables students search for most — explained, with worked examples and a 1-to-1 mentor a click away.",
  },
  {
    slug: "conversions",
    name: "Conversions & Units",
    heading: "Unit Conversions & Number Systems",
    description:
      "Fast, correct answers to the everyday conversion questions — tonnes to kilograms, billions to millions — with the method shown so you can do the next one yourself.",
  },
  {
    slug: "physics",
    name: "Physics",
    heading: "Physics — Laws, Formulas & Derivations",
    description:
      "The formulas and laws students look up, explained from the idea up rather than handed over to memorise.",
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    heading: "Chemistry — Formulas, Reactions & Concepts",
    description:
      "Chemical formulas, reactions and concepts, with the logic behind them — not just the answer.",
  },
  {
    slug: "english",
    name: "English",
    heading: "English — Grammar & Language Concepts",
    description:
      "Grammar and language basics — action words, naming words and more — with clear examples for younger learners.",
  },
];

export function getLearnSubject(slug: string) {
  return learnSubjects.find((s) => s.slug === slug);
}

// --- Generated numeric data (correct by construction) ------------------------

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const squaresRows = range(1, 30).map((n) => [n, n * n]);
const cubesRows = range(1, 20).map((n) => [n, n * n * n]);

function primesUpTo(limit: number): number[] {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) for (let j = i * i; j <= limit; j += i) sieve[j] = false;
  }
  return range(2, limit).filter((n) => sieve[n]);
}
const primes1to100 = primesUpTo(100);

const tonToKgRows: (string | number)[][] = [
  ["1 tonne (metric ton)", "1,000 kg"],
  ["2 tonnes", "2,000 kg"],
  ["5 tonnes", "5,000 kg"],
  ["10 tonnes", "10,000 kg"],
  ["0.5 tonne", "500 kg"],
  ["1 US (short) ton", "907.18 kg"],
  ["1 UK (long) ton", "1,016.05 kg"],
];

const billionToMillionRows: (string | number)[][] = [
  ["1 billion", "1,000 million"],
  ["2 billion", "2,000 million"],
  ["5 billion", "5,000 million"],
  ["0.5 billion", "500 million"],
  ["10 billion", "10,000 million"],
  ["100 billion", "100,000 million"],
];

// --- The concept seed set ----------------------------------------------------

export const concepts: Concept[] = [
  // ============================ MATHS ============================
  {
    slug: "squares-1-to-30",
    subjectSlug: "maths",
    heading: "Squares 1 to 30",
    metaTitle: "Squares 1 to 30 — Full Table (1² to 30²)",
    metaDescription:
      "Squares 1 to 30: the complete table of square numbers from 1² = 1 to 30² = 900, with the values, the pattern, and how to memorise them fast.",
    primaryKeyword: "squares 1 to 30",
    monthlyVolume: 110000,
    answer:
      "The squares of numbers from 1 to 30 range from 1² = 1 to 30² = 900. A square number is the result of multiplying a whole number by itself (n × n). The full table of all 30 values is below.",
    table: {
      caption: "Squares of 1 to 30 (n and n²)",
      headers: ["Number (n)", "Square (n²)"],
      rows: squaresRows,
    },
    sections: [
      {
        heading: "What is a square number?",
        body: [
          "A square number is what you get when you multiply a whole number by itself. So the square of 7 is 7 × 7 = 49, written 7². It is called a 'square' because that many dots can be arranged into a perfect square grid — 49 dots make a 7-by-7 square.",
          "Knowing squares 1 to 30 by heart speeds up almost everything else in maths: square roots, areas, the Pythagoras theorem, and quadratic equations all lean on them.",
        ],
      },
      {
        heading: "The pattern in the squares",
        body: [
          "The gap between one square and the next is always the next odd number. 1, then +3 → 4, then +5 → 9, then +7 → 16, and so on. This is why 1 + 3 + 5 + 7 + … always adds up to a perfect square.",
          "It also means you can build the next square from the last one: 25² = 625, so 26² = 625 + 25 + 26 = 676.",
        ],
      },
    ],
    workedExamples: [
      {
        prompt: "Find 24² without a calculator.",
        steps: [
          "Split 24 into 20 + 4.",
          "24² = (20 + 4)² = 20² + 2·20·4 + 4²",
          "= 400 + 160 + 16",
          "= 576.",
        ],
      },
    ],
    faqs: [
      { question: "What is the square of 30?", answer: "30² = 30 × 30 = 900." },
      {
        question: "What are the perfect squares from 1 to 30?",
        answer:
          "Every number from 1 to 30 has a square: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841 and 900.",
      },
      {
        question: "How can I memorise squares 1 to 30 quickly?",
        answer:
          "Learn 1–10 first, then use the odd-number pattern (each square is the previous one plus the next odd number) and the (a + b)² trick to build the rest — you rarely need to memorise all 30 outright.",
      },
    ],
    related: [
      { subjectSlug: "maths", slug: "cubes-1-to-20", label: "Cubes 1 to 20" },
      { subjectSlug: "maths", slug: "square-root-of-1024", label: "Square root of 1024" },
      { subjectSlug: "maths", slug: "prime-numbers-1-to-100", label: "Prime numbers 1 to 100" },
    ],
    ctaService: "maths",
    ctaLabel: "Struggling with squares, roots or algebra? Learn it 1-to-1 with a maths mentor.",
  },
  {
    slug: "cubes-1-to-20",
    subjectSlug: "maths",
    heading: "Cubes 1 to 20",
    metaTitle: "Cubes 1 to 20 — Full Table (1³ to 20³)",
    metaDescription:
      "Cubes 1 to 20: the complete table of cube numbers from 1³ = 1 to 20³ = 8000, with the values, the pattern, and worked examples.",
    primaryKeyword: "cubes 1 to 20",
    monthlyVolume: 18100,
    answer:
      "The cubes of numbers from 1 to 20 range from 1³ = 1 to 20³ = 8000. A cube number is a whole number multiplied by itself three times (n × n × n). The full table is below.",
    table: {
      caption: "Cubes of 1 to 20 (n and n³)",
      headers: ["Number (n)", "Cube (n³)"],
      rows: cubesRows,
    },
    sections: [
      {
        heading: "What is a cube number?",
        body: [
          "A cube number is a whole number multiplied by itself three times. The cube of 4 is 4 × 4 × 4 = 64, written 4³. It is called a 'cube' because that many unit blocks can be stacked into a perfect cube — 64 blocks make a 4-by-4-by-4 cube.",
          "Cubes appear in volume calculations, cube roots, and many algebra identities, so having 1³ to 20³ ready saves time throughout senior maths.",
        ],
      },
      {
        heading: "A useful pattern",
        body: [
          "The sum of the first n cubes equals the square of the sum of the first n numbers. For example 1³ + 2³ + 3³ = 36 = (1 + 2 + 3)². It is one of the most elegant patterns in early number theory.",
        ],
      },
    ],
    workedExamples: [
      {
        prompt: "Find 13³.",
        steps: [
          "13³ = 13 × 13 × 13",
          "13 × 13 = 169",
          "169 × 13 = 2197.",
        ],
      },
    ],
    faqs: [
      { question: "What is the cube of 20?", answer: "20³ = 20 × 20 × 20 = 8000." },
      {
        question: "What is the difference between a square and a cube?",
        answer:
          "A square multiplies a number by itself once more (n²  = n × n); a cube multiplies it by itself twice more (n³ = n × n × n). So 5² = 25 but 5³ = 125.",
      },
    ],
    related: [
      { subjectSlug: "maths", slug: "squares-1-to-30", label: "Squares 1 to 30" },
      { subjectSlug: "maths", slug: "prime-numbers-1-to-100", label: "Prime numbers 1 to 100" },
    ],
    ctaService: "maths",
    ctaLabel: "Want the patterns behind cubes and roots to actually stick? Try a 1-to-1 maths session.",
  },
  {
    slug: "prime-numbers-1-to-100",
    subjectSlug: "maths",
    heading: "Prime Numbers 1 to 100",
    metaTitle: "Prime Numbers 1 to 100 — Complete List (25 Primes)",
    metaDescription:
      "Prime numbers 1 to 100: there are 25 of them. The full list, what makes a number prime, and how to find them with the Sieve of Eratosthenes.",
    primaryKeyword: "prime numbers 1 to 100",
    monthlyVolume: 40500,
    answer: `There are 25 prime numbers between 1 and 100: ${primes1to100.join(", ")}. A prime number is a whole number greater than 1 with exactly two factors — 1 and itself.`,
    table: {
      caption: "The 25 prime numbers from 1 to 100",
      headers: ["Range", "Primes"],
      rows: [
        ["1–10", "2, 3, 5, 7"],
        ["11–20", "11, 13, 17, 19"],
        ["21–40", "23, 29, 31, 37"],
        ["41–60", "41, 43, 47, 53, 59"],
        ["61–80", "61, 67, 71, 73, 79"],
        ["81–100", "83, 89, 97"],
      ],
    },
    sections: [
      {
        heading: "What makes a number prime?",
        body: [
          "A prime number has exactly two distinct factors: 1 and the number itself. 7 is prime because nothing except 1 and 7 divides it evenly. 8 is not prime, because 2 and 4 also divide it.",
          "1 is not a prime number — it has only one factor. 2 is the only even prime, since every other even number is divisible by 2.",
        ],
      },
      {
        heading: "Finding primes with the Sieve of Eratosthenes",
        body: [
          "Write the numbers 2 to 100. Circle 2, then cross out every multiple of 2. Move to the next uncrossed number (3), circle it, cross out its multiples, and repeat. Whatever remains circled is prime. It is exactly how the list above is produced.",
        ],
      },
    ],
    faqs: [
      { question: "How many prime numbers are there between 1 and 100?", answer: "There are 25 prime numbers between 1 and 100." },
      { question: "Is 1 a prime number?", answer: "No. A prime must have exactly two factors, and 1 has only one factor (itself), so it is neither prime nor composite." },
      { question: "What is the smallest prime number?", answer: "2 is the smallest prime number, and the only even one." },
    ],
    related: [
      { subjectSlug: "maths", slug: "squares-1-to-30", label: "Squares 1 to 30" },
      { subjectSlug: "maths", slug: "cubes-1-to-20", label: "Cubes 1 to 20" },
    ],
    ctaService: "maths",
    ctaLabel: "Factors, primes and number theory clicking slowly? A 1-to-1 maths mentor can help.",
  },
  {
    slug: "trapezium",
    subjectSlug: "maths",
    heading: "Properties of a Trapezium",
    metaTitle: "Trapezium — Properties, Area Formula & Types",
    metaDescription:
      "Properties of a trapezium: a quadrilateral with one pair of parallel sides. Its area formula, angle properties, types, and worked examples explained.",
    primaryKeyword: "properties of trapezium",
    monthlyVolume: 22200,
    answer:
      "A trapezium is a quadrilateral with exactly one pair of parallel sides. Those parallel sides are the bases; the other two are the legs. Its area is ½ × (sum of the parallel sides) × height, and its four interior angles add up to 360°.",
    table: {
      caption: "Key properties of a trapezium",
      headers: ["Property", "Detail"],
      rows: [
        ["Sides", "4 (one pair parallel)"],
        ["Parallel sides", "The two bases (a and b)"],
        ["Area", "½ × (a + b) × h"],
        ["Perimeter", "Sum of all four sides"],
        ["Sum of interior angles", "360°"],
        ["Co-interior angles (on each leg)", "Add up to 180°"],
      ],
    },
    sections: [
      {
        heading: "Angle properties",
        body: [
          "Because the two bases are parallel, each leg is a transversal cutting them. The two angles on the same leg (co-interior angles) therefore add up to 180°. All four interior angles together add up to 360°, as in any quadrilateral.",
        ],
      },
      {
        heading: "Types of trapezium",
        body: [
          "An isosceles trapezium has equal legs and equal base angles, and its diagonals are equal in length. A right trapezium has two right angles. A scalene trapezium has all sides and angles different.",
          "Note the naming difference: in British English a 'trapezium' has one pair of parallel sides; in American English the same shape is a 'trapezoid'.",
        ],
      },
    ],
    workedExamples: [
      {
        prompt: "Find the area of a trapezium with parallel sides 8 cm and 12 cm and height 5 cm.",
        steps: [
          "Area = ½ × (a + b) × h",
          "= ½ × (8 + 12) × 5",
          "= ½ × 20 × 5",
          "= 50 cm².",
        ],
      },
    ],
    faqs: [
      { question: "What is the area formula of a trapezium?", answer: "Area = ½ × (sum of the two parallel sides) × the perpendicular height, or ½ × (a + b) × h." },
      { question: "How many parallel sides does a trapezium have?", answer: "A trapezium has exactly one pair of parallel sides." },
      { question: "Is a trapezium the same as a trapezoid?", answer: "In British English, a trapezium has one pair of parallel sides; American English calls that shape a trapezoid. They refer to the same figure." },
    ],
    related: [
      { subjectSlug: "maths", slug: "squares-1-to-30", label: "Squares 1 to 30" },
    ],
    ctaService: "maths",
    ctaLabel: "Geometry proofs and area formulas easier with a mentor. Book a 1-to-1 maths session.",
  },
  {
    slug: "square-root-of-1024",
    subjectSlug: "maths",
    heading: "Square Root of 1024",
    metaTitle: "Square Root of 1024 — Value and Method (√1024 = 32)",
    metaDescription:
      "The square root of 1024 is 32, because 32 × 32 = 1024. See why with prime factorisation and the long-division method.",
    primaryKeyword: "square root of 1024",
    monthlyVolume: 1000,
    answer:
      "The square root of 1024 is 32, because 32 × 32 = 1024. Since 1024 is a perfect square, its square root is a whole number.",
    sections: [
      {
        heading: "By prime factorisation",
        body: [
          "1024 = 2¹⁰. To take a square root, halve the exponent: √(2¹⁰) = 2⁵ = 32. This is the quickest route whenever a number is a clean power of 2.",
          "Grouping the factors in pairs shows the same thing: 1024 = (2 × 2 × 2 × 2 × 2) × (2 × 2 × 2 × 2 × 2) = 32 × 32.",
        ],
      },
    ],
    workedExamples: [
      {
        prompt: "Confirm √1024 = 32.",
        steps: ["32 × 32 = 32 × 30 + 32 × 2", "= 960 + 64", "= 1024. ✓"],
      },
    ],
    faqs: [
      { question: "What is the square root of 1024?", answer: "It is 32, since 32² = 1024." },
      { question: "Is 1024 a perfect square?", answer: "Yes. 1024 = 2¹⁰ = 32², so it is a perfect square." },
    ],
    related: [
      { subjectSlug: "maths", slug: "squares-1-to-30", label: "Squares 1 to 30" },
      { subjectSlug: "maths", slug: "cubes-1-to-20", label: "Cubes 1 to 20" },
    ],
    ctaService: "maths",
    ctaLabel: "Roots, powers and indices made simple, 1-to-1. Try a free maths assessment.",
  },

  // ========================= CONVERSIONS =========================
  {
    slug: "ton-to-kg",
    subjectSlug: "conversions",
    heading: "1 Ton to Kg",
    metaTitle: "1 Ton to Kg — How Many Kilograms in a Tonne?",
    metaDescription:
      "1 tonne (metric ton) = 1000 kg. Convert tons to kilograms with a quick table and the simple ×1000 method, plus US and UK ton values.",
    primaryKeyword: "1 ton to kg",
    monthlyVolume: 135000,
    answer:
      "1 tonne (the metric ton) equals 1,000 kilograms. To convert any number of metric tonnes to kilograms, multiply by 1,000. (A US 'short ton' is 907.18 kg and a UK 'long ton' is 1,016.05 kg.)",
    isConversion: true,
    howToSteps: [
      "Take the number of tonnes you want to convert.",
      "Multiply it by 1,000.",
      "The result is the mass in kilograms — for example, 3.5 tonnes × 1,000 = 3,500 kg.",
    ],
    table: {
      caption: "Tons to kilograms",
      headers: ["Tons", "Kilograms"],
      rows: tonToKgRows,
    },
    sections: [
      {
        heading: "Why 1000?",
        body: [
          "The metric system is built on powers of ten. A kilogram is 1,000 grams and a tonne is 1,000 kilograms, so a tonne is a million grams. That clean factor of 1,000 is what makes the conversion just a matter of moving the decimal point three places.",
          "Watch which 'ton' is meant: the metric tonne (1,000 kg) is standard in India and most of the world, but the US short ton and UK long ton are different masses.",
        ],
      },
    ],
    faqs: [
      { question: "How many kg are in 1 ton?", answer: "1 metric tonne = 1,000 kg." },
      { question: "How do you convert tons to kg?", answer: "Multiply the number of metric tonnes by 1,000. So 2.5 tonnes = 2,500 kg." },
      { question: "Is a US ton the same as a metric ton?", answer: "No. A metric tonne is 1,000 kg, a US short ton is about 907.18 kg, and a UK long ton is about 1,016.05 kg." },
    ],
    related: [
      { subjectSlug: "conversions", slug: "billion-to-million", label: "1 billion in million" },
    ],
    ctaService: "",
    ctaLabel: "Units and measurement confusing? A 1-to-1 mentor can make it stick.",
  },
  {
    slug: "billion-to-million",
    subjectSlug: "conversions",
    heading: "1 Billion in Million",
    metaTitle: "1 Billion in Million — How Many Millions in a Billion?",
    metaDescription:
      "1 billion = 1,000 million. Convert billions to millions by multiplying by 1,000, with a quick reference table and the place-value reason why.",
    primaryKeyword: "1 billion in million",
    monthlyVolume: 27100,
    answer:
      "1 billion equals 1,000 million. In figures, 1 billion is written 1,000,000,000 (a 1 followed by nine zeros) and 1 million is 1,000,000 (six zeros). To convert billions to millions, multiply by 1,000.",
    isConversion: true,
    howToSteps: [
      "Take the number of billions.",
      "Multiply by 1,000.",
      "The result is the value in millions — for example, 2.5 billion × 1,000 = 2,500 million.",
    ],
    table: {
      caption: "Billions to millions",
      headers: ["Billion", "Million"],
      rows: billionToMillionRows,
    },
    sections: [
      {
        heading: "Billion, million and the Indian system",
        body: [
          "On the international (short-scale) system, one billion is a thousand million. In the Indian numbering system the same value is 100 crore, since 1 crore = 10 million. So 1 billion = 1,000 million = 100 crore.",
        ],
      },
    ],
    faqs: [
      { question: "How many millions make a billion?", answer: "1,000 million make 1 billion." },
      { question: "How many zeros are in a billion?", answer: "A billion has nine zeros: 1,000,000,000." },
      { question: "What is 1 billion in the Indian system?", answer: "1 billion equals 100 crore (1 crore = 10 million)." },
    ],
    related: [
      { subjectSlug: "conversions", slug: "ton-to-kg", label: "1 ton to kg" },
    ],
    ctaService: "",
    ctaLabel: "Place value and large numbers clearer, 1-to-1. Book a free assessment.",
  },

  // =========================== PHYSICS ===========================
  {
    slug: "impulse",
    subjectSlug: "physics",
    heading: "Impulse Formula",
    metaTitle: "Impulse Formula — J = F × t = Δp (With Units)",
    metaDescription:
      "The impulse formula is J = F × t, and impulse equals the change in momentum (J = Δp = mv − mu). Definition, SI unit, and worked examples.",
    primaryKeyword: "impulse formula",
    monthlyVolume: 27100,
    answer:
      "Impulse (J) is the product of a force and the time it acts for: J = F × t. It is equal to the change in momentum an object experiences, so J = Δp = mv − mu. Its SI unit is the newton-second (N·s), which is the same as kg·m/s.",
    table: {
      caption: "Impulse at a glance",
      headers: ["Quantity", "Symbol / Formula", "SI Unit"],
      rows: [
        ["Impulse", "J = F × t", "N·s"],
        ["Impulse–momentum theorem", "J = Δp = mv − mu", "kg·m/s"],
        ["Force (constant)", "F = Δp / t", "N"],
      ],
    },
    sections: [
      {
        heading: "The impulse–momentum theorem",
        body: [
          "Newton's second law says force equals the rate of change of momentum: F = Δp / t. Rearranging gives F × t = Δp — that is, impulse equals the change in momentum. This is why a longer contact time reduces the force for the same change in momentum, the principle behind airbags, crumple zones and bending your knees when you land.",
          "Because N·s and kg·m/s are the same unit, the two sides of J = Δp match dimensionally as well as numerically.",
        ],
      },
    ],
    workedExamples: [
      {
        prompt: "A 0.15 kg ball hits a wall at 20 m/s and bounces straight back at 20 m/s. Find the impulse.",
        steps: [
          "Take the initial direction as positive: u = +20 m/s, v = −20 m/s.",
          "Δp = m(v − u) = 0.15 × (−20 − 20)",
          "= 0.15 × (−40) = −6 kg·m/s.",
          "The impulse is 6 N·s, directed away from the wall (the sign shows direction).",
        ],
      },
    ],
    faqs: [
      { question: "What is the formula for impulse?", answer: "Impulse J = F × t, and it equals the change in momentum, J = Δp = mv − mu." },
      { question: "What is the SI unit of impulse?", answer: "The newton-second (N·s), which is equivalent to kg·m/s." },
      { question: "How is impulse related to momentum?", answer: "By the impulse–momentum theorem: the impulse on an object equals its change in momentum, J = Δp." },
    ],
    related: [],
    ctaService: "physics",
    ctaLabel: "Momentum and mechanics numericals tripping you up? Learn them 1-to-1 with a physics mentor.",
  },

  // ========================== CHEMISTRY ==========================
  {
    slug: "acetone",
    subjectSlug: "chemistry",
    heading: "Acetone Formula",
    metaTitle: "Acetone Formula — (CH₃)₂CO / C₃H₆O Explained",
    metaDescription:
      "The chemical formula of acetone is C₃H₆O, usually written (CH₃)₂CO. Its structure, molar mass (58.08 g/mol), properties and uses explained.",
    primaryKeyword: "acetone formula",
    monthlyVolume: 33100,
    answer:
      "The chemical formula of acetone is C₃H₆O. It is most often written as (CH₃)₂CO, which shows its structure: a central carbonyl group (C=O) with a methyl group (CH₃) on each side. Acetone is the simplest ketone.",
    table: {
      caption: "Acetone — key facts",
      headers: ["Property", "Value"],
      rows: [
        ["Molecular formula", "C₃H₆O"],
        ["Condensed / structural formula", "(CH₃)₂CO"],
        ["IUPAC name", "Propan-2-one (propanone)"],
        ["Functional group", "Ketone (carbonyl, C=O)"],
        ["Molar mass", "58.08 g/mol"],
        ["State at room temperature", "Colourless, volatile liquid"],
      ],
    },
    sections: [
      {
        heading: "Structure and functional group",
        body: [
          "Acetone's carbon skeleton is three carbons: two methyl groups joined to a central carbon that carries a double-bonded oxygen (the carbonyl). Because the carbonyl sits between two carbon groups, acetone is a ketone — in fact the simplest one — and its IUPAC name is propan-2-one.",
          "The molar mass follows from the formula: 3 carbons (3 × 12.01) + 6 hydrogens (6 × 1.008) + 1 oxygen (16.00) = 58.08 g/mol.",
        ],
      },
      {
        heading: "Common uses",
        body: [
          "Acetone is a widely used solvent — in nail-polish remover, paint thinner, and laboratories — because it dissolves many organic compounds and evaporates quickly. It also occurs naturally in the body in small amounts as a product of fat metabolism.",
        ],
      },
    ],
    faqs: [
      { question: "What is the chemical formula of acetone?", answer: "The molecular formula is C₃H₆O, commonly written (CH₃)₂CO." },
      { question: "What is the IUPAC name of acetone?", answer: "Propan-2-one (also called propanone)." },
      { question: "What is the molar mass of acetone?", answer: "About 58.08 g/mol." },
    ],
    related: [
      { subjectSlug: "chemistry", slug: "indicators-acids-bases", label: "Indicators of acids and bases" },
    ],
    ctaService: "chemistry",
    ctaLabel: "Organic formulas and functional groups made clear, 1-to-1. Book a chemistry session.",
  },
  {
    slug: "indicators-acids-bases",
    subjectSlug: "chemistry",
    heading: "Indicators of Acids and Bases",
    metaTitle: "Indicators of Acids and Bases — Colour Changes Table",
    metaDescription:
      "Acid–base indicators and their colour changes: litmus, phenolphthalein, methyl orange and natural indicators. A clear table of what each shows in acids vs bases.",
    primaryKeyword: "indicators of acids and bases",
    monthlyVolume: 1600,
    answer:
      "An indicator is a substance that changes colour to show whether a solution is acidic or basic. Common ones are litmus (red in acid, blue in base), phenolphthalein (colourless in acid, pink in base) and methyl orange (red in acid, yellow in base).",
    table: {
      caption: "Common acid–base indicators and their colours",
      headers: ["Indicator", "In acid", "In base"],
      rows: [
        ["Blue litmus", "Turns red", "Stays blue"],
        ["Red litmus", "Stays red", "Turns blue"],
        ["Phenolphthalein", "Colourless", "Pink"],
        ["Methyl orange", "Red", "Yellow"],
        ["Turmeric (natural)", "Stays yellow", "Turns red"],
        ["Red cabbage (natural)", "Red / pink", "Green / yellow"],
      ],
    },
    sections: [
      {
        heading: "Types of indicators",
        body: [
          "Natural indicators come from plants — litmus (from lichen), turmeric, and red cabbage juice all change colour with acidity. Synthetic indicators like phenolphthalein and methyl orange are made in the lab and give sharper, more reliable colour changes for titrations.",
          "Olfactory indicators (such as onion or vanilla) change smell rather than colour, useful for visually impaired students.",
        ],
      },
    ],
    faqs: [
      { question: "What colour does litmus turn in an acid?", answer: "Blue litmus turns red in an acid. Red litmus stays red." },
      { question: "What colour is phenolphthalein in a base?", answer: "Phenolphthalein is pink in a base and colourless in an acid." },
      { question: "What is a natural indicator?", answer: "A plant-derived substance that changes colour with acidity — for example litmus, turmeric or red cabbage juice." },
    ],
    related: [
      { subjectSlug: "chemistry", slug: "acetone", label: "Acetone formula" },
    ],
    ctaService: "chemistry",
    ctaLabel: "Acids, bases and salts easier to remember, 1-to-1. Try a free chemistry assessment.",
  },

  // ============================ ENGLISH ==========================
  {
    slug: "action-words",
    subjectSlug: "english",
    heading: "Action Words",
    metaTitle: "Action Words — Meaning, Examples & List (Verbs)",
    metaDescription:
      "Action words are verbs that show what someone or something does — run, eat, write, jump. Their meaning, a list of examples, and how to use them in sentences.",
    primaryKeyword: "action words",
    monthlyVolume: 90500,
    answer:
      "Action words are verbs — words that show what a person, animal or thing does. Run, jump, eat, write, sing and read are all action words. Every complete sentence needs one, because it tells you what is happening.",
    table: {
      caption: "Examples of action words",
      headers: ["Action word", "Used in a sentence"],
      rows: [
        ["run", "The children run in the park."],
        ["eat", "We eat lunch at one o'clock."],
        ["write", "She writes a letter to her friend."],
        ["jump", "The frog can jump very high."],
        ["read", "He reads a story every night."],
        ["sing", "Birds sing in the morning."],
      ],
    },
    sections: [
      {
        heading: "How to spot an action word",
        body: [
          "Ask 'what is the person or thing doing?' The answer is the action word. In 'The dog barks loudly,' the dog is doing the barking — so 'barks' is the action word.",
          "Action words can describe things you can see (jump, kick, dance) or things you cannot see happening but still do (think, know, believe).",
        ],
      },
    ],
    faqs: [
      { question: "What are action words?", answer: "Action words are verbs — they show what someone or something does, like run, eat or write." },
      { question: "Give five examples of action words.", answer: "Run, jump, eat, read and sing are all action words." },
      { question: "Are action words the same as verbs?", answer: "Yes. 'Action word' is the simpler term used in early grades for a verb that shows an action." },
    ],
    related: [
      { subjectSlug: "english", slug: "naming-words", label: "Naming words" },
    ],
    ctaService: "english",
    ctaLabel: "Grammar basics with patient 1-to-1 help. Book a free English assessment.",
  },
  {
    slug: "naming-words",
    subjectSlug: "english",
    heading: "Naming Words",
    metaTitle: "Naming Words — Meaning, Examples & List (Nouns)",
    metaDescription:
      "Naming words are nouns — words that name a person, place, animal or thing. Their meaning, types, and clear examples for young learners.",
    primaryKeyword: "naming words",
    monthlyVolume: 22200,
    answer:
      "Naming words are nouns — words that name a person, place, animal or thing. Teacher, Delhi, dog, apple and happiness are all naming words. They tell us who or what a sentence is about.",
    table: {
      caption: "Types of naming words with examples",
      headers: ["Type", "Names…", "Examples"],
      rows: [
        ["Person", "people", "teacher, doctor, Riya"],
        ["Place", "places", "school, Delhi, park"],
        ["Animal", "animals", "dog, tiger, parrot"],
        ["Thing", "objects", "apple, book, chair"],
        ["Feeling / idea", "things you cannot touch", "happiness, honesty, fear"],
      ],
    },
    sections: [
      {
        heading: "Common and proper naming words",
        body: [
          "A common naming word names any one of a group — boy, city, river. A proper naming word names one particular one and always starts with a capital letter — Arjun, Mumbai, Ganga.",
          "Some naming words name things you cannot see or touch, like feelings and ideas: love, courage, freedom. These are called abstract nouns.",
        ],
      },
    ],
    faqs: [
      { question: "What are naming words?", answer: "Naming words are nouns — they name a person, place, animal, thing, feeling or idea." },
      { question: "Give examples of naming words.", answer: "Teacher, school, dog, apple and happiness are all naming words." },
      { question: "What is the difference between a naming word and an action word?", answer: "A naming word (noun) names who or what a sentence is about; an action word (verb) shows what they do." },
    ],
    related: [
      { subjectSlug: "english", slug: "action-words", label: "Action words" },
    ],
    ctaService: "english",
    ctaLabel: "Nouns, verbs and sentence-building, one-to-one. Try a free English assessment.",
  },
];

export function getConcept(subjectSlug: string, slug: string) {
  return concepts.find((c) => c.subjectSlug === subjectSlug && c.slug === slug);
}

export function conceptsForSubject(subjectSlug: string) {
  return concepts.filter((c) => c.subjectSlug === subjectSlug);
}
