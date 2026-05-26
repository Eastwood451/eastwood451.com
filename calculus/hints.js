// ===== BEGINNER-FRIENDLY HINTS =====
// Patches richer pedagogical hints onto the PROBLEMS array.
// Each hint: 1) explains the concept, 2) guides thinking, 3) explains WHY.

const HINTS = [
    // Problem 0: ∫ 2x cos(x²) dx
    [
        // Step 0: indre funktion
        `<strong>Hvad betyder "indre funktion"?</strong>
Når du ser et udtryk som $\\cos(x^2)$, er der <em>to funktioner sat sammen</em>: en ydre ($\\cos$) og en indre ($x^2$). Den indre funktion er det, der sidder <strong>inde i</strong> den anden — altså argumentet.

<strong>Spørg dig selv:</strong> "Er der en funktion, der sidder inde i en anden funktion?" Kig efter parenteser, eksponenter eller rodtegn — det der står indeni, er ofte $u$.

<strong>Hvorfor?</strong> Hele idéen med substitution er at <em>forenkle</em> integralet. Vi kalder den indre funktion $u$, og håber at resten af integralet bliver til $du$. Så bliver det komplicerede integral til noget simpelt som $\\int \\cos(u)\\,du$.`,

        // Step 1: du
        `<strong>Hvad er $du$?</strong>
Når du har valgt $u$, skal du finde $du$ ved at <em>differentiere $u$</em> med hensyn til $x$. Resultatet er $du = u'(x)\\,dx$.

<strong>Spørg dig selv:</strong> "Hvad får jeg, hvis jeg differentierer $u$? Og optræder det resultat allerede som en faktor i integralet?"

<strong>Hvorfor?</strong> Vi skal erstatte $dx$ i integralet med noget udtrykt i $du$. Hvis $du$ passer med det, der allerede står i integralet, kan vi substituere direkte — og det er præcis det, der gør substitution mulig!`,

        // Step 2: ydre funktion
        `<strong>Hvad betyder "ydre funktion"?</strong>
Den ydre funktion er den, der "omslutter" den indre. I $\\cos(x^2)$ er $\\cos(\\square)$ den ydre funktion — den der tager $u$ som input.

<strong>Spørg dig selv:</strong> "Hvis jeg erstatter den indre funktion med $u$, hvad er der så tilbage?" Det er den ydre funktion $f(u)$.

<strong>Hvorfor?</strong> Efter substitution skal integralet skrives som $\\int f(u)\\,du$. Den ydre funktion $f(u)$ er det, vi rent faktisk integrerer — og den skal gerne være noget simpelt, vi kender stamfunktionen til.`,

        // Step 3: resultat
        `<strong>Hvordan finder man resultatet?</strong>
Nu har du et simpelt integral i $u$: find stamfunktionen, og sæt derefter $u$ tilbage til det oprindelige udtryk.

<strong>Spørg dig selv:</strong> "Hvad er stamfunktionen til $\\cos(u)$?" (Svar: $\\sin(u)$). Erstat derefter $u$ med $x^2$, og husk $+ C$.

<strong>Hvorfor $+ C$?</strong> Ubestemt integration giver en hel familie af funktioner — konstanten $C$ repræsenterer der, at vi ikke kender startværdien.`
    ],

    // Problem 1: ∫ 3x² eˣ³ dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I udtrykket $e^{x^3}$ er der to funktioner sat sammen: $e^{\\square}$ (den ydre) og $x^3$ (den indre). Den indre funktion sidder <em>inde i</em> den ydre — her som eksponent.

<strong>Spørg dig selv:</strong> "Er der et udtryk, der sidder som eksponent, argument i en parentes, eller under et rodtegn?" Hvis ja, er det et godt bud på $u$.

<strong>Hvorfor?</strong> Vi vil omskrive integralet til noget simpelt som $\\int e^u\\,du$. Det kræver, at den afledte af $u$ (altså $3x^2$) allerede optræder som faktor — og det gør den her!`,

        `<strong>Hvad er $du$?</strong>
Differentier dit valg af $u$: $u = x^3 \\Rightarrow du = 3x^2\\,dx$.

<strong>Spørg dig selv:</strong> "Optræder $3x^2\\,dx$ i integralet?" Ja! det er netop den faktor, der står foran $e^{x^3}$.

<strong>Hvorfor?</strong> Når $du$ matcher en del af integralet, kan vi erstatte den del med $du$, og alt "går op". Det er kernen i substitution.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $x^3$ med $u$ i dit integral. Det der er "rundt om" $u$ er den ydre funktion.

<strong>Spørg dig selv:</strong> "Hvad er integralet, når jeg skriver $u$ i stedet for $x^3$?" → $\\int e^u\\,du$.

<strong>Hvorfor?</strong> Den ydre funktion $e^u$ er det, vi skal integrere. Det er netop pointen: vi forenklede integralet fra noget kompliceret til noget vi kender!`,

        `<strong>Find resultatet!</strong>
Du skal integrere $e^u$. Hvad er stamfunktionen til $e^u$? (Den er sig selv!)

<strong>Spørg dig selv:</strong> "Hvad giver $\\int e^u\\,du$?" → $e^u + C$. Sæt derefter $u = x^3$ ind.

<strong>Hvorfor sætter vi $u$ tilbage?</strong> Vores svar skal være udtrykt i $x$, ikke i $u$ — $u$ var bare et midlertidigt hjælpemiddel.`
    ],

    // Problem 2: ∫ 2x/(x²+1) dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
Her har vi en brøk $\\frac{2x}{x^2+1}$. Den indre funktion er det udtryk, hvis afledte optræder et andet sted i integralet.

<strong>Spørg dig selv:</strong> "Hvis jeg differentierer nævneren $x^2+1$, hvad får jeg så?" → $2x$. Og kig: $2x$ er netop tælleren! Når den afledte af en del af integralet optræder som faktor, er den del et godt valg af $u$.

<strong>Hvorfor?</strong> Ved at vælge $u = x^2+1$ kan vi erstatte hele brøken med $\\frac{1}{u}\\,du$, som er meget nemmere at integrere.`,

        `<strong>Hvad er $du$?</strong>
$u = x^2 + 1 \\Rightarrow du = 2x\\,dx$. Differentier $u$ med potensreglen.

<strong>Spørg dig selv:</strong> "Passer $2x\\,dx$ med noget i integralet?" Ja — tælleren $2x$ ganget med $dx$ er præcis $du$.

<strong>Hvorfor?</strong> Fordi $du = 2x\\,dx$, kan vi erstatte tæller og $dx$ med $du$ og skrive integralet rent i $u$.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $x^2+1$ med $u$ og $2x\\,dx$ med $du$. Hvad har du tilbage?

<strong>Spørg dig selv:</strong> "Hvordan ser brøken ud nu?" → $\\frac{1}{u}$. Det er den ydre funktion.

<strong>Hvorfor?</strong> $\\int \\frac{1}{u}\\,du$ er et standardintegral, vi kender svaret på — det er netop det, substitution opnår.`,

        `<strong>Find resultatet!</strong>
$\\int \\frac{1}{u}\\,du$ er et af de vigtigste standardintegraler.

<strong>Spørg dig selv:</strong> "Hvad er stamfunktionen til $\\frac{1}{u}$?" → $\\ln|u| + C$. Sæt $u = x^2+1$ ind.

<strong>Hvorfor absolutværdi?</strong> $\\ln$ er kun defineret for positive tal. Absolutværdien sikrer, at udtrykket giver mening generelt.`
    ],

    // Problem 3: ∫ sin(3x) dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $\\sin(3x)$ sidder $3x$ <em>inde i</em> sinus-funktionen. Selv simple udtryk som $3x$ kan være den indre funktion!

