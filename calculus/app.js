// ===== PROBLEM BANK =====
const PROBLEMS = [
    {
        integral: "\\int 2x \\cos(x^2)\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "x^2",
                choices: ["x^2", "\\cos(x^2)", "2x", "\\sin(x^2)"],
                correctExplanation: "Korrekt! Vi vælger $u = x^2$, fordi dens afledte $2x$ optræder som en faktor.",
                wrongExplanation: "Den indre funktion er $u = x^2$, fordi dens afledte $2x$ allerede står som faktor i integralet.",
                hint: "<strong>Hvad er en indre funktion?</strong> Når vi har en sammensat funktion som $\\cos(x^2)$, er den <strong>indre funktion</strong> det udtryk, der sidder <em>inde i</em> den ydre. Her er $\\cos(\\square)$ den ydre, og det der sidder i $\\square$ er den indre. Kig på hvad der står inde i $\\cos$-funktionen — det er dit $u$!"
            },
            {
                prompt: "Hvad er du?",
                correct: "2x\\,dx",
                choices: ["2x\\,dx", "x^2\\,dx", "\\cos(x^2)\\,dx", "2\\,dx"],
                correctExplanation: "Korrekt! Differentierer vi $u = x^2$, får vi $du = 2x\\,dx$.",
                wrongExplanation: "Husk: $u = x^2 \\Rightarrow du = 2x\\,dx$.",
                hint: "<strong>Hvad er du?</strong> Når du har valgt $u$, skal du differentiere det: $du = \\frac{du}{dx} \\cdot dx$. Her har vi $u = x^2$, så $\\frac{du}{dx} = 2x$, altså $du = 2x\\,dx$. Se om dette udtryk optræder i integralet!"
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "\\cos(u)",
                choices: ["\\cos(u)", "\\sin(u)", "u^2", "2u"],
                correctExplanation: "Korrekt! Vi sætter $u = x^2$ ind: $\\cos(x^2)$ bliver $\\cos(u)$, og $2x\\,dx$ er jo netop $du$ — så det hele forsvinder pænt ind i $\\int \\cos(u)\\,du$.",
                wrongExplanation: "Sæt $u = x^2$ ind: $\\cos(x^2) \\to \\cos(u)$, og $2x\\,dx = du$. Hele integralet bliver $\\int \\cos(u)\\,du$, så den ydre funktion er $\\cos(u)$.",
                hint: "<strong>Hvad er den ydre funktion?</strong> Den ydre funktion er den, der 'omslutter' $u$. Forestil dig at du erstatter $x^2$ med $u$ i integralet — hvad er det for en funktion, der står 'uden om' $u$?"
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\sin(x^2) + C",
                choices: ["\\sin(x^2) + C", "\\cos(x^2) + C", "-\\sin(x^2) + C", "x\\sin(x^2) + C"],
                correctExplanation: "Perfekt! $\\int \\cos(u)\\,du = \\sin(u) + C = \\sin(x^2) + C$. 🎉",
                wrongExplanation: "$\\int \\cos(u)\\,du = \\sin(u) + C$. Husk at sætte $u = x^2$ tilbage.",
                hint: "<strong>Find resultatet!</strong> Du skal nu integrere den ydre funktion $\\cos(u)$ m.h.t. $u$. Hvad er stamfunktionen til $\\cos(u)$? Husk at sætte $u = x^2$ tilbage til sidst, og glem ikke $+ C$!"
            }
        ]
    },
    {
        integral: "\\int 3x^2 e^{x^3}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "x^3",
                choices: ["x^3", "e^{x^3}", "3x^2", "x^2"],
                correctExplanation: "Korrekt! $u = x^3$, og dens afledte $3x^2$ er allerede en faktor.",
                wrongExplanation: "Vi vælger $u = x^3$, fordi $\\frac{du}{dx} = 3x^2$ optræder i integralet.",
                hint: "<strong>Hvad er en indre funktion?</strong> Kig på $e^{x^3}$ — her er $e^{\\square}$ den ydre funktion, og $x^3$ sidder <em>inde i</em> eksponentfunktionen. Den indre funktion er det udtryk, der optræder som argument. Bonus-tip: tjek om den indre funktions afledte allerede findes i integralet!"
            },
            {
                prompt: "Hvad er du?",
                correct: "3x^2\\,dx",
                choices: ["3x^2\\,dx", "x^3\\,dx", "e^{x^3}\\,dx", "3x\\,dx"],
                correctExplanation: "Rigtigt! $du = 3x^2\\,dx$.",
                wrongExplanation: "$u = x^3 \\Rightarrow du = 3x^2\\,dx$.",
                hint: "<strong>Differentier u!</strong> Du har $u = x^3$. Brug potensreglen: $\\frac{d}{dx}(x^3) = 3x^2$. Altså er $du = 3x^2\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "e^u",
                choices: ["e^u", "u^3", "\\ln(u)", "3u^2"],
                correctExplanation: "Korrekt! Vi sætter $u = x^3$ ind: $e^{x^3}$ bliver $e^u$, og $3x^2\\,dx$ er præcis $du$ — så integralet bliver $\\int e^u\\,du$.",
                wrongExplanation: "Sæt $u = x^3$ ind: $e^{x^3} \\to e^u$, og $3x^2\\,dx = du$. Hele integralet bliver $\\int e^u\\,du$, så den ydre funktion er $e^u$.",
                hint: "<strong>Erstat u!</strong> Tag dit integral og erstat $x^3$ med $u$. Hvad står der uden om $u$? Det er $e^u$ — den ydre funktion."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "e^{x^3} + C",
                choices: ["e^{x^3} + C", "3x^2 e^{x^3} + C", "\\frac{e^{x^3}}{3x^2} + C", "x^3 e^{x^3} + C"],
                correctExplanation: "Perfekt! $\\int e^u\\,du = e^u + C = e^{x^3} + C$. 🎉",
                wrongExplanation: "$\\int e^u\\,du = e^u + C = e^{x^3} + C$.",
                hint: "<strong>Integrer!</strong> Stamfunktionen til $e^u$ er $e^u$ selv. Sæt derefter $u = x^3$ tilbage, og tilføj $+ C$."
            }
        ]
    },
    {
        integral: "\\int \\frac{2x}{x^2+1}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "x^2+1",
                choices: ["x^2+1", "2x", "\\frac{1}{x^2+1}", "x^2"],
                correctExplanation: "Korrekt! $u = x^2 + 1$, og $du = 2x\\,dx$ passer perfekt.",
                wrongExplanation: "Vi vælger $u = x^2 + 1$, fordi nævnerens afledte $2x$ optræder i tælleren.",
                hint: "<strong>Hvad er den indre funktion?</strong> Kig på nævneren $x^2 + 1$. Hvis vi vælger den som $u$, så er $du = 2x\\,dx$ — og kig! Tælleren er netop $2x$. Når den afledte af en del af integralet optræder som faktor, er den del et godt bud på $u$."
            },
            {
                prompt: "Hvad er du?",
                correct: "2x\\,dx",
                choices: ["2x\\,dx", "(x^2+1)\\,dx", "\\frac{1}{x^2+1}\\,dx", "x\\,dx"],
                correctExplanation: "Rigtigt! $du = 2x\\,dx$.",
                wrongExplanation: "$u = x^2+1 \\Rightarrow du = 2x\\,dx$.",
                hint: "<strong>Differentier!</strong> $u = x^2 + 1$. Afleder vi: $\\frac{du}{dx} = 2x$, altså $du = 2x\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "\\frac{1}{u}",
                choices: ["\\frac{1}{u}", "\\ln(u)", "u^2", "u+1"],
                correctExplanation: "Korrekt! Vi sætter $u = x^2+1$ ind: nævneren bliver $u$, og tælleren $2x\\,dx$ er jo netop $du$ — så brøken $\\frac{2x}{x^2+1}\\,dx$ bliver til $\\frac{1}{u}\\,du$.",
                wrongExplanation: "Sæt $u = x^2+1$ ind: $x^2+1 \\to u$, og $2x\\,dx = du$. Brøken forenkles til $\\frac{1}{u}\\,du$, så den ydre funktion er $\\frac{1}{u}$.",
                hint: "<strong>Hvad sker der, når vi substituerer?</strong> Vi erstatter $x^2+1$ med $u$ og $2x\\,dx$ med $du$. Brøken $\\frac{2x}{x^2+1}\\,dx$ bliver til $\\frac{1}{u}\\,du$."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\ln|x^2+1| + C",
                choices: ["\\ln|x^2+1| + C", "\\frac{1}{x^2+1} + C", "\\arctan(x) + C", "\\ln(2x) + C"],
                correctExplanation: "Perfekt! $\\int \\frac{1}{u}\\,du = \\ln|u| + C = \\ln|x^2+1| + C$. 🎉",
                wrongExplanation: "$\\int \\frac{1}{u}\\,du = \\ln|u| + C = \\ln|x^2+1| + C$.",
                hint: "<strong>Hvad er stamfunktionen til $\\frac{1}{u}$?</strong> Det er $\\ln|u|$. Sæt derefter $u = x^2+1$ ind igen."
            }
        ]
    },
    {
        integral: "\\int \\sin(3x)\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "3x",
                choices: ["3x", "\\sin(3x)", "\\cos(3x)", "x"],
                correctExplanation: "Korrekt! $u = 3x$, en simpel lineær substitution.",
                wrongExplanation: "Den indre funktion er $u = 3x$, fordi argumentet til $\\sin$ er sammensat.",
                hint: "<strong>Hvad er den indre funktion?</strong> I $\\sin(3x)$ er $\\sin(\\square)$ den ydre funktion. Det der sidder inde i sinus er $3x$ — det er den indre funktion! Selv en simpel lineær funktion som $3x$ kan være den indre funktion."
            },
            {
                prompt: "Hvad er du?",
                correct: "3\\,dx",
                choices: ["3\\,dx", "dx", "\\sin(3x)\\,dx", "3x\\,dx"],
                correctExplanation: "Rigtigt! $du = 3\\,dx$, altså $dx = \\frac{du}{3}$.",
                wrongExplanation: "$u = 3x \\Rightarrow du = 3\\,dx$, så $dx = \\frac{du}{3}$.",
                hint: "<strong>Differentier u!</strong> $u = 3x \\Rightarrow \\frac{du}{dx} = 3$, altså $du = 3\\,dx$. Det betyder at $dx = \\frac{du}{3}$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "\\sin(u)",
                choices: ["\\sin(u)", "\\cos(u)", "3\\sin(u)", "u"],
                correctExplanation: "Korrekt! Vi sætter $u = 3x$ ind: $\\sin(3x)$ bliver $\\sin(u)$. Og da $du = 3\\,dx$ (altså $dx = \\frac{du}{3}$), får vi $\\frac{1}{3}\\int \\sin(u)\\,du$.",
                wrongExplanation: "Sæt $u = 3x$ ind: $\\sin(3x) \\to \\sin(u)$, og $dx = \\frac{du}{3}$. Integralet er $\\frac{1}{3}\\int \\sin(u)\\,du$, så den ydre funktion er $\\sin(u)$.",
                hint: "<strong>Tænk i u!</strong> Erstat $3x$ med $u$. Funktionen rundt om $u$ er $\\sin(u)$ — det er den ydre funktion."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "-\\frac{1}{3}\\cos(3x) + C",
                choices: ["-\\frac{1}{3}\\cos(3x) + C", "\\frac{1}{3}\\cos(3x) + C", "-\\cos(3x) + C", "3\\cos(3x) + C"],
                correctExplanation: "Perfekt! $\\frac{1}{3}\\int \\sin(u)\\,du = -\\frac{1}{3}\\cos(u) + C = -\\frac{1}{3}\\cos(3x) + C$. 🎉",
                wrongExplanation: "$\\frac{1}{3} \\cdot (-\\cos(u)) + C = -\\frac{1}{3}\\cos(3x) + C$.",
                hint: "<strong>Integrer sinus!</strong> $\\int \\sin(u)\\,du = -\\cos(u) + C$. Husk faktoren $\\frac{1}{3}$ fra substitutionen, og sæt $u = 3x$ tilbage."
            }
        ]
    },
    {
        integral: "\\int x\\sqrt{x^2+4}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "x^2+4",
                choices: ["x^2+4", "\\sqrt{x^2+4}", "x", "x^2"],
                correctExplanation: "Korrekt! $u = x^2 + 4$, og $du = 2x\\,dx$.",
                wrongExplanation: "Vi vælger $u = x^2 + 4$, fordi dets afledte $2x$ (pånær en konstant) er til stede.",
                hint: "<strong>Hvad sidder inde i kvadratroden?</strong> Vi har $\\sqrt{x^2+4}$. Det udtryk <em>under</em> rodtegnet, nemlig $x^2+4$, er den indre funktion. Bemærk at dens afledte $2x$ er tæt på den $x$, der allerede er en faktor i integralet."
            },
            {
                prompt: "Hvad er du?",
                correct: "2x\\,dx",
                choices: ["2x\\,dx", "x\\,dx", "\\sqrt{x^2+4}\\,dx", "(x^2+4)\\,dx"],
                correctExplanation: "Rigtigt! $du = 2x\\,dx$, så $x\\,dx = \\frac{1}{2}du$.",
                wrongExplanation: "$u = x^2+4 \\Rightarrow du = 2x\\,dx$. Derfor er $x\\,dx = \\frac{1}{2}du$.",
                hint: "<strong>Differentier!</strong> $u = x^2 + 4 \\Rightarrow du = 2x\\,dx$. Vi har $x\\,dx$ i integralet, som svarer til $\\frac{1}{2}du$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "\\sqrt{u}",
                choices: ["\\sqrt{u}", "u^2", "\\frac{1}{u}", "u+4"],
                correctExplanation: "Korrekt! Vi sætter $u = x^2+4$ ind: $\\sqrt{x^2+4}$ bliver $\\sqrt{u}$. Og $x\\,dx = \\frac{1}{2}du$ (fordi $du = 2x\\,dx$), så integralet er $\\frac{1}{2}\\int \\sqrt{u}\\,du$.",
                wrongExplanation: "Sæt $u = x^2+4$ ind: $\\sqrt{x^2+4} \\to \\sqrt{u}$, og $x\\,dx = \\frac{1}{2}du$. Det giver $\\frac{1}{2}\\int \\sqrt{u}\\,du$, så den ydre funktion er $\\sqrt{u}$.",
                hint: "<strong>Hvad er uden om u?</strong> Vi erstatttede $x^2+4$ med $u$, og den funktion der står 'rundt om' er $\\sqrt{\\square}$, altså $\\sqrt{u}$."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\frac{1}{3}(x^2+4)^{3/2} + C",
                choices: ["\\frac{1}{3}(x^2+4)^{3/2} + C", "\\frac{2}{3}(x^2+4)^{3/2} + C", "\\frac{1}{2}\\sqrt{x^2+4} + C", "(x^2+4)^{3/2} + C"],
                correctExplanation: "Perfekt! $\\frac{1}{2} \\cdot \\frac{u^{3/2}}{3/2} = \\frac{1}{3}(x^2+4)^{3/2} + C$. 🎉",
                wrongExplanation: "$\\frac{1}{2}\\int u^{1/2}\\,du = \\frac{1}{2} \\cdot \\frac{2}{3}u^{3/2} = \\frac{1}{3}(x^2+4)^{3/2} + C$.",
                hint: "<strong>Potensreglen baglæns!</strong> $\\int u^{1/2}\\,du = \\frac{u^{3/2}}{3/2} = \\frac{2}{3}u^{3/2}$. Glem ikke faktoren $\\frac{1}{2}$ fra substitutionen!"
            }
        ]
    },
    {
        integral: "\\int \\cos(x)\\,e^{\\sin(x)}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "\\sin(x)",
                choices: ["\\sin(x)", "\\cos(x)", "e^{\\sin(x)}", "x"],
                correctExplanation: "Korrekt! $u = \\sin(x)$, og $du = \\cos(x)\\,dx$ er allerede til stede.",
                wrongExplanation: "Vi vælger $u = \\sin(x)$, fordi $du = \\cos(x)\\,dx$ optræder som faktor.",
                hint: "<strong>Hvad sidder i eksponenten?</strong> I $e^{\\sin(x)}$ er $\\sin(x)$ det indre udtryk. Et godt tegn: dens afledte $\\cos(x)$ er allerede en faktor i integralet! Det er det perfekte valg af $u$."
            },
            {
                prompt: "Hvad er du?",
                correct: "\\cos(x)\\,dx",
                choices: ["\\cos(x)\\,dx", "\\sin(x)\\,dx", "-\\sin(x)\\,dx", "e^{\\sin(x)}\\,dx"],
                correctExplanation: "Rigtigt! $du = \\cos(x)\\,dx$.",
                wrongExplanation: "$u = \\sin(x) \\Rightarrow du = \\cos(x)\\,dx$.",
                hint: "<strong>Differentier sinus!</strong> $u = \\sin(x) \\Rightarrow \\frac{du}{dx} = \\cos(x)$, så $du = \\cos(x)\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "e^u",
                choices: ["e^u", "\\sin(u)", "\\cos(u)", "u \\cdot e^u"],
                correctExplanation: "Korrekt! Vi sætter $u = \\sin(x)$ ind: $e^{\\sin(x)}$ bliver $e^u$, og $\\cos(x)\\,dx$ er netop $du$ — så integralet er $\\int e^u\\,du$.",
                wrongExplanation: "Sæt $u = \\sin(x)$ ind: $e^{\\sin(x)} \\to e^u$, og $\\cos(x)\\,dx = du$. Integralet er $\\int e^u\\,du$, så den ydre funktion er $e^u$.",
                hint: "<strong>Erstat!</strong> Sæt $u = \\sin(x)$. Hvad står der rundt om $u$? Det er $e^u$."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "e^{\\sin(x)} + C",
                choices: ["e^{\\sin(x)} + C", "\\cos(x)e^{\\sin(x)} + C", "-e^{\\sin(x)} + C", "\\sin(x)e^{\\sin(x)} + C"],
                correctExplanation: "Perfekt! $\\int e^u\\,du = e^u + C = e^{\\sin(x)} + C$. 🎉",
                wrongExplanation: "$\\int e^u\\,du = e^u + C = e^{\\sin(x)} + C$.",
                hint: "<strong>Integrer eksponentialfunktionen!</strong> $\\int e^u\\,du = e^u + C$. Sæt $u = \\sin(x)$ ind."
            }
        ]
    },
    {
        integral: "\\int \\frac{\\cos(\\ln x)}{x}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "\\ln x",
                choices: ["\\ln x", "\\frac{1}{x}", "\\cos(\\ln x)", "x"],
                correctExplanation: "Korrekt! $u = \\ln x$, og $du = \\frac{1}{x}\\,dx$.",
                wrongExplanation: "Vi vælger $u = \\ln x$, fordi $\\frac{du}{dx} = \\frac{1}{x}$ optræder i integralet.",
                hint: "<strong>Hvad sidder inde i cosinus?</strong> I $\\cos(\\ln x)$ er $\\ln x$ argumentet til $\\cos$. Det er den indre funktion! Bemærk at $\\frac{1}{x}$ (som er den afledte af $\\ln x$) allerede er en faktor."
            },
            {
                prompt: "Hvad er du?",
                correct: "\\frac{1}{x}\\,dx",
                choices: ["\\frac{1}{x}\\,dx", "\\ln x\\,dx", "x\\,dx", "\\cos(\\ln x)\\,dx"],
                correctExplanation: "Rigtigt! $du = \\frac{1}{x}\\,dx$.",
                wrongExplanation: "$u = \\ln x \\Rightarrow du = \\frac{1}{x}\\,dx$.",
                hint: "<strong>Den afledte af ln!</strong> $u = \\ln x \\Rightarrow \\frac{du}{dx} = \\frac{1}{x}$, så $du = \\frac{1}{x}\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "\\cos(u)",
                choices: ["\\cos(u)", "\\sin(u)", "\\frac{1}{u}", "\\ln(u)"],
                correctExplanation: "Korrekt! Vi sætter $u = \\ln x$ ind: $\\cos(\\ln x)$ bliver $\\cos(u)$, og $\\frac{1}{x}\\,dx$ er netop $du$ — så integralet er $\\int \\cos(u)\\,du$.",
                wrongExplanation: "Sæt $u = \\ln x$ ind: $\\cos(\\ln x) \\to \\cos(u)$, og $\\frac{1}{x}\\,dx = du$. Integralet er $\\int \\cos(u)\\,du$, så den ydre funktion er $\\cos(u)$.",
                hint: "<strong>Hvad er den ydre funktion?</strong> Vi erstatter $\\ln x$ med $u$. Det, der står rundt om $u$, er $\\cos(u)$."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\sin(\\ln x) + C",
                choices: ["\\sin(\\ln x) + C", "\\cos(\\ln x) + C", "-\\sin(\\ln x) + C", "\\ln(\\sin x) + C"],
                correctExplanation: "Perfekt! $\\int \\cos(u)\\,du = \\sin(u) + C = \\sin(\\ln x) + C$. 🎉",
                wrongExplanation: "$\\int \\cos(u)\\,du = \\sin(u) + C = \\sin(\\ln x) + C$.",
                hint: "<strong>Stamfunktion til cos!</strong> $\\int \\cos(u)\\,du = \\sin(u) + C$. Sæt $u = \\ln x$ tilbage."
            }
        ]
    },
    {
        integral: "\\int 4x^3(x^4-2)^5\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "x^4-2",
                choices: ["x^4-2", "4x^3", "(x^4-2)^5", "x^4"],
                correctExplanation: "Korrekt! $u = x^4 - 2$, og $du = 4x^3\\,dx$.",
                wrongExplanation: "Vi vælger $u = x^4 - 2$, fordi dens afledte $4x^3$ er en faktor i integralet.",
                hint: "<strong>Kig på potensudtrykket!</strong> Vi har $(x^4-2)^5$. Her er $\\square^5$ den ydre funktion, og <strong>$x^4 - 2$</strong> er det, der sidder inde i potensen — det er den indre funktion. Bonus: dens afledte $4x^3$ er allerede en faktor!"
            },
            {
                prompt: "Hvad er du?",
                correct: "4x^3\\,dx",
                choices: ["4x^3\\,dx", "(x^4-2)\\,dx", "5(x^4-2)^4\\,dx", "x^3\\,dx"],
                correctExplanation: "Rigtigt! $du = 4x^3\\,dx$.",
                wrongExplanation: "$u = x^4-2 \\Rightarrow du = 4x^3\\,dx$.",
                hint: "<strong>Differentier!</strong> $u = x^4 - 2 \\Rightarrow \\frac{du}{dx} = 4x^3$, så $du = 4x^3\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "u^5",
                choices: ["u^5", "u^4", "5u^4", "(u-2)^5"],
                correctExplanation: "Korrekt! Vi sætter $u = x^4-2$ ind: $(x^4-2)^5$ bliver $u^5$, og $4x^3\\,dx$ er netop $du$ — så integralet er $\\int u^5\\,du$.",
                wrongExplanation: "Sæt $u = x^4-2$ ind: $(x^4-2)^5 \\to u^5$, og $4x^3\\,dx = du$. Integralet er $\\int u^5\\,du$, så den ydre funktion er $u^5$.",
                hint: "<strong>Hvad er uden om u?</strong> Vi erstatttede $x^4-2$ med $u$. Det der står back er $u^5$ — en simpel potens."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\frac{(x^4-2)^6}{6} + C",
                choices: ["\\frac{(x^4-2)^6}{6} + C", "\\frac{(x^4-2)^5}{5} + C", "(x^4-2)^6 + C", "\\frac{4x^3(x^4-2)^6}{6} + C"],
                correctExplanation: "Perfekt! $\\int u^5\\,du = \\frac{u^6}{6} + C = \\frac{(x^4-2)^6}{6} + C$. 🎉",
                wrongExplanation: "$\\int u^5\\,du = \\frac{u^6}{6} + C = \\frac{(x^4-2)^6}{6} + C$.",
                hint: "<strong>Potensreglen!</strong> $\\int u^5\\,du = \\frac{u^{5+1}}{5+1} = \\frac{u^6}{6}$. Sæt $u = x^4-2$ tilbage."
            }
        ]
    },
    {
        integral: "\\int \\sec^2(x)\\tan(x)\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "\\tan(x)",
                choices: ["\\tan(x)", "\\sec^2(x)", "\\sec(x)", "x"],
                correctExplanation: "Korrekt! $u = \\tan(x)$, og $du = \\sec^2(x)\\,dx$.",
                wrongExplanation: "Vi vælger $u = \\tan(x)$, fordi $du = \\sec^2(x)\\,dx$ optræder i integralet.",
                hint: "<strong>Hvilken funktion har den anden som afledte?</strong> Vi har to funktioner: $\\sec^2(x)$ og $\\tan(x)$. Husk at $\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)$. Så $\\tan(x)$ er et naturligt valg af $u$, fordi dens afledte allerede er til stede!"
            },
            {
                prompt: "Hvad er du?",
                correct: "\\sec^2(x)\\,dx",
                choices: ["\\sec^2(x)\\,dx", "\\tan(x)\\,dx", "\\sec(x)\\tan(x)\\,dx", "2\\sec(x)\\,dx"],
                correctExplanation: "Rigtigt! $du = \\sec^2(x)\\,dx$.",
                wrongExplanation: "$u = \\tan(x) \\Rightarrow du = \\sec^2(x)\\,dx$.",
                hint: "<strong>Afledte af tan!</strong> $\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)$, så $du = \\sec^2(x)\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "u",
                choices: ["u", "u^2", "\\sec(u)", "\\tan(u)"],
                correctExplanation: "Korrekt! Vi sætter $u = \\tan(x)$ ind: $\\tan(x)$ bliver $u$, og $\\sec^2(x)\\,dx$ er netop $du$ — så integralet forenkles til $\\int u\\,du$.",
                wrongExplanation: "Sæt $u = \\tan(x)$ ind: $\\tan(x) \\to u$, og $\\sec^2(x)\\,dx = du$. Integralet er $\\int u\\,du$, så den ydre funktion er blot $u$.",
                hint: "<strong>Hvad bliver integralet?</strong> Erstat $\\tan(x)$ med $u$ og $\\sec^2(x)\\,dx$ med $du$. Så er integralet bare $\\int u\\,du$ — den ydre funktion er simpelthen $u$ selv!"
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "\\frac{\\tan^2(x)}{2} + C",
                choices: ["\\frac{\\tan^2(x)}{2} + C", "\\tan^2(x) + C", "\\sec^2(x) + C", "\\frac{\\sec^2(x)}{2} + C"],
                correctExplanation: "Perfekt! $\\int u\\,du = \\frac{u^2}{2} + C = \\frac{\\tan^2(x)}{2} + C$. 🎉",
                wrongExplanation: "$\\int u\\,du = \\frac{u^2}{2} + C = \\frac{\\tan^2(x)}{2} + C$.",
                hint: "<strong>Simpel potensintegration!</strong> $\\int u\\,du = \\frac{u^2}{2} + C$. Sæt $u = \\tan(x)$ ind."
            }
        ]
    },
    {
        integral: "\\int \\frac{e^{\\sqrt{x}}}{\\sqrt{x}}\\,dx",
        steps: [
            {
                prompt: "Hvad er den indre funktion u?",
                correct: "\\sqrt{x}",
                choices: ["\\sqrt{x}", "\\frac{1}{\\sqrt{x}}", "e^{\\sqrt{x}}", "x"],
                correctExplanation: "Korrekt! $u = \\sqrt{x}$, og $du = \\frac{1}{2\\sqrt{x}}\\,dx$.",
                wrongExplanation: "Vi vælger $u = \\sqrt{x}$, fordi $\\frac{1}{\\sqrt{x}}$ i integralet er relateret til $du$.",
                hint: "<strong>Hvad sidder i eksponenten?</strong> I $e^{\\sqrt{x}}$ er eksponenten $\\sqrt{x}$. Det er den indre funktion! Bemærk at $\\frac{1}{\\sqrt{x}}$ i integralet er tæt relateret til den afledte af $\\sqrt{x}$."
            },
            {
                prompt: "Hvad er du?",
                correct: "\\frac{1}{2\\sqrt{x}}\\,dx",
                choices: ["\\frac{1}{2\\sqrt{x}}\\,dx", "\\frac{1}{\\sqrt{x}}\\,dx", "\\sqrt{x}\\,dx", "2\\sqrt{x}\\,dx"],
                correctExplanation: "Rigtigt! $du = \\frac{1}{2\\sqrt{x}}\\,dx$, så $\\frac{1}{\\sqrt{x}}\\,dx = 2\\,du$.",
                wrongExplanation: "$u = \\sqrt{x} \\Rightarrow du = \\frac{1}{2\\sqrt{x}}\\,dx$, altså $\\frac{1}{\\sqrt{x}}\\,dx = 2\\,du$.",
                hint: "<strong>Differentier kvadratroden!</strong> $u = \\sqrt{x} = x^{1/2} \\Rightarrow \\frac{du}{dx} = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$. Altså $du = \\frac{1}{2\\sqrt{x}}\\,dx$."
            },
            {
                prompt: "Hvad er den ydre funktion f(u)?",
                correct: "e^u",
                choices: ["e^u", "\\frac{1}{u}", "u \\cdot e^u", "\\ln(u)"],
                correctExplanation: "Korrekt! Vi sætter $u = \\sqrt{x}$ ind: $e^{\\sqrt{x}}$ bliver $e^u$, og $\\frac{1}{\\sqrt{x}}\\,dx = 2\\,du$ — så integralet er $2\\int e^u\\,du$.",
                wrongExplanation: "Sæt $u = \\sqrt{x}$ ind: $e^{\\sqrt{x}} \\to e^u$, og $\\frac{1}{\\sqrt{x}}\\,dx = 2\\,du$. Integralet er $2\\int e^u\\,du$, så den ydre funktion er $e^u$.",
                hint: "<strong>Hvad er den ydre funktion?</strong> Erstat $\\sqrt{x}$ med $u$. Det der er rundt om $u$ er $e^u$."
            },
            {
                prompt: "Hvad er resultatet af integralet?",
                correct: "2e^{\\sqrt{x}} + C",
                choices: ["2e^{\\sqrt{x}} + C", "e^{\\sqrt{x}} + C", "\\frac{e^{\\sqrt{x}}}{2} + C", "\\sqrt{x}\\,e^{\\sqrt{x}} + C"],
                correctExplanation: "Perfekt! $2\\int e^u\\,du = 2e^u + C = 2e^{\\sqrt{x}} + C$. 🎉",
                wrongExplanation: "$2 \\cdot e^u + C = 2e^{\\sqrt{x}} + C$.",
                hint: "<strong>Integrer!</strong> $\\int e^u\\,du = e^u + C$. Gang med faktoren $2$, og sæt $u = \\sqrt{x}$ ind: $2e^{\\sqrt{x}} + C$."
            }
        ]
    }
];

