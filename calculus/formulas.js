// ===== FORMULA REFERENCE TABLE =====
// All standard derivatives and antiderivatives from the curriculum table
const FORMULA_TABLE = [
    { id: "zero", fn: "0", deriv: "0", anti: "k" },
    { id: "const", fn: "a", deriv: "0", anti: "a \\cdot x + k" },
    { id: "x", fn: "x", deriv: "1", anti: "\\tfrac{1}{2} x^2 + k" },
    { id: "xq", fn: "x^q", deriv: "q \\cdot x^{q-1}", anti: "\\tfrac{1}{q+1} \\cdot x^{q+1} + k" },
    { id: "invx", fn: "\\dfrac{1}{x}", deriv: "-\\dfrac{1}{x^2}", anti: "\\ln|x| + k" },
    { id: "ex", fn: "e^x", deriv: "e^x", anti: "e^x + k" },
    { id: "ebx", fn: "e^{b \\cdot x}", deriv: "b \\cdot e^{b \\cdot x}", anti: "\\dfrac{e^{b \\cdot x}}{b} + k" },
    { id: "ax", fn: "a^x", deriv: "a^x \\cdot \\ln(a)", anti: "\\dfrac{a^x}{\\ln(a)} + k" },
    { id: "lin", fn: "a \\cdot x + b", deriv: "a", anti: "\\tfrac{1}{2} a \\cdot x^2 + b \\cdot x + k" },
    { id: "b_ax", fn: "b \\cdot a^x", deriv: "b \\cdot a^x \\cdot \\ln(a)", anti: "\\dfrac{b}{\\ln(a)} \\cdot a^x + k" },
    { id: "b_xa", fn: "b \\cdot x^a", deriv: "b \\cdot a \\cdot x^{a-1}", anti: "\\dfrac{b}{a+1} \\cdot x^{a+1} + k" },
    { id: "lnx", fn: "\\ln(x)", deriv: "\\dfrac{1}{x}", anti: "x \\cdot \\ln(x) - x + k" },
    { id: "logx", fn: "\\log(x)", deriv: "\\dfrac{\\log(e)}{x}", anti: "\\log(e) \\cdot (x \\cdot \\ln(x) - x) + k" },
    { id: "sinx", fn: "\\sin(x)", deriv: "\\cos(x)", anti: "-\\cos(x) + k" },
    { id: "cosx", fn: "\\cos(x)", deriv: "-\\sin(x)", anti: "\\sin(x) + k" },
    { id: "tanx", fn: "\\tan(x)", deriv: "1 + \\tan^2(x) = \\dfrac{1}{\\cos^2(x)}", anti: "-\\ln|\\cos(x)| + k" },
    { id: "sincx", fn: "\\sin(c \\cdot x)", deriv: "c \\cdot \\cos(c \\cdot x)", anti: "-\\dfrac{\\cos(c \\cdot x)}{c} + k" },
    { id: "coscx", fn: "\\cos(c \\cdot x)", deriv: "-c \\cdot \\sin(c \\cdot x)", anti: "\\dfrac{\\sin(c \\cdot x)}{c} + k" },
    { id: "tancx", fn: "\\tan(c \\cdot x)", deriv: "c \\cdot (1 + \\tan^2(c \\cdot x))", anti: "-\\dfrac{\\ln|\\cos(c \\cdot x)|}{c} + k" },
];