<strong>Spørg dig selv:</strong> "Er argumentet til $\\sin$ bare $x$, eller er det noget mere?" Her er det $3x$, altså en sammensat funktion.

<strong>Hvorfor?</strong> Vi kan ikke integrere $\\sin(3x)$ direkte med standardformlen $\\int \\sin(x)\\,dx = -\\cos(x)$, fordi argumentet ikke er bare $x$. Substitution med $u = 3x$ fikser det! Integralet bliver $\\int \\sin(u)\\,du$, som vi kender.`,

        `<strong>Hvad er $du$?</strong>
$u = 3x \\Rightarrow du = 3\\,dx$, altså $dx = \\frac{du}{3}$.

<strong>Spørg dig selv:</strong> "Kan jeg udtrykke $dx$ i integralet via $du$?" Ja: $dx = \\frac{du}{3}$.

<strong>Hvorfor?</strong> Vi skal erstatte <em>alt</em> der har med $x$ at gøre — både funktionen og $dx$. Faktoren $\\frac{1}{3}$ rykker vi bare foran integralet.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $3x$ med $u$. Den funktion, der "omslutter" $u$, er den ydre.

<strong>Spørg dig selv:</strong> "Hvad er $\\sin(3x)$ med $u$ i stedet for $3x$?" → $\\sin(u)$.