// ===== MODE MANAGEMENT =====
let gameMode = 'menu'; // 'menu' | 'substitution' | 'formulas'

// ===== GAME STATE (substitution mode) =====
let autoAdvanceTimeout = null;

let state = {
    currentProblem: 0,
    currentStep: 0,
    xp: 0,
    hearts: 3,
    streak: 0,
    selectedChoice: null,
    phase: 'choosing', // 'choosing' | 'checked' | 'feedback'
    totalProblems: PROBLEMS.length,
    hintOpen: false,
    autoAdvancePaused: false,
};

// ===== DOM REFERENCES =====
const $ = id => document.getElementById(id);
const progressFill = $('progress-bar-fill');
const progressLabel = $('progress-label');
const heartsCount = $('hearts-count');
const xpCount = $('xp-count');
const streakCount = $('streak-count');
const heartsDisplay = $('hearts-display');
const problemIntegral = $('problem-integral');
const stepPrompt = $('step-prompt');
const choicesGrid = $('choices-grid');
const feedbackToast = $('feedback-toast');
const feedbackIcon = $('feedback-icon');
const feedbackTitle = $('feedback-title');
const feedbackExplanation = $('feedback-explanation');
const continueBtn = $('continue-btn');
const overlay = $('overlay');
const overlayIcon = $('overlay-icon');
const overlayTitle = $('overlay-title');
const overlayMessage = $('overlay-message');
const overlayBtn = $('overlay-btn');
const hintBtn = $('hint-btn');
const hintBubble = $('hint-bubble');
const hintContent = $('hint-content');