// ===== FORMULA QUIZ QUESTIONS =====
const FORMULA_QUESTIONS = [
    // ── DERIVATIVE QUESTIONS (19) ──────────────────────────────
    {
        formulaId: "zero",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = 0",
        prompt: "Hvad er f'(x)?",
        correct: "0",
        choices: ["0", "1", "k", "c"],
        correctExplanation: "Korrekt! En konstant (her 0) har altid den afledte $0$.",
        wrongExplanation: "Den afledte af $0$ er $0$, da konstanter ikke ændrer sig."
    },
    {
        formulaId: "const",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = a \\quad (\\text{konstant})",
        prompt: "Hvad er f'(x)?",
        correct: "0",
        choices: ["0", "1", "a", "a \\cdot x"],
        correctExplanation: "Korrekt! En konstant har altid den afledte $0$.",
        wrongExplanation: "En konstant $a$ har altid den afledte $0$, fordi konstanter ikke ændrer sig."
    },
    {
        formulaId: "x",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = x",
        prompt: "Hvad er f'(x)?",
        correct: "1",
        choices: ["1", "0", "x", "2x"],
        correctExplanation: "Korrekt! $(x)' = 1$.",
        wrongExplanation: "Den afledte af $x$ er $1$. Potensreglen: $(x^1)' = 1 \\cdot x^0 = 1$."
    },
    {
        formulaId: "xq",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = x^q",
        prompt: "Hvad er f'(x)?",
        correct: "q \\cdot x^{q-1}",
        choices: ["q \\cdot x^{q-1}", "x^{q-1}", "q \\cdot x^q", "(q+1) \\cdot x^{q+1}"],
        correctExplanation: "Korrekt! Potensreglen: $(x^q)' = q \\cdot x^{q-1}$.",
        wrongExplanation: "Potensreglen siger: $(x^q)' = q \\cdot x^{q-1}$. Flyt eksponenten ned som faktor, og reducer eksponenten med 1."
    },
    {
        formulaId: "invx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\frac{1}{x}",
        prompt: "Hvad er f'(x)?",
        correct: "-\\frac{1}{x^2}",
        choices: ["-\\frac{1}{x^2}", "\\frac{1}{x^2}", "\\ln|x|", "-\\frac{1}{x}"],
        correctExplanation: "Korrekt! $(\\frac{1}{x})' = (x^{-1})' = -x^{-2} = -\\frac{1}{x^2}$.",
        wrongExplanation: "$(\\frac{1}{x})' = (x^{-1})' = -1 \\cdot x^{-2} = -\\frac{1}{x^2}$. Husk minustegnet!"
    },
    {
        formulaId: "ex",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = e^x",
        prompt: "Hvad er f'(x)?",
        correct: "e^x",
        choices: ["e^x", "x \\cdot e^{x-1}", "x \\cdot e^x", "e^{x-1}"],
        correctExplanation: "Korrekt! $e^x$ er sin egen afledte: $(e^x)' = e^x$.",
        wrongExplanation: "Eksponentialfunktionen er speciel: $(e^x)' = e^x$. Den er sin egen afledte!"
    },
    {
        formulaId: "ebx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = e^{b \\cdot x}",
        prompt: "Hvad er f'(x)?",
        correct: "b \\cdot e^{b \\cdot x}",
        choices: ["b \\cdot e^{b \\cdot x}", "e^{b \\cdot x}", "\\frac{e^{b \\cdot x}}{b}", "b \\cdot x \\cdot e^{b \\cdot x}"],
        correctExplanation: "Korrekt! Kædereglen giver $(e^{b \\cdot x})' = b \\cdot e^{b \\cdot x}$.",
        wrongExplanation: "Kædereglen: $(e^{b \\cdot x})' = b \\cdot e^{b \\cdot x}$. Den indre afledte $b$ ganges på."
    },
    {
        formulaId: "ax",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = a^x",
        prompt: "Hvad er f'(x)?",
        correct: "a^x \\cdot \\ln(a)",
        choices: ["a^x \\cdot \\ln(a)", "a^x", "x \\cdot a^{x-1}", "\\frac{a^x}{\\ln(a)}"],
        correctExplanation: "Korrekt! $(a^x)' = a^x \\cdot \\ln(a)$.",
        wrongExplanation: "$(a^x)' = a^x \\cdot \\ln(a)$. For generelle eksponentialfunktioner ganges med $\\ln(a)$."
    },
    {
        formulaId: "lin",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = a \\cdot x + b",
        prompt: "Hvad er f'(x)?",
        correct: "a",
        choices: ["a", "a \\cdot x", "b", "1"],
        correctExplanation: "Korrekt! $(a \\cdot x+b)' = a$. Hældningen af en ret linje.",
        wrongExplanation: "Den afledte af en lineær funktion $a \\cdot x + b$ er hældningen $a$. Konstanten $b$ forsvinder."
    },
    {
        formulaId: "b_ax",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = b \\cdot a^x",
        prompt: "Hvad er f'(x)?",
        correct: "b \\cdot a^x \\cdot \\ln(a)",
        choices: ["b \\cdot a^x \\cdot \\ln(a)", "b \\cdot a^x", "a^x \\cdot \\ln(a)", "b \\cdot x \\cdot a^{x-1}"],
        correctExplanation: "Korrekt! $(b \\cdot a^x)' = b \\cdot a^x \\cdot \\ln(a)$.",
        wrongExplanation: "Konstanten $b$ bevares, og $(a^x)' = a^x \\cdot \\ln(a)$. Samlet: $b \\cdot a^x \\cdot \\ln(a)$."
    },
    {
        formulaId: "b_xa",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = b \\cdot x^a",
        prompt: "Hvad er f'(x)?",
        correct: "b \\cdot a \\cdot x^{a-1}",
        choices: ["b \\cdot a \\cdot x^{a-1}", "a \\cdot x^{a-1}", "b \\cdot x^{a-1}", "b \\cdot (a+1) \\cdot x^{a+1}"],
        correctExplanation: "Korrekt! $(b \\cdot x^a)' = b \\cdot a \\cdot x^{a-1}$.",
        wrongExplanation: "Konstanten $b$ bevares, og potensreglen giver $(x^a)' = a \\cdot x^{a-1}$. Samlet: $b \\cdot a \\cdot x^{a-1}$."
    },
    {
        formulaId: "lnx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\ln(x)",
        prompt: "Hvad er f'(x)?",
        correct: "\\frac{1}{x}",
        choices: ["\\frac{1}{x}", "x", "\\frac{\\ln(x)}{x}", "-\\frac{1}{x^2}"],
        correctExplanation: "Korrekt! $(\\ln(x))' = \\frac{1}{x}$.",
        wrongExplanation: "Den naturlige logaritmes afledte er $(\\ln(x))' = \\frac{1}{x}$."
    },
    {
        formulaId: "logx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\log(x)",
        prompt: "Hvad er f'(x)?",
        correct: "\\frac{\\log(e)}{x}",
        choices: ["\\frac{\\log(e)}{x}", "\\frac{1}{x}", "\\frac{\\ln(x)}{x}", "\\frac{1}{x^2}"],
        correctExplanation: "Korrekt! $(\\log(x))' = \\frac{\\log(e)}{x}$.",
        wrongExplanation: "Titalslogaritmens afledte er $(\\log(x))' = \\frac{\\log(e)}{x}$. Bemærk forskellen fra $\\ln$!"
    },
    {
        formulaId: "sinx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\sin(x)",
        prompt: "Hvad er f'(x)?",
        correct: "\\cos(x)",
        choices: ["\\cos(x)", "-\\cos(x)", "-\\sin(x)", "\\sin(x)"],
        correctExplanation: "Korrekt! $(\\sin(x))' = \\cos(x)$.",
        wrongExplanation: "$(\\sin(x))' = \\cos(x)$. Sinus differentieres til cosinus (uden fortegnsskift)."
    },
    {
        formulaId: "cosx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\cos(x)",
        prompt: "Hvad er f'(x)?",
        correct: "-\\sin(x)",
        choices: ["-\\sin(x)", "\\sin(x)", "-\\cos(x)", "\\cos(x)"],
        correctExplanation: "Korrekt! $(\\cos(x))' = -\\sin(x)$. Husk minustegnet!",
        wrongExplanation: "$(\\cos(x))' = -\\sin(x)$. Cosinus differentieres til minus sinus!"
    },
    {
        formulaId: "tanx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\tan(x)",
        prompt: "Hvad er f'(x)?",
        correct: "1 + \\tan^2(x)",
        choices: ["1 + \\tan^2(x)", "\\tan^2(x)", "\\frac{1}{\\sin^2(x)}", "\\cos^2(x)"],
        correctExplanation: "Korrekt! $(\\tan(x))' = 1 + \\tan^2(x) = \\frac{1}{\\cos^2(x)}$.",
        wrongExplanation: "$(\\tan(x))' = 1 + \\tan^2(x)$, hvilket også kan skrives som $\\frac{1}{\\cos^2(x)}$."
    },
    {
        formulaId: "sincx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\sin(c \\cdot x)",
        prompt: "Hvad er f'(x)?",
        correct: "c \\cdot \\cos(c \\cdot x)",
        choices: ["c \\cdot \\cos(c \\cdot x)", "\\cos(c \\cdot x)", "-c \\cdot \\cos(c \\cdot x)", "c \\cdot \\sin(c \\cdot x)"],
        correctExplanation: "Korrekt! Kædereglen: $(\\sin(c \\cdot x))' = c \\cdot \\cos(c \\cdot x)$.",
        wrongExplanation: "Kædereglen: $(\\sin(c \\cdot x))' = c \\cdot \\cos(c \\cdot x)$. Den indre afledte $c$ ganges på."
    },
    {
        formulaId: "coscx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\cos(c \\cdot x)",
        prompt: "Hvad er f'(x)?",
        correct: "-c \\cdot \\sin(c \\cdot x)",
        choices: ["-c \\cdot \\sin(c \\cdot x)", "c \\cdot \\sin(c \\cdot x)", "-\\sin(c \\cdot x)", "-c \\cdot \\cos(c \\cdot x)"],
        correctExplanation: "Korrekt! $(\\cos(c \\cdot x))' = -c \\cdot \\sin(c \\cdot x)$.",
        wrongExplanation: "Kædereglen: $(\\cos(c \\cdot x))' = -c \\cdot \\sin(c \\cdot x)$. Husk minus fra cosinus OG den indre afledte $c$."
    },
    {
        formulaId: "tancx",
        label: "FIND DEN AFLEDTE",
        display: "f(x) = \\tan(c \\cdot x)",
        prompt: "Hvad er f'(x)?",
        correct: "c \\cdot (1 + \\tan^2(c \\cdot x))",
        choices: ["c \\cdot (1 + \\tan^2(c \\cdot x))", "1 + \\tan^2(c \\cdot x)", "c \\cdot \\tan^2(c \\cdot x)", "-c \\cdot (1 + \\tan^2(c \\cdot x))"],
        correctExplanation: "Korrekt! $(\\tan(c \\cdot x))' = c \\cdot (1 + \\tan^2(c \\cdot x))$.",
        wrongExplanation: "Kædereglen: $(\\tan(c \\cdot x))' = c \\cdot (1 + \\tan^2(c \\cdot x))$. Den indre afledte $c$ ganges på."
    },
 
    // ── ANTIDERIVATIVE QUESTIONS (19) ──────────────────────────
    {
        formulaId: "zero",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = 0",
        prompt: "Hvad er F(x)?",
        correct: "k",
        choices: ["k", "0", "x + k", "c \\cdot x + k"],
        correctExplanation: "Korrekt! Stamfunktionen til $0$ er en konstant $k$.",
        wrongExplanation: "Stamfunktionen til $0$ er en konstant $k$, da $(k)' = 0$."
    },
    {
        formulaId: "const",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = a \\quad (\\text{konstant})",
        prompt: "Hvad er F(x)?",
        correct: "a \\cdot x + k",
        choices: ["a \\cdot x + k", "a + k", "\\frac{a}{x} + k", "a \\cdot x^2 + k"],
        correctExplanation: "Korrekt! $\\int a\\,dx = a \\cdot x + k$.",
        wrongExplanation: "Stamfunktionen til en konstant $a$ er $a \\cdot x + k$."
    },
    {
        formulaId: "x",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = x",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{1}{2} x^2 + k",
        choices: ["\\frac{1}{2} x^2 + k", "x^2 + k", "\\frac{1}{3} x^3 + k", "2x + k"],
        correctExplanation: "Korrekt! $\\int x\\,dx = \\frac{1}{2}x^2 + k$.",
        wrongExplanation: "$\\int x\\,dx = \\frac{x^{1+1}}{1+1} + k = \\frac{1}{2}x^2 + k$."
    },
    {
        formulaId: "xq",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = x^q",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{1}{q+1} \\cdot x^{q+1} + k",
        choices: ["\\frac{1}{q+1} \\cdot x^{q+1} + k", "\\frac{1}{q} \\cdot x^{q+1} + k", "q \\cdot x^{q-1} + k", "(q+1) \\cdot x^{q+1} + k"],
        correctExplanation: "Korrekt! $\\int x^q\\,dx = \\frac{x^{q+1}}{q+1} + k$ (for $q \\neq -1$).",
        wrongExplanation: "Potensreglen baglæns: $\\int x^q\\,dx = \\frac{x^{q+1}}{q+1} + k$. Hæv eksponenten med 1, og divider med den nye eksponent."
    },
    {
        formulaId: "invx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\frac{1}{x}",
        prompt: "Hvad er F(x)?",
        correct: "\\ln|x| + k",
        choices: ["\\ln|x| + k", "-\\frac{1}{x^2} + k", "e^x + k", "x \\cdot \\ln(x) + k"],
        correctExplanation: "Korrekt! $\\int \\frac{1}{x}\\,dx = \\ln|x| + k$.",
        wrongExplanation: "$\\int \\frac{1}{x}\\,dx = \\ln|x| + k$. Dette er et vigtigt specialtilfælde (potensreglen virker ikke for $q = -1$)."
    },
    {
        formulaId: "ex",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = e^x",
        prompt: "Hvad er F(x)?",
        correct: "e^x + k",
        choices: ["e^x + k", "x \\cdot e^x + k", "\\frac{e^{x+1}}{x+1} + k", "\\ln(x) + k"],
        correctExplanation: "Korrekt! $\\int e^x\\,dx = e^x + k$. Eksponentialfunktionen er sin egen stamfunktion!",
        wrongExplanation: "$\\int e^x\\,dx = e^x + k$. $e^x$ er sin egen stamfunktion — ligesom den er sin egen afledte."
    },
    {
        formulaId: "ebx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = e^{b \\cdot x}",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{e^{b \\cdot x}}{b} + k",
        choices: ["\\frac{e^{b \\cdot x}}{b} + k", "e^{b \\cdot x} + k", "b \\cdot e^{b \\cdot x} + k", "\\frac{e^{b \\cdot x}}{b \\cdot x} + k"],
        correctExplanation: "Korrekt! $\\int e^{b \\cdot x}\\,dx = \\frac{e^{b \\cdot x}}{b} + k$.",
        wrongExplanation: "$\\int e^{b \\cdot x}\\,dx = \\frac{e^{b \\cdot x}}{b} + k$. Divider med den indre afledte $b$."
    },
    {
        formulaId: "ax",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = a^x",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{a^x}{\\ln(a)} + k",
        choices: ["\\frac{a^x}{\\ln(a)} + k", "a^x \\cdot \\ln(a) + k", "\\frac{a^{x+1}}{x+1} + k", "a^x + k"],
        correctExplanation: "Korrekt! $\\int a^x\\,dx = \\frac{a^x}{\\ln(a)} + k$.",
        wrongExplanation: "$\\int a^x\\,dx = \\frac{a^x}{\\ln(a)} + k$. Man dividerer med $\\ln(a)$ (modsat differentiation, hvor man ganger)."
    },
    {
        formulaId: "lin",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = a \\cdot x + b",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{1}{2} a \\cdot x^2 + b \\cdot x + k",
        choices: ["\\frac{1}{2} a \\cdot x^2 + b \\cdot x + k", "a \\cdot x^2 + b \\cdot x + k", "\\frac{1}{2} a \\cdot x^2 + k", "a + k"],
        correctExplanation: "Korrekt! $\\int (a \\cdot x+b)\\,dx = \\frac{1}{2} a \\cdot x^2 + b \\cdot x + k$.",
        wrongExplanation: "Integrer led for led: $\\int a \\cdot x\\,dx = \\frac{1}{2} a \\cdot x^2$ og $\\int b\\,dx = b \\cdot x$. Samlet: $\\frac{1}{2} a \\cdot x^2 + b \\cdot x + k$."
    },
    {
        formulaId: "b_ax",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = b \\cdot a^x",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{b}{\\ln(a)} \\cdot a^x + k",
        choices: ["\\frac{b}{\\ln(a)} \\cdot a^x + k", "b \\cdot a^x \\cdot \\ln(a) + k", "b \\cdot a^x + k", "\\frac{a^x}{\\ln(a)} + k"],
        correctExplanation: "Korrekt! $\\int b \\cdot a^x\\,dx = \\frac{b}{\\ln(a)} \\cdot a^x + k$.",
        wrongExplanation: "Konstanten $b$ bevares, og $\\int a^x\\,dx = \\frac{a^x}{\\ln(a)}$. Samlet: $\\frac{b}{\\ln(a)} \\cdot a^x + k$."
    },
    {
        formulaId: "b_xa",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = b \\cdot x^a",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{b}{a+1} \\cdot x^{a+1} + k",
        choices: ["\\frac{b}{a+1} \\cdot x^{a+1} + k", "b \\cdot a \\cdot x^{a-1} + k", "\\frac{b}{a} \\cdot x^{a+1} + k", "b \\cdot x^{a+1} + k"],
        correctExplanation: "Korrekt! $\\int b \\cdot x^a\\,dx = \\frac{b}{a+1} \\cdot x^{a+1} + k$.",
        wrongExplanation: "Potensreglen med konstant: $\\int b \\cdot x^a\\,dx = \\frac{b}{a+1} \\cdot x^{a+1} + k$."
    },
    {
        formulaId: "lnx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\ln(x)",
        prompt: "Hvad er F(x)?",
        correct: "x \\cdot \\ln(x) - x + k",
        choices: ["x \\cdot \\ln(x) - x + k", "\\frac{1}{x} + k", "x \\cdot \\ln(x) + k", "\\frac{\\ln(x)^2}{2} + k"],
        correctExplanation: "Korrekt! $\\int \\ln(x)\\,dx = x \\cdot \\ln(x) - x + k$.",
        wrongExplanation: "$\\int \\ln(x)\\,dx = x \\cdot \\ln(x) - x + k$. Denne skal man bare huske (den kan udledes med partiel integration)."
    },
    {
        formulaId: "logx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\log(x)",
        prompt: "Hvad er F(x)?",
        correct: "\\log(e) \\cdot (x \\cdot \\ln(x) - x) + k",
        choices: ["\\log(e) \\cdot (x \\cdot \\ln(x) - x) + k", "x \\cdot \\log(x) - x + k", "\\frac{\\log(e)}{x} + k", "x \\cdot \\ln(x) - x + k"],
        correctExplanation: "Korrekt! $\\int \\log(x)\\,dx = \\log(e) \\cdot (x\\ln(x) - x) + k$.",
        wrongExplanation: "$\\int \\log(x)\\,dx = \\log(e) \\cdot (x\\ln(x) - x) + k$. Bemærk faktoren $\\log(e)$!"
    },
    {
        formulaId: "sinx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\sin(x)",
        prompt: "Hvad er F(x)?",
        correct: "-\\cos(x) + k",
        choices: ["-\\cos(x) + k", "\\cos(x) + k", "-\\sin(x) + k", "\\sin(x) + k"],
        correctExplanation: "Korrekt! $\\int \\sin(x)\\,dx = -\\cos(x) + k$. Husk minustegnet!",
        wrongExplanation: "$\\int \\sin(x)\\,dx = -\\cos(x) + k$. Minustegnet er vigtigt!"
    },
    {
        formulaId: "cosx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\cos(x)",
        prompt: "Hvad er F(x)?",
        correct: "\\sin(x) + k",
        choices: ["\\sin(x) + k", "-\\sin(x) + k", "\\cos(x) + k", "-\\cos(x) + k"],
        correctExplanation: "Korrekt! $\\int \\cos(x)\\,dx = \\sin(x) + k$.",
        wrongExplanation: "$\\int \\cos(x)\\,dx = \\sin(x) + k$. Ingen fortegnsskift her!"
    },
    {
        formulaId: "tanx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\tan(x)",
        prompt: "Hvad er F(x)?",
        correct: "-\\ln|\\cos(x)| + k",
        choices: ["-\\ln|\\cos(x)| + k", "\\ln|\\cos(x)| + k", "-\\ln|\\sin(x)| + k", "\\frac{1}{\\cos^2(x)} + k"],
        correctExplanation: "Korrekt! $\\int \\tan(x)\\,dx = -\\ln|\\cos(x)| + k$.",
        wrongExplanation: "$\\int \\tan(x)\\,dx = -\\ln|\\cos(x)| + k$. Denne formel skal man huske!"
    },
    {
        formulaId: "sincx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\sin(c \\cdot x)",
        prompt: "Hvad er F(x)?",
        correct: "-\\frac{\\cos(c \\cdot x)}{c} + k",
        choices: ["-\\frac{\\cos(c \\cdot x)}{c} + k", "\\frac{\\cos(c \\cdot x)}{c} + k", "-c \\cdot \\cos(c \\cdot x) + k", "-\\cos(c \\cdot x) + k"],
        correctExplanation: "Korrekt! $\\int \\sin(c \\cdot x)\\,dx = -\\frac{\\cos(c \\cdot x)}{c} + k$.",
        wrongExplanation: "$\\int \\sin(c \\cdot x)\\,dx = -\\frac{\\cos(c \\cdot x)}{c} + k$. Divider med den indre afledte $c$."
    },
    {
        formulaId: "coscx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\cos(c \\cdot x)",
        prompt: "Hvad er F(x)?",
        correct: "\\frac{\\sin(c \\cdot x)}{c} + k",
        choices: ["\\frac{\\sin(c \\cdot x)}{c} + k", "-\\frac{\\sin(c \\cdot x)}{c} + k", "c \\cdot \\sin(c \\cdot x) + k", "\\sin(c \\cdot x) + k"],
        correctExplanation: "Korrekt! $\\int \\cos(c \\cdot x)\\,dx = \\frac{\\sin(c \\cdot x)}{c} + k$.",
        wrongExplanation: "$\\int \\cos(c \\cdot x)\\,dx = \\frac{\\sin(c \\cdot x)}{c} + k$. Divider med den indre afledte $c$."
    },
    {
        formulaId: "tancx",
        label: "FIND STAMFUNKTIONEN",
        display: "f(x) = \\tan(c \\cdot x)",
        prompt: "Hvad er F(x)?",
        correct: "-\\frac{\\ln|\\cos(c \\cdot x)|}{c} + k",
        choices: ["-\\frac{\\ln|\\cos(c \\cdot x)|}{c} + k", "\\frac{\\ln|\\cos(c \\cdot x)|}{c} + k", "-\\ln|\\cos(c \\cdot x)| + k", "-\\frac{\\cos(c \\cdot x)}{c} + k"],
        correctExplanation: "Korrekt! $\\int \\tan(c \\cdot x)\\,dx = -\\frac{\\ln|\\cos(c \\cdot x)|}{c} + k$.",
        wrongExplanation: "$\\int \\tan(c \\cdot x)\\,dx = -\\frac{\\ln|\\cos(c \\cdot x)|}{c} + k$. Divider med den indre afledte $c$."
    },
];