<strong>Hvorfor?</strong> Vi får $\\frac{1}{3}\\int \\sin(u)\\,du$ — et simpelt standardintegral!`,

        `<strong>Find resultatet!</strong>
<strong>Spørg dig selv:</strong> "Hvad er $\\int \\sin(u)\\,du$?" → $-\\cos(u) + C$.

Husk: der er en faktor $\\frac{1}{3}$ foran, så svaret er $-\\frac{1}{3}\\cos(u) + C$. Sæt $u = 3x$ ind.

<strong>Hvorfor minus?</strong> Fordi den afledte af $\\cos$ er $-\\sin$ — så stamfunktionen til $\\sin$ er $-\\cos$.`
    ],

    // Problem 4: ∫ x√(x²+4) dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $\\sqrt{x^2+4}$ sidder $x^2+4$ <em>under rodtegnet</em> — det er den indre funktion. Rodtegnet $\\sqrt{\\square}$ er den ydre.

<strong>Spørg dig selv:</strong> "Hvad sidder under rodtegnet eller i en parentes? Og ligner noget af resten af integralet den afledte af det udtryk?" Her: afledte af $x^2+4$ er $2x$, og vi har $x$ som faktor — tæt nok (vi kan justere med en konstant).

<strong>Hvorfor?</strong> Med $u = x^2+4$ forsvinder rodtegnet: $\\sqrt{x^2+4} = \\sqrt{u} = u^{1/2}$, som vi nemt kan integrere med potensreglen.`,

        `<strong>Hvad er $du$?</strong>
$u = x^2+4 \\Rightarrow du = 2x\\,dx$.

<strong>Spørg dig selv:</strong> "Optræder $2x\\,dx$ i integralet?" Vi har $x\\,dx$, som er $\\frac{1}{2}du$. Det passer!

<strong>Hvorfor?</strong> Konstante faktorer (som $\\frac{1}{2}$) er nemme at håndtere — vi rykker dem foran integralet. Det vigtige er, at $x\\,dx$ overhovedet svarer til et multiplum af $du$.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $x^2+4$ med $u$ i $\\sqrt{x^2+4}$.

<strong>Spørg dig selv:</strong> "Hvad er $\\sqrt{x^2+4}$ udtrykt i $u$?" → $\\sqrt{u}$, altså $u^{1/2}$.

<strong>Hvorfor?</strong> Vi har nu $\\frac{1}{2}\\int u^{1/2}\\,du$ — et simpelt potensintegral!`,

        `<strong>Find resultatet!</strong>
Brug potensreglen baglæns: $\\int u^n\\,du = \\frac{u^{n+1}}{n+1} + C$.

<strong>Spørg dig selv:</strong> "Hvad er $\\int u^{1/2}\\,du$?" → $\\frac{u^{3/2}}{3/2} = \\frac{2}{3}u^{3/2}$. Gang med $\\frac{1}{2}$, og sæt $u$ ind.

<strong>Hvorfor potensreglen?</strong> $\\sqrt{u} = u^{1/2}$ er en potensfunktion, så vi bruger den samme regel som for $\\int x^n\\,dx$.`
    ],

    // Problem 5: ∫ cos(x) eˢⁱⁿ⁽ˣ⁾ dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $e^{\\sin(x)}$ sidder $\\sin(x)$ som eksponent — det er den indre funktion. $e^{\\square}$ er den ydre.