// ===== INIT =====
function init() {
    // Set up persistent event listeners
    continueBtn.addEventListener('click', onContinue);
    overlayBtn.addEventListener('click', onOverlayAction);
    hintBtn.addEventListener('click', toggleHint);

    // Back button
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', showMenu);

    // Formula reference button
    const formulaRefBtn = document.getElementById('formula-ref-btn');
    formulaRefBtn.addEventListener('click', showFormulaReference);
    document.getElementById('formula-ref-close').addEventListener('click', hideFormulaReference);
    document.getElementById('formula-ref-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideFormulaReference();
    });

    // Menu Formula reference button (vis og tilpas)
    const menuFormulaRefBtn = document.getElementById('menu-formula-ref-btn');
    if (menuFormulaRefBtn) {
        menuFormulaRefBtn.addEventListener('click', showFormulaReference);
    }

    // Overlay menu button
    document.getElementById('overlay-menu-btn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        showMenu();
    });

    // Menu card listeners
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Do not start mode if clicking on the toggle button container or buttons
            if (e.target.closest('.toggle-container')) return;
            startMode(card.dataset.mode);
        });
        
        card.addEventListener('keydown', (e) => {
            if (e.target.closest('.toggle-container')) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startMode(card.dataset.mode);
            }
        });
    });

    // Formula filter toggle listeners
    const toggleContainer = document.getElementById('formula-toggle-container');
    if (toggleContainer) {
        const toggleButtons = toggleContainer.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                selectedFormulaFilter = btn.dataset.filter;
                updateFormulaBadge();
            });
        });
    }

    // Formula constant toggle listeners
    const constantContainer = document.getElementById('formula-constant-container');
    if (constantContainer) {
        const toggleButtons = constantContainer.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                selectedFormulaConstantMode = btn.dataset.const;
            });
        });
    }

    // Show menu
    showMenu();
    
    // Update badge on load
    updateFormulaBadge();
}