// ===== FORMULA QUIZ STATE =====
let selectedFormulaFilter = 'both'; // 'both' | 'derivatives' | 'antiderivatives'
let selectedFormulaConstantMode = 'symbols'; // 'symbols' | 'numbers'
var formulaAutoAdvanceTimeout = null;

let formulaState = {
    questions: [],
    currentQuestion: 0,
    xp: 0,
    hearts: 5,
    streak: 0,
    maxStreak: 0,
    selectedChoice: null,
    phase: 'choosing',
    totalQuestions: 0,
    currentConstantMap: null,
    autoAdvancePaused: false,
};

function generateConstantMap() {
    const a = Math.floor(Math.random() * 19) + 2; // 2 to 20
    let b = Math.floor(Math.random() * 19) + 2;
    while (b === a) {
        b = Math.floor(Math.random() * 19) + 2;
    }
    const c = Math.floor(Math.random() * 19) + 2;
    return { a, b, c };
}

function replaceLaTeXVars(str, varMap) {
    if (!str) return str;
    const regex = /(\\[a-zA-Z]+)|\b(a|b|c)\b/g;
    return str.replace(regex, (match, p1, p2) => {
        if (p1) return p1;
        if (p2) return varMap[p2] !== undefined ? varMap[p2] : p2;
        return match;
    });
}