<strong>Spørg dig selv:</strong> "Hvad sidder i eksponenten, i en parentes, eller under et rodtegn? Og optræder den afledte af det udtryk andetsteds i integralet?" Her: afledte af $\\sin(x)$ er $\\cos(x)$, som er præcis den anden faktor!

<strong>Hvorfor?</strong> Det gør substitutionen perfekt: $u = \\sin(x)$, $du = \\cos(x)\\,dx$, og hele integralet bliver til $\\int e^u\\,du$.`,

        `<strong>Hvad er $du$?</strong>
$u = \\sin(x) \\Rightarrow du = \\cos(x)\\,dx$.

<strong>Spørg dig selv:</strong> "Er $\\cos(x)\\,dx$ til stede i integralet?" Ja — det er den anden faktor! Perfekt match.

<strong>Hvorfor?</strong> Når $du$ matcher præcist, behøver vi ingen justeringer — substitutionen er ren og enkel.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $\\sin(x)$ med $u$. Hvad er der "rundt om" $u$?

<strong>Spørg dig selv:</strong> "Hvad er $e^{\\sin(x)}$ med $u$ i stedet for $\\sin(x)$?" → $e^u$.

<strong>Hvorfor?</strong> Vi integrerer nu blot $\\int e^u\\,du$, som er et af de simpleste integraler at løse.`,

        `<strong>Find resultatet!</strong>
<strong>Spørg dig selv:</strong> "$\\int e^u\\,du = ?$" → $e^u + C$. Eksponentialfunktionen er sin egen stamfunktion!

Sæt $u = \\sin(x)$ ind, og du har svaret.

<strong>Hvorfor er $e^u$ speciel?</strong> Den er den eneste funktion, der er lig sin egen afledte — og dermed også sin egen stamfunktion.`
    ],

    // Problem 6: ∫ cos(ln x)/x dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $\\cos(\\ln x)$ sidder $\\ln x$ inde i cosinus — det er den indre funktion.

<strong>Spørg dig selv:</strong> "Hvad er argumentet til $\\cos$?" → $\\ln x$. "Er den afledte af $\\ln x$ til stede i integralet?" Den afledte er $\\frac{1}{x}$, og netop $\\frac{1}{x}$ optræder som faktor!

<strong>Hvorfor?</strong> Med $u = \\ln x$ og $du = \\frac{1}{x}\\,dx$ kan vi erstatte alt og få $\\int \\cos(u)\\,du$. Substitution handler om at genkende sådanne par: en funktion og dens afledte.`,

        `<strong>Hvad er $du$?</strong>
$u = \\ln x \\Rightarrow du = \\frac{1}{x}\\,dx$.

<strong>Spørg dig selv:</strong> "Optræder $\\frac{1}{x}\\,dx$ i integralet?" Ja: brøken $\\frac{\\cos(\\ln x)}{x}\\,dx$ indeholder netop $\\frac{1}{x}\\,dx$.

<strong>Hvorfor?</strong> Når vi kan identificere $du$ i integralet, ved vi, at substitutionen virker — vi kan skrive hele integralet i $u$.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $\\ln x$ med $u$.

<strong>Spørg dig selv:</strong> "Hvad er $\\cos(\\ln x)$ udtrykt i $u$?" → $\\cos(u)$.

<strong>Hvorfor?</strong> Det forenkler integralet til $\\int \\cos(u)\\,du$ — en simpel stamfunktion vi kender.`,

        `<strong>Find resultatet!</strong>
<strong>Spørg dig selv:</strong> "Hvad er $\\int \\cos(u)\\,du$?" → $\\sin(u) + C$.

Sæt $u = \\ln x$ ind: $\\sin(\\ln x) + C$.

<strong>Pro-tip:</strong> Tjek dit svar ved at differentiere! $\\frac{d}{dx}[\\sin(\\ln x)] = \\cos(\\ln x) \\cdot \\frac{1}{x}$ — præcis vores integrand.`
    ],

    // Problem 7: ∫ 4x³(x⁴-2)⁵ dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $(x^4-2)^5$ er der en potens af et udtryk: $\\square^5$ er den ydre funktion, og $x^4-2$ sidder indeni.