function showMenu() {
    gameMode = 'menu';
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('top-bar').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('formula-ref-btn').classList.add('hidden');
    overlay.classList.add('hidden');
    hideFeedback();

    // Clear any pending auto-advances
    if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
        autoAdvanceTimeout = null;
    }
    if (window.formulaAutoAdvanceTimeout) {
        clearTimeout(window.formulaAutoAdvanceTimeout);
        window.formulaAutoAdvanceTimeout = null;
    }
    if (window.ruleBuilderAutoAdvanceTimeout) {
        clearTimeout(window.ruleBuilderAutoAdvanceTimeout);
        window.ruleBuilderAutoAdvanceTimeout = null;
    }

    const graphContainer = document.getElementById('problem-graph');
    if (graphContainer) graphContainer.classList.add('hidden');
}

function startMode(mode) {
    gameMode = mode;
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('top-bar').classList.remove('hidden');
    document.getElementById('app').classList.remove('hidden');

    const graphContainer = document.getElementById('problem-graph');
    if (graphContainer) graphContainer.classList.add('hidden');

    if (mode === 'substitution') {
        choicesGrid.className = '';
        document.getElementById('formula-ref-btn').classList.add('hidden');
        shuffleArray(PROBLEMS);
        state.currentProblem = 0;
        state.currentStep = 0;
        state.xp = 0;
        state.hearts = 3;
        state.streak = 0;
        state.selectedChoice = null;
        state.phase = 'choosing';
        state.hintOpen = false;
        loadProblem();
    } else if (mode === 'formulas') {
        choicesGrid.className = '';
        startFormulaQuiz();
    } else if (mode === 'rule-builder') {
        startRuleBuilder();
    }
}