const STORAGE_KEY = 'calculus_enabled_formulas_v2';
const STORAGE_KEY_PERF = 'calculus_formula_performance';

function getEnabledFormulas() {
    const state = {
        derivatives: {},
        antiderivatives: {}
    };
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load enabled formulas:", e);
    }
    
    // Fallback/Migration from v1
    try {
        const oldStored = localStorage.getItem('calculus_enabled_formulas');
        if (oldStored) {
            const oldState = JSON.parse(oldStored);
            FORMULA_TABLE.forEach(row => {
                const isEnabled = oldState[row.id] !== false;
                state.derivatives[row.id] = isEnabled;
                state.antiderivatives[row.id] = isEnabled;
            });
            saveEnabledFormulas(state);
            return state;
        }
    } catch (e) {}

    // Default: all enabled
    FORMULA_TABLE.forEach(row => {
        state.derivatives[row.id] = true;
        state.antiderivatives[row.id] = true;
    });
    return state;
}

function saveEnabledFormulas(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save enabled formulas:", e);
    }
}

function getPerformanceState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PERF);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load performance state:", e);
    }
    return {};
}

function savePerformanceState(state) {
    try {
        localStorage.setItem(STORAGE_KEY_PERF, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save performance state:", e);
    }
}

function updateQuestionPerformance(formulaId, isDeriv, isCorrect) {
    const state = getPerformanceState();
    const key = `${formulaId}_${isDeriv ? "deriv" : "anti"}`;
    
    if (!state[key]) {
        state[key] = { streak: 0, wrongCount: 0 };
    }
    
    if (isCorrect) {
        state[key].streak += 1;
    } else {
        state[key].streak = 0;
        state[key].wrongCount += 1;
    }
    
    savePerformanceState(state);
    return state[key];
}

function getQuestionKey(q) {
    const isDeriv = q.label === "FIND DEN AFLEDTE";
    return `${q.formulaId}_${isDeriv ? "deriv" : "anti"}`;
}

function getSessionQuestionWeight(q, sessionPerf) {
    const key = getQuestionKey(q);
    const perf = sessionPerf[key] || { streak: 0, wrongCount: 0 };

    if (perf.streak >= 3) {
        return 0; // Retired
    }

    let weight = 1.0;
    if (perf.streak === 1) {
        weight = 0.5;
    } else if (perf.streak === 2) {
        weight = 0.25;
    }

    // Boost weight for wrong answers in this session
    if (perf.wrongCount > 0) {
        weight *= (1.0 + perf.wrongCount * 1.5);
    }

    return weight;
}

function sampleNextWeightedQuestion(activePool, prevKey) {
    if (activePool.length === 0) return null;
    if (activePool.length === 1) return activePool[0];

    // Filter to avoid immediate back-to-back repeats of the same question
    let candidates = activePool;
    if (prevKey) {
        candidates = activePool.filter(q => getQuestionKey(q) !== prevKey);
    }
    
    // Safety fallback
    if (candidates.length === 0) {
        candidates = activePool;
    }

    const sessionPerf = formulaState.sessionPerf;
    const candidatesWithWeights = candidates.map(q => {
        const w = getSessionQuestionWeight(q, sessionPerf);
        return { question: q, weight: w };
    });

    const totalWeight = candidatesWithWeights.reduce((sum, c) => sum + c.weight, 0);

    // Roulette wheel selection
    let r = Math.random() * totalWeight;
    let selected = candidatesWithWeights[0].question;
    for (let i = 0; i < candidatesWithWeights.length; i++) {
        r -= candidatesWithWeights[i].weight;
        if (r <= 0) {
            selected = candidatesWithWeights[i].question;
            break;
        }
    }

    return selected;
}

function getEnabledFormulaQuestions() {
    const enabled = getEnabledFormulas();
    return FORMULA_QUESTIONS.filter(q => {
        const isDeriv = q.label === "FIND DEN AFLEDTE";
        const map = isDeriv ? enabled.derivatives : enabled.antiderivatives;
        
        if (map[q.formulaId] === false) return false;
        
        if (selectedFormulaFilter === 'derivatives' && !isDeriv) {
            return false;
        } else if (selectedFormulaFilter === 'antiderivatives' && isDeriv) {
            return false;
        }
        return true;
    });
}

function updateFormulaBadge() {
    const badge = document.getElementById('formula-badge');
    if (!badge) return;
    
    const count = getEnabledFormulaQuestions().length;
    badge.textContent = `${count} spørgsmål`;
}

function updateFormulaQueue() {
    if (gameMode !== 'formulas') return;

    const enabledPool = getEnabledFormulaQuestions();
    if (enabledPool.length === 0) {
        showFormulaComplete();
        return;
    }

    const sessionPerf = formulaState.sessionPerf;
    enabledPool.forEach(q => {
        const key = getQuestionKey(q);
        if (!sessionPerf[key]) {
            sessionPerf[key] = { streak: 0, wrongCount: 0 };
        }
    });

    const currentQ = formulaState.activeQuestion;
    const isCurrentStillEnabled = currentQ && enabledPool.some(q => getQuestionKey(q) === getQuestionKey(currentQ));
    const activePool = enabledPool.filter(q => sessionPerf[getQuestionKey(q)].streak < 3);

    if (activePool.length === 0) {
        showFormulaComplete();
        return;
    }

    if (!isCurrentStillEnabled || sessionPerf[getQuestionKey(currentQ)].streak >= 3) {
        formulaState.activeQuestion = sampleNextWeightedQuestion(activePool, currentQ ? getQuestionKey(currentQ) : null);
        loadFormulaQuestion();
    } else {
        updateFormulaStats();
    }
}

// ===== FORMULA QUIZ ENGINE =====
function startFormulaQuiz() {
    const pool = getEnabledFormulaQuestions();

    formulaState.sessionPerf = {};
    formulaState.currentConstantMap = null;
    formulaState.currentQuestionWithConstants = null;
    formulaState.autoAdvancePaused = false;
    pool.forEach(q => {
        formulaState.sessionPerf[getQuestionKey(q)] = { streak: 0, wrongCount: 0 };
    });

    formulaState.totalQuestions = pool.length;
    formulaState.currentQuestion = 0;
    formulaState.xp = 0;
    formulaState.hearts = 5;
    formulaState.streak = 0;
    formulaState.maxStreak = 0;
    formulaState.selectedChoice = null;
    formulaState.phase = 'choosing';

    formulaState.activeQuestion = sampleNextWeightedQuestion(pool, null);

    const heartsCount = document.getElementById('hearts-count');
    const xpCount = document.getElementById('xp-count');
    const streakCount = document.getElementById('streak-count');
    heartsCount.textContent = formulaState.hearts;
    xpCount.textContent = '0';
    streakCount.textContent = '0';

    document.getElementById('formula-ref-btn').classList.remove('hidden');
    document.getElementById('hint-btn').classList.add('hidden');
    document.getElementById('hint-bubble').classList.add('hidden');

    loadFormulaQuestion();
}

function updateFormulaStats() {
    const heartsCount = document.getElementById('hearts-count');
    const xpCount = document.getElementById('xp-count');
    const streakCount = document.getElementById('streak-count');
    const progressFill = document.getElementById('progress-bar-fill');
    const progressLabel = document.getElementById('progress-label');

    heartsCount.textContent = '∞';
    xpCount.textContent = formulaState.xp;
    streakCount.textContent = formulaState.streak;

    const enabled = getEnabledFormulaQuestions();
    const total = enabled.length;
    const completed = enabled.filter(q => {
        const key = getQuestionKey(q);
        const perf = formulaState.sessionPerf[key];
        return perf && perf.streak >= 3;
    }).length;

    const pct = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `Klaret: ${completed} / ${total}`;
}

// ===== DYNAMIC GRAPH PLOTTING FOR FORMULA QUESTIONS =====
function drawFormulaGraph(formulaId) {
    const container = document.getElementById('problem-graph');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 160;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    let xMin = -4;
    let xMax = 4;
    let yMin = -4;
    let yMax = 4;

    let label = '';
    let branches = [];

    switch (formulaId) {
        case 'zero':
            label = 'f(x) = 0';
            branches.push({ f: x => 0, xStart: -4, xEnd: 4 });
            break;
        case 'const':
            label = 'f(x) = 2';
            branches.push({ f: x => 2, xStart: -4, xEnd: 4 });
            break;
        case 'x':
            label = 'f(x) = x';
            branches.push({ f: x => x, xStart: -4, xEnd: 4 });
            break;
        case 'xq':
            label = 'f(x) = x^2';
            branches.push({ f: x => x * x, xStart: -2.2, xEnd: 2.2 });
            break;
        case 'invx':
            label = 'f(x) = 1/x';
            branches.push({ f: x => 1 / x, xStart: -4, xEnd: -0.2 });
            branches.push({ f: x => 1 / x, xStart: 0.2, xEnd: 4 });
            break;
        case 'ex':
            label = 'f(x) = e^x';
            branches.push({ f: x => Math.exp(x), xStart: -4, xEnd: 1.35 });
            break;
        case 'ebx':
            label = 'f(x) = e^{2x}';
            branches.push({ f: x => Math.exp(2 * x), xStart: -4, xEnd: 0.68 });
            break;
        case 'ax':
            label = 'f(x) = 2^x';
            branches.push({ f: x => Math.pow(2, x), xStart: -4, xEnd: 2 });
            break;
        case 'lin':
            label = 'f(x) = 2x + 1';
            branches.push({ f: x => 2 * x + 1, xStart: -2.5, xEnd: 1.5 });
            break;
        case 'b_ax':
            label = 'f(x) = 2 * 2^x';
            branches.push({ f: x => 2 * Math.pow(2, x), xStart: -4, xEnd: 1 });
            break;
        case 'b_xa':
            label = 'f(x) = 2x^2';
            branches.push({ f: x => 2 * x * x, xStart: -1.5, xEnd: 1.5 });
            break;
        case 'lnx':
            label = 'f(x) = ln(x)';
            branches.push({ f: x => Math.log(x), xStart: 0.05, xEnd: 4 });
            break;
        case 'logx':
            label = 'f(x) = log(x)';
            branches.push({ f: x => Math.log10(x), xStart: 0.05, xEnd: 4 });
            break;
        case 'sinx':
            label = 'f(x) = sin(x)';
            branches.push({ f: x => Math.sin(x), xStart: -4, xEnd: 4 });
            break;
        case 'cosx':
            label = 'f(x) = cos(x)';
            branches.push({ f: x => Math.cos(x), xStart: -4, xEnd: 4 });
            break;
        case 'tanx':
            label = 'f(x) = tan(x)';
            branches.push({ f: x => Math.tan(x), xStart: -4, xEnd: -1.75 });
            branches.push({ f: x => Math.tan(x), xStart: -1.4, xEnd: 1.4 });
            branches.push({ f: x => Math.tan(x), xStart: 1.75, xEnd: 4 });
            break;
        case 'sincx':
            label = 'f(x) = sin(2x)';
            branches.push({ f: x => Math.sin(2 * x), xStart: -4, xEnd: 4 });
            break;
        case 'coscx':
            label = 'f(x) = cos(2x)';
            branches.push({ f: x => Math.cos(2 * x), xStart: -4, xEnd: 4 });
            break;
        case 'tancx':
            label = 'f(x) = tan(2x)';
            branches.push({ f: x => Math.tan(2 * x), xStart: -4, xEnd: -2.5 });
            branches.push({ f: x => Math.tan(2 * x), xStart: -2.2, xEnd: -0.95 });
            branches.push({ f: x => Math.tan(2 * x), xStart: -0.7, xEnd: 0.7 });
            branches.push({ f: x => Math.tan(2 * x), xStart: 0.95, xEnd: 2.25 });
            branches.push({ f: x => Math.tan(2 * x), xStart: 2.5, xEnd: 4 });
            break;
        default:
            label = '';
            break;
    }

    const toCanvasX = x => ((x - xMin) / (xMax - xMin)) * W;
    const toCanvasY = y => H - ((y - yMin) / (yMax - yMin)) * H;

    ctx.clearRect(0, 0, W, H);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = xMin; x <= xMax; x++) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), 0);
        ctx.lineTo(toCanvasX(x), H);
        ctx.stroke();
    }
    for (let y = yMin; y <= yMax; y++) {
        ctx.beginPath();
        ctx.moveTo(0, toCanvasY(y));
        ctx.lineTo(W, toCanvasY(y));
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(W, toCanvasY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), H);
    ctx.stroke();

    // Tick labels
    ctx.fillStyle = '#9CAEB8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    [-2, 2].forEach(val => {
        const cx = toCanvasX(val);
        const cy = toCanvasY(0);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 3);
        ctx.lineTo(cx, cy + 3);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
        ctx.fillText(val, cx, cy + 5);
    });

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [-2, 2].forEach(val => {
        const cx = toCanvasX(0);
        const cy = toCanvasY(val);
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy);
        ctx.lineTo(cx + 3, cy);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
        ctx.fillText(val, cx - 5, cy);
    });

    // Draw Function
    ctx.strokeStyle = '#1CB0F6'; // Muted premium blue
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    branches.forEach(branch => {
        ctx.beginPath();
        let isFirst = true;
        const pts = 120;
        const xStep = (branch.xEnd - branch.xStart) / pts;
        for (let i = 0; i <= pts; i++) {
            const x = branch.xStart + i * xStep;
            const y = branch.f(x);
            if (isNaN(y) || !isFinite(y) || y < yMin - 5 || y > yMax + 5) {
                isFirst = true;
                continue;
            }
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            if (isFirst) {
                ctx.moveTo(cx, cy);
                isFirst = false;
            } else {
                ctx.lineTo(cx, cy);
            }
        }
        ctx.stroke();
    });

    // Draw Label Badge
    if (label) {
        ctx.font = 'bold 10px sans-serif';
        const labelW = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(26, 46, 56, 0.85)';
        ctx.fillRect(8, 8, labelW + 12, 18);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(8, 8, labelW + 12, 18);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 14, 17);
    }
}