<strong>Spørg dig selv:</strong> "Hvad sidder i basen af potensen? Og ligner noget i resten af integralet den afledte af det?" Afledte af $x^4-2$ er $4x^3$, som er den anden faktor — perfekt!

<strong>Hvorfor?</strong> Substitution med $u = x^4-2$ giver $\\int u^5\\,du$, et simpelt potensintegral i stedet for et kompliceret udtryk.`,

        `<strong>Hvad er $du$?</strong>
$u = x^4-2 \\Rightarrow du = 4x^3\\,dx$.

<strong>Spørg dig selv:</strong> "Passer $4x^3\\,dx$ med integralet?" Ja: $4x^3$ er netop den faktor, der står foran $(x^4-2)^5$.

<strong>Hvorfor?</strong> Hele pointen: $4x^3\\,dx$ forsvinder, fordi det ER $du$.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $x^4-2$ med $u$ i $(x^4-2)^5$.

<strong>Spørg dig selv:</strong> "Hvad er $(x^4-2)^5$ med $u$?" → $u^5$.

<strong>Hvorfor?</strong> Nu er integralet bare $\\int u^5\\,du$ — potensreglen gør resten!`,

        `<strong>Find resultatet!</strong>
Brug potensreglen: $\\int u^n\\,du = \\frac{u^{n+1}}{n+1} + C$.

<strong>Spørg dig selv:</strong> "$\\int u^5\\,du = ?$" → $\\frac{u^6}{6} + C$. Sæt $u = x^4-2$ ind.