// ===== HINT SYSTEM =====
function toggleHint() {
    state.hintOpen = !state.hintOpen;
    if (state.hintOpen) {
        const step = PROBLEMS[state.currentProblem].steps[state.currentStep];
        hintContent.innerHTML = step.hint;
        typeset(hintContent);
        hintBubble.classList.remove('hidden');
        hintBtn.classList.add('active');
    } else {
        hintBubble.classList.add('hidden');
        hintBtn.classList.remove('active');
    }
}

function hideHint() {
    state.hintOpen = false;
    hintBubble.classList.add('hidden');
    hintBtn.classList.remove('active');
}

// ===== RENDER =====
function updateStats() {
    heartsCount.textContent = '∞';
    xpCount.textContent = state.xp;
    streakCount.textContent = state.streak;
    const pct = ((state.currentProblem) / state.totalProblems) * 100;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `${state.currentProblem + 1} / ${state.totalProblems}`;
}

function loadProblem() {
    if (state.currentProblem >= state.totalProblems) {
        showComplete();
        return;
    }
    state.currentStep = 0;
    state.selectedChoice = null;
    state.phase = 'choosing';
    updateStats();
    const problem = PROBLEMS[state.currentProblem];
    document.getElementById('problem-label').textContent = 'Bestem integralet';
    problemIntegral.innerHTML = `$$${problem.integral}$$`;
    typeset(problemIntegral);

    const graphContainer = document.getElementById('problem-graph');
    if (graphContainer) graphContainer.classList.add('hidden');

    loadStep();
}