function loadFormulaQuestion() {
    const enabledPool = getEnabledFormulaQuestions();
    const activePool = enabledPool.filter(q => formulaState.sessionPerf[getQuestionKey(q)].streak < 3);
    if (activePool.length === 0) {
        showFormulaComplete();
        return;
    }

    formulaState.selectedChoice = null;
    formulaState.phase = 'choosing';
    updateFormulaStats();

    const q = formulaState.activeQuestion;
    
    // Apply constant mode replacement if enabled
    let renderQ = q;
    if (selectedFormulaConstantMode === 'numbers') {
        if (!formulaState.currentConstantMap) {
            formulaState.currentConstantMap = generateConstantMap();
        }
        const cmap = formulaState.currentConstantMap;
        formulaState.currentQuestionWithConstants = {
            ...q,
            display: replaceLaTeXVars(q.display, cmap),
            correct: replaceLaTeXVars(q.correct, cmap),
            choices: q.choices.map(choice => replaceLaTeXVars(choice, cmap)),
            correctExplanation: replaceLaTeXVars(q.correctExplanation, cmap),
            wrongExplanation: replaceLaTeXVars(q.wrongExplanation, cmap)
        };
        renderQ = formulaState.currentQuestionWithConstants;
    } else {
        formulaState.currentQuestionWithConstants = null;
    }

    const problemLabel = document.getElementById('problem-label');
    const problemIntegral = document.getElementById('problem-integral');
    const stepPrompt = document.getElementById('step-prompt');
    const choicesGrid = document.getElementById('choices-grid');
    const continueBtn = document.getElementById('continue-btn');
    const feedbackToast = document.getElementById('feedback-toast');
    const hintBtn = document.getElementById('hint-btn');

    // Set problem card
    problemLabel.textContent = renderQ.label;
    problemIntegral.innerHTML = `$$${renderQ.display}$$`;
    typeset(problemIntegral);

    // Draw function graph
    drawFormulaGraph(q.formulaId);

    // Set prompt
    stepPrompt.textContent = renderQ.prompt;

    // Hide hint button and feedback
    hintBtn.classList.add('hidden');
    document.getElementById('hint-bubble').classList.add('hidden');
    feedbackToast.classList.remove('visible');
    setTimeout(() => { feedbackToast.className = 'hidden'; }, 400);

    // Build choices
    const shuffled = [...renderQ.choices];
    shuffleArray(shuffled);
    choicesGrid.innerHTML = '';
    shuffled.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `$${choice}$`;
        btn.dataset.value = choice;
        btn.addEventListener('click', () => selectFormulaChoice(btn, choice));
        choicesGrid.appendChild(btn);
    });
    typeset(choicesGrid);

    // Reset continue button
    continueBtn.classList.add('hidden');
    continueBtn.disabled = true;
}