<strong>Hvorfor?</strong> Potensreglen virker for alle $n \\neq -1$: løft eksponenten med 1, og divider med den nye eksponent.`
    ],

    // Problem 8: ∫ sec²(x)tan(x) dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
Her er der ingen tydelig "funktion inde i en funktion" som $\\cos(x^2)$. I stedet leder vi efter: <em>hvilken af de to funktioner har den anden som sin afledte?</em>

<strong>Spørg dig selv:</strong> "Hvad er den afledte af $\\tan(x)$?" → $\\sec^2(x)$. Og $\\sec^2(x)$ er netop den anden faktor! Så $\\tan(x)$ er et naturligt valg af $u$.

<strong>Hvorfor?</strong> Substitution kræver, at $du$ (den afledte af $u$) optræder i integralet. Når to funktioner er hinandens "afledte-par", kan den ene altid være $u$.`,

        `<strong>Hvad er $du$?</strong>
$u = \\tan(x) \\Rightarrow du = \\sec^2(x)\\,dx$.

<strong>Spørg dig selv:</strong> "Er $\\sec^2(x)\\,dx$ til stede?" Ja — det er den anden faktor i integralet.

<strong>Hvorfor?</strong> Når vi skriver $du = \\sec^2(x)\\,dx$, kan vi erstatte den del af integralet og kun have $u$ og $du$ tilbage.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $\\tan(x)$ med $u$ og $\\sec^2(x)\\,dx$ med $du$. Hvad er der tilbage?

<strong>Spørg dig selv:</strong> "Hvad er integralet nu?" → Bare $\\int u\\,du$! Den ydre funktion er simpelthen $u$ selv.

<strong>Hvorfor?</strong> Ikke alle ydre funktioner er komplicerede — her er det den simplest mulige: identitetsfunktionen.`,

        `<strong>Find resultatet!</strong>
<strong>Spørg dig selv:</strong> "$\\int u\\,du = ?$" → $\\frac{u^2}{2} + C$ (potensreglen med $n=1$).

Sæt $u = \\tan(x)$ ind: $\\frac{\\tan^2(x)}{2} + C$.

<strong>Hvorfor?</strong> $\\int u^1\\,du = \\frac{u^{1+1}}{1+1} = \\frac{u^2}{2}$. Simpelt!`
    ],

    // Problem 9: ∫ e^√x / √x dx
    [
        `<strong>Hvad betyder "indre funktion"?</strong>
I $e^{\\sqrt{x}}$ sidder $\\sqrt{x}$ som eksponent — det er den indre funktion.

<strong>Spørg dig selv:</strong> "Hvad sidder i eksponenten? Og er den afledte af det udtryk relateret til andre dele af integralet?" Afledte af $\\sqrt{x}$ er $\\frac{1}{2\\sqrt{x}}$, og vi har $\\frac{1}{\\sqrt{x}}$ i integralet — tæt nok!

<strong>Hvorfor?</strong> Med $u = \\sqrt{x}$ forvandler vi integralet til $\\int e^u$-form, som vi nemt kan løse.`,

        `<strong>Hvad er $du$?</strong>
$u = \\sqrt{x} = x^{1/2} \\Rightarrow du = \\frac{1}{2\\sqrt{x}}\\,dx$.

<strong>Spørg dig selv:</strong> "Integralet har $\\frac{1}{\\sqrt{x}}\\,dx$ — kan det udtrykkes via $du$?" Ja: $\\frac{1}{\\sqrt{x}}\\,dx = 2\\,du$.

<strong>Hvorfor ganger vi med 2?</strong> Fordi $du$ indeholder en faktor $\\frac{1}{2}$, som vi skal kompensere for. Det er helt fint — konstante faktorer rykkes bare foran integralet.`,

        `<strong>Hvad er den ydre funktion?</strong>
Erstat $\\sqrt{x}$ med $u$ i $e^{\\sqrt{x}}$.

<strong>Spørg dig selv:</strong> "Hvad er $e^{\\sqrt{x}}$ med $u$?" → $e^u$.

<strong>Hvorfor?</strong> Integralet er nu $2\\int e^u\\,du$ — et standardintegral!`,

        `<strong>Find resultatet!</strong>
<strong>Spørg dig selv:</strong> "$\\int e^u\\,du = ?$" → $e^u + C$. Gang med faktoren $2$.

Sæt $u = \\sqrt{x}$ ind: $2e^{\\sqrt{x}} + C$.

<strong>Tjek dit svar:</strong> Differentier $2e^{\\sqrt{x}}$: $2 \\cdot e^{\\sqrt{x}} \\cdot \\frac{1}{2\\sqrt{x}} = \\frac{e^{\\sqrt{x}}}{\\sqrt{x}}$ ✓`
    ]
];

// Patch hints onto PROBLEMS
if (typeof PROBLEMS !== 'undefined') {
    PROBLEMS.forEach((problem, i) => {
        if (HINTS[i]) {
            problem.steps.forEach((step, j) => {
                if (HINTS[i][j]) {
                    step.hint = HINTS[i][j];
                }
            });
        }
    });
}