function loadStep() {
    const problem = PROBLEMS[state.currentProblem];
    if (state.currentStep >= problem.steps.length) {
        // Problem complete → next problem
        state.currentProblem++;
        loadProblem();
        return;
    }
    state.selectedChoice = null;
    state.phase = 'choosing';
    hideFeedback();
    hideHint();

    const step = problem.steps[state.currentStep];
    stepPrompt.textContent = step.prompt;

    // Show hint button if the step has a hint
    if (step.hint) {
        hintBtn.classList.remove('hidden');
    } else {
        hintBtn.classList.add('hidden');
    }

    // Build choice buttons
    const shuffled = [...step.choices];
    shuffleArray(shuffled);
    choicesGrid.innerHTML = '';
    shuffled.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `$${choice}$`;
        btn.dataset.value = choice;
        btn.addEventListener('click', () => selectChoice(btn, choice));
        choicesGrid.appendChild(btn);
    });
    typeset(choicesGrid);

    // Show continue button in "check" mode, disabled
    continueBtn.classList.add('hidden');
    continueBtn.disabled = true;
}

function selectChoice(btn, value) {
    if (state.phase === 'feedback') {
        if (btn.classList.contains('incorrect') && btn.classList.contains('selected')) {
            onContinue();
            return;
        }
        if (btn.classList.contains('correct')) {
            if (autoAdvanceTimeout) {
                // Pause the auto-advance!
                clearTimeout(autoAdvanceTimeout);
                autoAdvanceTimeout = null;
                state.autoAdvancePaused = true;

                // Visual feedback on continue button
                continueBtn.textContent = 'Fortsæt';
                continueBtn.classList.add('paused-pulse');
                setTimeout(() => continueBtn.classList.remove('paused-pulse'), 400);
            } else {
                // Already paused, so advance!
                advanceStep();
            }
            return;
        }
        return;
    }
    if (state.phase !== 'choosing') return;
    // Deselect previous
    choicesGrid.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedChoice = value;
    checkAnswer();
}