function selectFormulaChoice(btn, value) {
    if (formulaState.phase === 'feedback') {
        if (btn.classList.contains('incorrect') && btn.classList.contains('selected')) {
            onFormulaContinue();
            return;
        }
        if (btn.classList.contains('correct')) {
            if (formulaAutoAdvanceTimeout) {
                // Pause the auto-advance!
                clearTimeout(formulaAutoAdvanceTimeout);
                formulaAutoAdvanceTimeout = null;
                formulaState.autoAdvancePaused = true;

                // Visual feedback on continue button
                const continueBtn = document.getElementById('continue-btn');
                continueBtn.textContent = 'Fortsæt';
                continueBtn.classList.add('paused-pulse');
                setTimeout(() => continueBtn.classList.remove('paused-pulse'), 400);
            } else {
                // Already paused, so advance!
                formulaState.currentConstantMap = null;
                formulaState.currentQuestionWithConstants = null;
                formulaState.currentQuestion++;
                const enabledPool = getEnabledFormulaQuestions();
                const activePool = enabledPool.filter(q => formulaState.sessionPerf[getQuestionKey(q)].streak < 3);

                if (activePool.length === 0) {
                    showFormulaComplete();
                    return;
                }
                formulaState.activeQuestion = sampleNextWeightedQuestion(activePool, getQuestionKey(formulaState.activeQuestion));
                loadFormulaQuestion();
            }
            return;
        }
        return;
    }
    if (formulaState.phase !== 'choosing') return;
    const choicesGrid = document.getElementById('choices-grid');
    choicesGrid.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    formulaState.selectedChoice = value;
    checkFormulaAnswer();
}

function onFormulaContinue() {
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn.disabled) return;

    if (formulaState.phase === 'choosing') {
        checkFormulaAnswer();
    } else if (formulaState.phase === 'feedback') {
        if (formulaAutoAdvanceTimeout) {
            clearTimeout(formulaAutoAdvanceTimeout);
            formulaAutoAdvanceTimeout = null;
        }
        const enabledPool = getEnabledFormulaQuestions();
        const activePool = enabledPool.filter(q => formulaState.sessionPerf[getQuestionKey(q)].streak < 3);

        if (activePool.length === 0) {
            showFormulaComplete();
            return;
        }

        formulaState.currentConstantMap = null;
        formulaState.currentQuestionWithConstants = null;
        formulaState.currentQuestion++;
        formulaState.activeQuestion = sampleNextWeightedQuestion(activePool, getQuestionKey(formulaState.activeQuestion));
        loadFormulaQuestion();
    }
}

function checkFormulaAnswer() {
    const q = formulaState.activeQuestion;
    const currentQ = formulaState.currentQuestionWithConstants || q;
    const isCorrect = formulaState.selectedChoice === currentQ.correct;
    const choicesGrid = document.getElementById('choices-grid');
    const continueBtn = document.getElementById('continue-btn');
    const feedbackToast = document.getElementById('feedback-toast');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackExplanation = document.getElementById('feedback-explanation');
    const heartsDisplay = document.getElementById('hearts-display');

    formulaState.phase = 'feedback';
    formulaState.autoAdvancePaused = false;

    // Mark correct/incorrect, disable all except the selected incorrect or correct one
    choicesGrid.querySelectorAll('.choice-btn').forEach(btn => {
        if (btn.dataset.value === currentQ.correct) {
            btn.classList.add('correct');
            btn.disabled = false; // Keep clickable to pause/advance
        } else if (btn.classList.contains('selected') && !isCorrect) {
            btn.classList.add('incorrect');
            btn.disabled = false; // Keep clickable to advance
        } else {
            btn.disabled = true;
        }
    });

    const isDeriv = q.label === "FIND DEN AFLEDTE";
    // Update global persistent performance
    updateQuestionPerformance(q.formulaId, isDeriv, isCorrect);

    // Update session performance
    const key = getQuestionKey(q);
    const sPerf = formulaState.sessionPerf[key];
    if (isCorrect) {
        sPerf.streak += 1;
    } else {
        sPerf.streak = 0;
        sPerf.wrongCount += 1;
    }

    if (isCorrect) {
        const streakBonus = Math.min(formulaState.streak, 5);
        const xpGain = 10 + streakBonus * 2;
        formulaState.xp += xpGain;
        formulaState.streak++;
        if (formulaState.streak > formulaState.maxStreak) {
            formulaState.maxStreak = formulaState.streak;
        }

        let explanation = currentQ.correctExplanation;
        explanation += `<br><br><span style='color: var(--green); font-weight: 700;'>Session streak: ${sPerf.streak} / 3</span>`;
        if (sPerf.streak === 3) {
            explanation += " 🎉 <span style='color: var(--blue); font-weight: 700;'>Opgave klaret!</span>";
        }

        showFormulaFeedback(true, 'Korrekt!', explanation);
        showXpPop(`+${xpGain} XP`);
        continueBtn.className = 'next-correct';
        continueBtn.textContent = 'Fortsæt';

        if (formulaAutoAdvanceTimeout) {
            clearTimeout(formulaAutoAdvanceTimeout);
            formulaAutoAdvanceTimeout = null;
        }
    } else {
        formulaState.streak = 0;

        let explanation = currentQ.wrongExplanation;
        explanation += `<br><br><span style='color: var(--red); font-weight: 700;'>Session streak nulstillet (0 / 3)</span>`;
        if (sPerf.wrongCount > 0) {
            explanation += `<br><span style='color: var(--red); font-weight: 600;'>🔥 Vises oftere (fejl i denne session: ${sPerf.wrongCount})</span>`;
        }

        showFormulaFeedback(false, 'Ikke helt rigtigt', explanation);
        heartsDisplay.classList.add('heart-shake');
        setTimeout(() => heartsDisplay.classList.remove('heart-shake'), 400);
        continueBtn.className = 'next-incorrect';
        continueBtn.textContent = 'Forstået';
    }

    updateFormulaStats();
    continueBtn.disabled = false;
}


function showFormulaFeedback(correct, title, explanation) {
    const feedbackToast = document.getElementById('feedback-toast');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    feedbackToast.className = correct ? 'correct' : 'incorrect';
    feedbackIcon.textContent = correct ? '✅' : '❌';
    feedbackTitle.textContent = title;
    feedbackExplanation.innerHTML = explanation;
    typeset(feedbackExplanation);
    void feedbackToast.offsetWidth;
    feedbackToast.classList.add('visible');
}

function showFormulaComplete() {
    const overlay = document.getElementById('overlay');
    const overlayIcon = document.getElementById('overlay-icon');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const overlayBtn = document.getElementById('overlay-btn');
    const progressFill = document.getElementById('progress-bar-fill');
    const progressLabel = document.getElementById('progress-label');

    overlayIcon.textContent = '🏆';
    overlayTitle.textContent = 'Alle formler klaret!';
    overlayMessage.innerHTML = `Fantastisk! Du fik <strong>${formulaState.xp} XP</strong> med en max streak på ${formulaState.maxStreak}.`;
    overlayBtn.textContent = 'Spil igen';
    overlayBtn.dataset.action = 'restart-formulas';
    overlay.classList.remove('hidden');

    progressFill.style.width = '100%';
    progressLabel.textContent = `${formulaState.totalQuestions} / ${formulaState.totalQuestions}`;
}

function showFormulaGameOver() {
    const overlay = document.getElementById('overlay');
    const overlayIcon = document.getElementById('overlay-icon');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const overlayBtn = document.getElementById('overlay-btn');

    overlayIcon.textContent = '💔';
    overlayTitle.textContent = 'Ingen liv tilbage!';
    overlayMessage.innerHTML = `Du nåede spørgsmål ${formulaState.currentQuestion + 1} af ${formulaState.totalQuestions} og fik <strong>${formulaState.xp} XP</strong>.`;
    overlayBtn.textContent = 'Prøv igen';
    overlayBtn.dataset.action = 'restart-formulas';
    overlay.classList.remove('hidden');
}

function onFormulaOverlayAction() {
    document.getElementById('overlay').classList.add('hidden');
    startFormulaQuiz();
}