// ===== CONTINUE BUTTON =====
function onContinue() {
    if (continueBtn.disabled) return;

    if (gameMode === 'formulas') {
        onFormulaContinue();
        return;
    }
    if (gameMode === 'rule-builder') {
        onRuleBuilderContinue();
        return;
    }

    // Substitution mode
    if (state.phase === 'choosing') {
        checkAnswer();
    } else if (state.phase === 'feedback') {
        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }
        advanceStep();
    }
}

function checkAnswer() {
    const step = PROBLEMS[state.currentProblem].steps[state.currentStep];
    const isCorrect = state.selectedChoice === step.correct;

    state.phase = 'feedback';
    hideHint();
    hintBtn.classList.add('hidden');
    state.autoAdvancePaused = false;

    // Disable all buttons except the correct one and the selected incorrect one
    choicesGrid.querySelectorAll('.choice-btn').forEach(btn => {
        if (btn.dataset.value === step.correct) {
            btn.classList.add('correct');
            btn.disabled = false; // Keep clickable to pause/advance
        } else if (btn.classList.contains('selected') && !isCorrect) {
            btn.classList.add('incorrect');
            btn.disabled = false; // Keep clickable to advance
        } else {
            btn.disabled = true;
        }
    });

    if (isCorrect) {
        const streakBonus = Math.min(state.streak, 5);
        const xpGain = 10 + streakBonus * 2;
        state.xp += xpGain;
        state.streak++;
        showFeedback(true, 'Korrekt!', step.correctExplanation);
        showXpPop(`+${xpGain} XP`);
        continueBtn.className = 'next-correct';
        continueBtn.textContent = 'Fortsæt';

        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }
    } else {
        state.streak = 0;
        showFeedback(false, 'Ikke helt rigtigt', step.wrongExplanation);
        shakeHearts();
        continueBtn.className = 'next-incorrect';
        continueBtn.textContent = 'Forstået';
    }

    updateStats();
    continueBtn.disabled = false;
}

function advanceStep() {
    state.currentStep++;
    loadStep();
}

// ===== FEEDBACK =====
function showFeedback(correct, title, explanation) {
    feedbackToast.className = correct ? 'correct' : 'incorrect';
    feedbackIcon.textContent = correct ? '✅' : '❌';
    feedbackTitle.textContent = title;
    feedbackExplanation.innerHTML = explanation;
    typeset(feedbackExplanation);
    // trigger reflow
    void feedbackToast.offsetWidth;
    feedbackToast.classList.add('visible');
}

function hideFeedback() {
    feedbackToast.classList.remove('visible');
    setTimeout(() => {
        feedbackToast.className = 'hidden';
    }, 400);
}

// ===== XP POP =====
function showXpPop(text) {
    const el = document.createElement('div');
    el.className = 'xp-pop';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ===== HEART SHAKE =====
function shakeHearts() {
    heartsDisplay.classList.add('heart-shake');
    setTimeout(() => heartsDisplay.classList.remove('heart-shake'), 400);
}

// ===== OVERLAYS =====
function showGameOver() {
    overlayIcon.textContent = '💔';
    overlayTitle.textContent = 'Ingen liv tilbage!';
    overlayMessage.innerHTML = `Du nåede opgave ${state.currentProblem + 1} af ${state.totalProblems} og fik <strong>${state.xp} XP</strong>.`;
    overlayBtn.textContent = 'Prøv igen';
    overlayBtn.dataset.action = 'restart';
    overlay.classList.remove('hidden');
}

function showComplete() {
    overlayIcon.textContent = '🏆';
    overlayTitle.textContent = 'Alle opgaver klaret!';
    overlayMessage.innerHTML = `Fantastisk! Du fik <strong>${state.xp} XP</strong> med en max streak på ${findMaxStreak()}.`;
    overlayBtn.textContent = 'Spil igen';
    overlayBtn.dataset.action = 'restart';
    overlay.classList.remove('hidden');

    // fill progress bar fully
    progressFill.style.width = '100%';
    progressLabel.textContent = `${state.totalProblems} / ${state.totalProblems}`;
}

function onOverlayAction() {
    const action = overlayBtn.dataset.action;
    if (action === 'restart-formulas') {
        onFormulaOverlayAction();
        return;
    }
    if (action === 'restart-rule-builder') {
        onRuleBuilderOverlayAction();
        return;
    }
    if (action === 'restart') {
        overlay.classList.add('hidden');
        state.currentProblem = 0;
        state.currentStep = 0;
        state.xp = 0;
        state.hearts = 3;
        state.streak = 0;
        state.selectedChoice = null;
        state.phase = 'choosing';
        state.hintOpen = false;
        shuffleArray(PROBLEMS);
        loadProblem();
    }
}

function findMaxStreak() {
    return state.streak;
}

// ===== UTILITIES =====
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([el]).catch(err => console.warn('MathJax error:', err));
    }
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