// ===== FORMULA REFERENCE TABLE =====
function showFormulaReference() {
    const overlay = document.getElementById('formula-ref-overlay');
    const tableWrap = document.getElementById('formula-ref-table-wrap');

    const enabled = getEnabledFormulas();

    // Check if all derivatives are enabled
    const allDerivsEnabled = FORMULA_TABLE.every(row => enabled.derivatives[row.id] !== false);
    const checkedHeaderDeriv = allDerivsEnabled ? ' checked' : '';

    // Check if all antiderivatives are enabled
    const allAntisEnabled = FORMULA_TABLE.every(row => enabled.antiderivatives[row.id] !== false);
    const checkedHeaderAnti = allAntisEnabled ? ' checked' : '';

    // Build the table HTML
    let html = '<table class="formula-table"><thead><tr>';
    html += '<th></th>'; // Row switch column
    html += '<th>Funktion<br><em>f(x)</em></th>';
    
    // Column header for Afledt with a master switch
    html += '<th>';
    html += '<div class="header-toggle-container">';
    html += '<label class="switch"><input type="checkbox" id="header-toggle-deriv"' + checkedHeaderDeriv + '><span class="slider"></span></label>';
    html += '<span>Afledt<br><em>f\'(x)</em></span>';
    html += '</div>';
    html += '</th>';
    
    // Column header for Stamfunktion with a master switch
    html += '<th>';
    html += '<div class="header-toggle-container">';
    html += '<label class="switch"><input type="checkbox" id="header-toggle-anti"' + checkedHeaderAnti + '><span class="slider"></span></label>';
    html += '<span>Stamfunktion<br><em>F(x)</em></span>';
    html += '</div>';
    html += '</th>';
    
    html += '</tr></thead><tbody>';

    const perf = getPerformanceState();

    FORMULA_TABLE.forEach(row => {
        const dEnabled = enabled.derivatives[row.id] !== false;
        const aEnabled = enabled.antiderivatives[row.id] !== false;
        const rEnabled = dEnabled || aEnabled;

        const rowClass = rEnabled ? '' : ' class="inactive"';
        const rowChecked = rEnabled ? ' checked' : '';
        const dChecked = dEnabled ? ' checked' : '';
        const aChecked = aEnabled ? ' checked' : '';

        const dCellClass = dEnabled ? '' : ' class="inactive"';
        const aCellClass = aEnabled ? '' : ' class="inactive"';
        const rCellClass = rEnabled ? '' : ' class="inactive"';

        const dPerf = perf[`${row.id}_deriv`] || { streak: 0, wrongCount: 0 };
        const aPerf = perf[`${row.id}_anti`] || { streak: 0, wrongCount: 0 };

        const dStasis = dPerf.streak >= 3 ? ' <span class="stasis-badge" title="I stasis (vises 8x sjældnere)">❄️</span>' : '';
        const aStasis = aPerf.streak >= 3 ? ' <span class="stasis-badge" title="I stasis (vises 8x sjældnere)">❄️</span>' : '';

        html += `<tr data-id="${row.id}"${rowClass}>`;
        
        // Col 1: Row switch
        html += `<td data-type="row-toggle"${rCellClass}><label class="switch"><input type="checkbox" class="row-checkbox"${rowChecked}><span class="slider"></span></label></td>`;
        
        // Col 2: Function
        html += `<td data-type="fn-text"${rCellClass}>$${row.fn}$</td>`;
        
        // Col 3: Derivative with switch
        html += `<td data-type="deriv-cell"${dCellClass}>`;
        html += `<div class="cell-content">`;
        html += `<label class="switch"><input type="checkbox" class="deriv-checkbox"${dChecked}><span class="slider"></span></label>`;
        html += `<span class="math-val">$${row.deriv}$${dStasis}</span>`;
        html += `</div>`;
        html += `</td>`;
        
        // Col 4: Antiderivative with switch
        html += `<td data-type="anti-cell"${aCellClass}>`;
        html += `<div class="cell-content">`;
        html += `<label class="switch"><input type="checkbox" class="anti-checkbox"${aChecked}><span class="slider"></span></label>`;
        html += `<span class="math-val">$${row.anti}$${aStasis}</span>`;
        html += `</div>`;
        html += `</td>`;
        
        html += '</tr>';
    });

    html += '</tbody></table>';
    tableWrap.innerHTML = html;
    typeset(tableWrap);

    // Helper to update cell classes/switches
    function updateCellUI(cell, state) {
        if (!cell) return;
        const checkbox = cell.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = state;
        if (state) {
            cell.classList.remove('inactive');
        } else {
            cell.classList.add('inactive');
        }
    }

    // Helper to update row switch based on cell active statuses
    function updateRowSwitchState(tr, formulaId, currentMap) {
        const dEnabled = currentMap.derivatives[formulaId] !== false;
        const aEnabled = currentMap.antiderivatives[formulaId] !== false;
        const rEnabled = dEnabled || aEnabled;

        const rowCheckbox = tr.querySelector('.row-checkbox');
        if (rowCheckbox) rowCheckbox.checked = rEnabled;

        const fnTextCell = tr.querySelector('[data-type="fn-text"]');
        const rowToggleCell = tr.querySelector('[data-type="row-toggle"]');

        if (rEnabled) {
            tr.classList.remove('inactive');
            if (fnTextCell) fnTextCell.classList.remove('inactive');
            if (rowToggleCell) rowToggleCell.classList.remove('inactive');
        } else {
            tr.classList.add('inactive');
            if (fnTextCell) fnTextCell.classList.add('inactive');
            if (rowToggleCell) rowToggleCell.classList.add('inactive');
        }
    }

    // Helper to keep column header switches in sync
    function updateHeaderToggles() {
        const currentMap = getEnabledFormulas();
        
        const allDerivsEnabled = FORMULA_TABLE.every(row => currentMap.derivatives[row.id] !== false);
        const headerToggleDeriv = document.getElementById('header-toggle-deriv');
        if (headerToggleDeriv) headerToggleDeriv.checked = allDerivsEnabled;

        const allAntisEnabled = FORMULA_TABLE.every(row => currentMap.antiderivatives[row.id] !== false);
        const headerToggleAnti = document.getElementById('header-toggle-anti');
        if (headerToggleAnti) headerToggleAnti.checked = allAntisEnabled;
    }

    // Bind header toggle event listeners
    const headerToggleDeriv = document.getElementById('header-toggle-deriv');
    if (headerToggleDeriv) {
        headerToggleDeriv.addEventListener('change', (e) => {
            const newState = e.target.checked;
            const currentMap = getEnabledFormulas();

            if (!newState) {
                // Check safety: at least 1 active antiderivative required to allow turning off all derivatives
                const activeAntis = FORMULA_TABLE.filter(row => currentMap.antiderivatives[row.id] !== false).length;
                if (activeAntis === 0) {
                    alert("Du skal have mindst ét spørgsmål slået til!");
                    e.target.checked = true; // revert checkbox
                    return;
                }
            }

            FORMULA_TABLE.forEach(row => {
                currentMap.derivatives[row.id] = newState;
            });
            saveEnabledFormulas(currentMap);

            showFormulaReference(); // Redraw
            updateFormulaQueue();
            updateFormulaBadge();
        });
    }

    const headerToggleAnti = document.getElementById('header-toggle-anti');
    if (headerToggleAnti) {
        headerToggleAnti.addEventListener('change', (e) => {
            const newState = e.target.checked;
            const currentMap = getEnabledFormulas();

            if (!newState) {
                // Check safety: at least 1 active derivative required to allow turning off all antiderivatives
                const activeDerivs = FORMULA_TABLE.filter(row => currentMap.derivatives[row.id] !== false).length;
                if (activeDerivs === 0) {
                    alert("Du skal have mindst ét spørgsmål slået til!");
                    e.target.checked = true; // revert checkbox
                    return;
                }
            }

            FORMULA_TABLE.forEach(row => {
                currentMap.antiderivatives[row.id] = newState;
            });
            saveEnabledFormulas(currentMap);

            showFormulaReference(); // Redraw
            updateFormulaQueue();
            updateFormulaBadge();
        });
    }

    // Bind click events to cells
    const rows = tableWrap.querySelectorAll('tbody tr');
    rows.forEach(tr => {
        const formulaId = tr.dataset.id;

        tr.querySelectorAll('td').forEach(td => {
            td.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') {
                    return; // Prevent click handling from double triggering on direct checkbox toggle
                }

                const type = td.dataset.type;
                const currentMap = getEnabledFormulas();
                const dEnabled = currentMap.derivatives[formulaId] !== false;
                const aEnabled = currentMap.antiderivatives[formulaId] !== false;

                if (type === 'deriv-cell') {
                    if (dEnabled) {
                        const activeCount = FORMULA_TABLE.filter(row => currentMap.derivatives[row.id] !== false).length +
                                            FORMULA_TABLE.filter(row => currentMap.antiderivatives[row.id] !== false).length;
                        if (activeCount <= 1) {
                            alert("Du skal have mindst ét spørgsmål slået til!");
                            return;
                        }
                    }

                    const newState = !dEnabled;
                    currentMap.derivatives[formulaId] = newState;
                    saveEnabledFormulas(currentMap);

                    updateCellUI(td, newState);
                    updateRowSwitchState(tr, formulaId, currentMap);
                    updateFormulaQueue();
                    updateFormulaBadge();
                    updateHeaderToggles();

                } else if (type === 'anti-cell') {
                    if (aEnabled) {
                        const activeCount = FORMULA_TABLE.filter(row => currentMap.derivatives[row.id] !== false).length +
                                            FORMULA_TABLE.filter(row => currentMap.antiderivatives[row.id] !== false).length;
                        if (activeCount <= 1) {
                            alert("Du skal have mindst ét spørgsmål slået til!");
                            return;
                        }
                    }

                    const newState = !aEnabled;
                    currentMap.antiderivatives[formulaId] = newState;
                    saveEnabledFormulas(currentMap);

                    updateCellUI(td, newState);
                    updateRowSwitchState(tr, formulaId, currentMap);
                    updateFormulaQueue();
                    updateFormulaBadge();
                    updateHeaderToggles();

                } else if (type === 'row-toggle' || type === 'fn-text') {
                    const currentlyActive = dEnabled || aEnabled;

                    if (currentlyActive) {
                        // Turning off both in the row. Validate total active questions count
                        const activeCount = FORMULA_TABLE.filter(row => currentMap.derivatives[row.id] !== false).length +
                                            FORMULA_TABLE.filter(row => currentMap.antiderivatives[row.id] !== false).length;
                        const thisRowActiveCount = (dEnabled ? 1 : 0) + (aEnabled ? 1 : 0);
                        if (activeCount - thisRowActiveCount <= 0) {
                            alert("Du skal have mindst ét spørgsmål slået til!");
                            return;
                        }
                    }

                    const newState = !currentlyActive;
                    currentMap.derivatives[formulaId] = newState;
                    currentMap.antiderivatives[formulaId] = newState;
                    saveEnabledFormulas(currentMap);

                    const rowCheckbox = tr.querySelector('.row-checkbox');
                    if (rowCheckbox) rowCheckbox.checked = newState;

                    const derivCell = tr.querySelector('[data-type="deriv-cell"]');
                    const antiCell = tr.querySelector('[data-type="anti-cell"]');
                    const fnTextCell = tr.querySelector('[data-type="fn-text"]');
                    const rowToggleCell = tr.querySelector('[data-type="row-toggle"]');

                    updateCellUI(derivCell, newState);
                    updateCellUI(antiCell, newState);

                    if (newState) {
                        tr.classList.remove('inactive');
                        if (fnTextCell) fnTextCell.classList.remove('inactive');
                        if (rowToggleCell) rowToggleCell.classList.remove('inactive');
                    } else {
                        tr.classList.add('inactive');
                        if (fnTextCell) fnTextCell.classList.add('inactive');
                        if (rowToggleCell) rowToggleCell.classList.add('inactive');
                    }

                    updateFormulaQueue();
                    updateFormulaBadge();
                    updateHeaderToggles();
                }
            });
        });
    });

    overlay.classList.remove('hidden');
}

function hideFormulaReference() {
    document.getElementById('formula-ref-overlay').classList.add('hidden');
}
