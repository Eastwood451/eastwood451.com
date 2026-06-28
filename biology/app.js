// Biologisk Klassifikation - Data og Logik
// Omfatter 46 organismer, herunder planter, dyr, bakterier og arkæer.



const rankExplanations = {
  "Liv": {
    title: "Liv (Biota)",
    meaning: "Det absolut højeste niveau. Omfatter alt kendt liv på Jorden, som menes at dele en fælles universel stamfader (LUCA).",
    etymology: "Fra græsk 'biotē' (liv, levevis)."
  },
  "Domæne": {
    title: "Domæne (Domain)",
    meaning: "Det allerhøjeste niveau i den biologiske klassifikation. Alt liv på Jorden inddeles i tre domæner: Eukaryoter (organismer med en cellekerne), Bakterier (enkle encellede uden kerne) og Arkæer (ekstremofile encellede uden kerne).",
    etymology: "Fra latin 'dominium' (herredømme/ejendom). Introduceret i 1990 af Carl Woese."
  },
  "Rige": {
    title: "Rige (Kingdom)",
    meaning: "Niveauet under domæne. Inden for Eukaryoterne opdeles livet i rigerne: Dyreriget (Animalia), Planteriget (Plantae), Svamperiget (Fungi) samt den diverse gruppe af Protister (encellede eukaryoter).",
    etymology: "Fra oldnordisk 'ríki' (magtområde). Oprindeligt opdelt af Carl von Linné i dyr, planter og mineraler."
  },
  "Række": {
    title: "Række (Phylum)",
    meaning: "Inddeler riget efter dyrenes grundlæggende kropsplan og opbygning. For eksempel har alle leddyr et hårdt ydre skelet og leddelte ben, mens alle rygstrengsdyr har en indre støttestruktur (rygstreng).",
    etymology: "Fra græsk 'phylon' (stamme/race). Betegner en fundamental arkitektur for kroppens opbygning."
  },
  "Klasse": {
    title: "Klasse (Class)",
    meaning: "En underopdeling af rækken. Dyr i samme klasse deler væsentlige anatomiske og fysiologiske træk. F.eks. er Pattedyr (varmblodede, dier unger) en klasse under rygstrengsdyr, og Insekter er en klasse under leddyr.",
    etymology: "Fra latin 'classis' (en klasse, oprindeligt en afdeling af borgere)."
  },
  "Orden": {
    title: "Orden (Order)",
    meaning: "En finere inddeling af klassen, der samler familier med fælles livsstil eller morfologiske tilpasninger. For eksempel er Rovdyr (Carnivora) en orden af pattedyr med tænder tilpasset kødspisning.",
    etymology: "Fra latin 'ordo' (række, rækkefølge eller arrangement)."
  },
  "Underorden": {
    title: "Underorden (Suborder)",
    meaning: "En yderligere fininddeling af en orden for at gruppere familier, der er særligt nært beslægtede. For eksempel er slanger (Serpentes) en underorden under de skælklædte krybdyr.",
    etymology: "Fra latin 'sub' (under) og 'ordo' (orden)."
  },
  "Familie": {
    title: "Familie (Family)",
    meaning: "En gruppe af beslægtede slægter. Dyr i samme familie ligner ofte hinanden meget og deler adfærdsmæssige og fysiske træk. F.eks. kattefamilien (Felidae) eller myrefamilien (Formicidae).",
    etymology: "Fra latin 'familia' (husholdning, inklusiv tjenestefolk og slægtninge)."
  },
  "Slægt": {
    title: "Slægt (Genus)",
    meaning: "En samling af meget nærtbeslægtede arter, der deler en nylig fælles stamfader. Slægtsnavnet er det første ord i den videnskabelige (latinske) binominale nomenklatur og skrives altid med stort (f.eks. *Panthera*).",
    etymology: "Fra latin 'genus' (slægt, herkomst eller art)."
  },
  "Art": {
    title: "Art (Species)",
    meaning: "Den mest grundlæggende enhed i biologisk klassifikation. En art består af individer, der ligner hinanden i væsentlige træk og kan parre sig indbyrdes og producere frugtbart afkom.",
    etymology: "Fra latin 'species' (syn, udseende eller særlig form)."
  },
  "Underart": {
    title: "Underart (Subspecies)",
    meaning: "En gruppe inden for en art, som er geografisk isoleret og har udviklet visse distinkte fysiske træk, men som stadig kan få frugtbart afkom med andre underarter. Hunden er f.eks. en underart af ulven.",
    etymology: "Fra latin 'sub' (under) og 'species' (art)."
  },
  "Klad": {
    title: "Klad (Clade / Monofyletisk gruppe)",
    meaning: "Et begreb fra moderne evolutionsbiologi (kladistik). En klad er en gruppe af organismer, der består af en fælles stamfader og ALLE dennes efterkommere. I modsætning til traditionelle 'rækker' eller 'klasser' er klader defineret rent ud fra slægtskabstræet (fylogeni) frem for fysisk lighed. Moderne taksonomi forsøger at gøre alle klassiske grupper til sande klader.",
    etymology: "Fra græsk 'klados' (gren). Indikerer en enkelt gren på livets træ."
  },
  "Race": {
    title: "Race (Breed)",
    meaning: "En underinddeling af en art, typisk skabt gennem menneskelig selektiv avl for at fremme bestemte fysiske eller adfærdsmæssige træk. Dyr af forskellige racer inden for samme art kan stadig parre sig og få frugtbart afkom.",
    etymology: "Fra fransk 'race' (slægt, afstamning)."
  }
};

// Det fulde taksonomiske træ (Domain -> Kingdom -> Phylum -> Class -> Order -> Family -> Genus -> Species)
const taxonomyTree = {
  name: "Biota",
  rank: "Liv",
  latin: "Biota",
  danish: "Livet på Jorden",
  description: "Alt kendt liv på Jorden, der menes at nedstamme fra en fælles forfader (LUCA - Last Universal Common Ancestor).",
  children: [
    {
      name: "Bacteria",
      rank: "Domæne",
      latin: "Bacteria",
      danish: "Bakterier",
      description: "Encellede organismer uden cellekerne (prokaryoter). De er utroligt talrige og findes overalt på Jorden, fra dybhavet til menneskets tarmsystem.",
      children: [
        {
          name: "Pseudomonadota",
          rank: "Række",
          latin: "Pseudomonadota",
          danish: "Proteobakterier",
          description: "En stor række af gram-negative bakterier, der inkluderer mange velkendte patogener samt bakterier, der er vigtige for kvælstofkredsløbet.",
          children: [
            {
              name: "Gammaproteobacteria",
              rank: "Klasse",
              latin: "Gammaproteobacteria",
              danish: "Gammaproteobakterier",
              description: "En stor klasse af proteobakterier, der rummer mange vigtige medicinske og videnskabelige modelorganismer.",
              children: [
                {
                  name: "Enterobacterales",
                  rank: "Orden",
                  latin: "Enterobacterales",
                  danish: "Enterobakterier",
                  description: "En orden af stavformede bakterier, der ofte lever i tarmene på dyr.",
                  children: [
                    {
                      name: "Enterobacteriaceae",
                      rank: "Familie",
                      latin: "Enterobacteriaceae",
                      danish: "Tarmbakteriefamilien",
                      description: "En familie, der omfatter mange af de bakterier, der udgør den normale tarmflora hos mennesker, men også nogle patogener.",
                      children: [
                        {
                          name: "Escherichia",
                          rank: "Slægt",
                          latin: "Escherichia",
                          danish: "Escherichia",
                          description: "En slægt af gram-negative, stavformede bakterier opkaldt efter Theodor Escherich.",
                          children: [
                            {
                              name: "Escherichia coli",
                              rank: "Art",
                              latin: "Escherichia coli",
                              danish: "E. coli",
                              description: "En af de mest undersøgte modelorganismer i biologien. Den findes naturligt i tyktarmen hos varmblodede dyr, hvor den producerer vitamin K2, men visse stammer kan forårsage madforgiftning.",
                              animalId: "ecoli"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "Archaea",
      rank: "Domæne",
      latin: "Archaea",
      danish: "Arkæer",
      description: "Encellede mikroorganismer uden cellekerne. De minder om bakterier, men deres biokemi og genetik er lige så tæt beslægtet med eukaryoter. Mange er ekstremofile og lever i kogende syre eller ekstremt salte miljøer.",
      children: [
        {
          name: "Thermoproteota",
          rank: "Række",
          latin: "Thermoproteota",
          danish: "Crenarchaeota",
          description: "En række af arkæer, hvoraf mange er termofiler (varmeelskende) eller hypertermofiler.",
          children: [
            {
              name: "Thermoprotei",
              rank: "Klasse",
              latin: "Thermoprotei",
              danish: "Thermoprotei",
              description: "En klasse af termofile arkæer, der ofte findes i vulkanske kilder.",
              children: [
                {
                  name: "Sulfolobales",
                  rank: "Orden",
                  latin: "Sulfolobales",
                  danish: "Sulfolobales",
                  description: "En orden af arkæer, der lever under ekstremt sure og varme forhold (termoacidofiler).",
                  children: [
                    {
                      name: "Sulfolobaceae",
                      rank: "Familie",
                      latin: "Sulfolobaceae",
                      danish: "Sulfolobaceae",
                      description: "Familien af de arkæer, der kan trives i svovlholdige, kogende kilder.",
                      children: [
                        {
                          name: "Sulfolobus",
                          rank: "Slægt",
                          latin: "Sulfolobus",
                          danish: "Sulfolobus",
                          description: "En slægt af arkæer, hvis celler er irregulært formede (lobede) og oftest inficeret med unikke arkæa-vira.",
                          children: [
                            {
                              name: "Sulfolobus acidocaldarius",
                              rank: "Art",
                              latin: "Sulfolobus acidocaldarius",
                              danish: "Sulfolobus acidocaldarius",
                              description: "En arkæa, der lever optimalt ved 80°C og en pH på 2. Den er en vigtig modelorganisme for at forstå, hvordan liv kan eksistere under ekstreme betingelser, og hvordan DNA-reparation fungerer i arkæer.",
                              animalId: "sulfolobus"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "Eukaryota",
      rank: "Domæne",
      latin: "Eukaryota",
      danish: "Eukaryoter",
      description: "Organismer, hvis celler indeholder en membranbundet cellekerne, der beskytter arvematerialet (DNA), samt komplekse organeller som mitokondrier. Omfatter alle dyr, planter, svampe og alger.",
  children: [
    {
      name: "Animalia",
      rank: "Rige",
      latin: "Animalia",
      danish: "Dyreriget",
      description: "Flercellede organismer, der er heterotrofe (skal spise andre organismer for at få energi), indånder ilt, kan bevæge sig på mindst ét livsstadie, og hvis celler mangler cellevægge (i modsætning til planter og svampe).",
      children: [
        {
          name: "Chordata",
          rank: "Række",
          latin: "Chordata",
          danish: "Rygstrengsdyr (Chordater)",
          description: "Dyr, der i det mindste på et tidspunkt i fosterudviklingen har en rygstreng (chorda dorsalis) – en elastisk støttestav langs ryggen. Omfatter alle hvirveldyr samt nogle få primitive marine grupper.",
          children: [
            {
              name: "Mammalia",
              rank: "Klasse",
              latin: "Mammalia",
              danish: "Pattedyr",
              description: "Varmblodede hvirveldyr, der har hår eller pels, trækker vejret med lunger, har et firekamret hjerte, og hvor hunnerne har mælkekirtler til at give mælk (die) til deres unger.",
              children: [
                {
                  name: "Carnivora",
                  rank: "Orden",
                  latin: "Carnivora",
                  danish: "Rovdyr",
                  "description": "En orden af pattedyr tilpasset en kødædende diæt. De er kendetegnet ved kraftige klør, veludviklede hjørnetænder og specialiserede kindtænder (rovtænder) til at skære kød og knække knogler.",
                  children: [
                    {
                      name: "Felidae",
                      rank: "Familie",
                      latin: "Felidae",
                      danish: "Kattefamilien",
                      description: "Smidige, tåspidsgængere rovdyr med bløde trædepuder og kløer, der kan trækkes helt eller delvist tilbage (undtagen geparden). De har et fantastisk nattesyn og er yderst effektive solojægere.",
                      children: [
                        {
                          name: "Panthera",
                          rank: "Slægt",
                          latin: "Panthera",
                          danish: "Brølekatteslægten",
                          description: "En slægt i kattefamilien, der omfatter de store, brølende katte (løve, tiger, jaguar, leopard). Deres tungeben er delvist erstattet af et elastisk bånd, hvilket gør dem i stand til at brøle i stedet for at spinde uafbrudt.",
                          children: [
                            {
                              name: "Panthera leo",
                              rank: "Art",
                              latin: "Panthera leo",
                              danish: "Løve",
                              description: "Den næststørste nulevende kat. Modsat andre katte er løver yderst sociale og lever i flokke (prides) domineret af beslægtede hunner. Hanløven har en stor, mørk manke, der beskytter halsen under kampe og signalerer sundhed.",
                              animalId: "løve"
                            },
                            {
                              name: "Panthera tigris",
                              rank: "Art",
                              latin: "Panthera tigris",
                              danish: "Tiger",
                              description: "Den største nulevende katteart, let genkendelig på sin mørke stribede pels på orange baggrund. Den er en solitær jæger og apex-prædator, der primært jager hjorte og vildsvin.",
                              animalId: "tiger"
                            }
                          ]
                        },
                        {
                          name: "Acinonyx",
                          rank: "Slægt",
                          latin: "Acinonyx",
                          danish: "Gepardslægten",
                          description: "En monotypisk slægt i kattefamilien – dvs. den rummer kun én nulevende art. Geparden skiller sig markant ud fra alle andre katte ved at have kløer, der ikke kan trækkes tilbage (semiretrakt), og en krop ekstrem tilpasset hastighed frem for styrke.",
                          children: [
                            {
                              name: "Acinonyx jubatus",
                              rank: "Art",
                              latin: "Acinonyx jubatus",
                              danish: "Gepard",
                              description: "Det hurtigste landlevende dyr på Jorden – den kan accelerere fra 0 til 100 km/t på blot 3 sekunder og nå topfarter på op til 120 km/t. I modsætning til andre store katte kan geparden ikke brøle; i stedet spinder den som en huslat. Den kendes på sine sorte 'tåremærker', der løber fra øjnene ned langs mulen og menes at reducere blænding fra sollyset under jagten.",
                              animalId: "gepard"
                            }
                          ]
                        },
                        {
                          name: "Felis",
                          rank: "Slægt",
                          latin: "Felis",
                          danish: "Småkatte",
                          description: "En slægt af små til mellemstore katte. De fleste af dem jager små gnavere og fugle. Slægten omfatter vildkatten, som er forfaderen til den domesticerede huskat.",
                          children: [
                            {
                              name: "Felis catus",
                              rank: "Art",
                              latin: "Felis catus",
                              danish: "Huskat",
                              description: "Vores populære kæledyr. Huskatten nedstammer fra den afrikanske vildkat (Felis lybica) og har levet sammen med mennesker i næsten 10.000 år, primært for at holde bestanden af mus og rotter nede.",
                              animalId: "huskat"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Canidae",
                      rank: "Familie",
                      latin: "Canidae",
                      danish: "Hundefamilien",
                      description: "En familie af slanke, langsomme jægere med ikke-retraktærbare kløer, lange snuder og udpræget højt udviklede sociale strukturer. De kommunikerer via kropssprog, ansigtsudtryk, lyde og duftmærkering. Familien omfatter ulve, ræve, sjakaler og hunden.",
                      children: [
                        {
                          name: "Canis",
                          rank: "Slægt",
                          latin: "Canis",
                          danish: "Ulve og hunde",
                          description: "En slægt af mellemstore til store hundefamiliemedlemmer. Den indeholder bl.a. ulven (*Canis lupus*), kojoten (*Canis latrans*) og den domesticerede hund. Genetiske studier bekræfter, at hunden er en direkte underart af ulven.",
                          children: [
                            {
                              name: "Canis lupus",
                              rank: "Art",
                              latin: "Canis lupus",
                              danish: "Ulv",
                              description: "Det største nulevende medlem af hundefamilien. Ulve er meget sociale dyr, der lever i kobler ledet af et alfapar. De er apex-prædatorer, der primært jager store hovdyr. Hunden nedstammer direkte fra ulven.",
                              animalId: "ulv",
                              children: [
                                {
                                  name: "Canis lupus familiaris",
                                  rank: "Underart",
                                  latin: "Canis lupus familiaris",
                                  danish: "Hund",
                                  description: "Det første domesticerede dyr - hunden nedstammer fra ulven (*Canis lupus*) og blev tamt for mindst 15.000-40.000 år siden. Gennem selektiv avl har menneskene skabt hundredevis af racer med enormt varierende størrelse, udseende og egenskaber - fra chihuahua til stor st. bernhard. Hunden er tilpasset til at aflæse menneskelige signaler og kommunikere med os på måder, som selv vores nærmeste slægtninge, chimpansen, ikke formår.",
                                  animalId: "hund",
                                  children: [
                                    {
                                      name: "Golden Retriever",
                                      rank: "Race",
                                      latin: "Canis lupus familiaris",
                                      danish: "Golden Retriever",
                                      description: "En populær hunderace oprindeligt fremavlet i Skotland i 1800-tallet til at apportere nedlagte vandfugle uskadt (deraf 'retriever' og deres bløde mund). De er kendt for deres tætte, vandafvisende gyldne pels, deres venlige, intelligente og ivrige natur, som gør dem til fremragende familiehunde, blindehunde og redningshunde.",
                                      animalId: "golden_retriever"
                                    },
                                    {
                                      name: "Schæferhund",
                                      rank: "Race",
                                      latin: "Canis lupus familiaris",
                                      danish: "Schæferhund (German Shepherd)",
                                      description: "En relativt ny hunderace etableret i Tyskland i 1899, oprindeligt skabt til at hyrde får (deraf navnet schæfer = hyrde). Det er en stor, stærk og yderst intelligent hund, der i dag er en af de mest foretrukne racer til politi-, militær- og vagtarbejde verden over på grund af dens loyalitet og lærenemhed.",
                                      animalId: "schaefer"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          name: "Vulpes",
                          rank: "Slægt",
                          latin: "Vulpes",
                          danish: "Egentlige ræve",
                          description: "En slægt i hundefamilien karakteriseret ved deres spidse snuder, store opretstående ører og lange buskede haler. De er ofte mere solitære jægere end ulve.",
                          children: [
                            {
                              name: "Vulpes vulpes",
                              rank: "Art",
                              latin: "Vulpes vulpes",
                              danish: "Rød ræv",
                              description: "Det mest udbredte rovdyr i verden. Den røde ræv er ekstremt tilpasningsdygtig og lever i næsten alle miljøer, fra skove til storbyer. Den jager primært små gnavere, men er også altædende og kan leve af frugt og ådsler.",
                              animalId: "raev"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Ursidae",
                      rank: "Familie",
                      latin: "Ursidae",
                      danish: "Bjørne",
                      description: "En familie af store rovdyr kendetegnet ved en tung bygning, tyk pels, korte ben og en meget kort hale. Selvom de tilhører rovdyrene, er de fleste bjørne altædende og lever af både planter, bær, insekter og kød.",
                      children: [
                        {
                          name: "Ursus",
                          rank: "Slægt",
                          latin: "Ursus",
                          danish: "Egentlige bjørne",
                          description: "Den mest udbredte slægt i bjørnefamilien, der blandt andet omfatter brun bjørn, isbjørn og sortbjørn.",
                          children: [
                            {
                              name: "Ursus arctos",
                              rank: "Art",
                              latin: "Ursus arctos",
                              danish: "Brun bjørn",
                              description: "En af de største og mest udbredte bjørnearter. Dens kost er utroligt varieret. Den kan fange store laks i floderne, men bruger også meget tid på at grave efter rødder og samle bær før vinterhiet.",
                              animalId: "bjoern"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Hyaenidae",
                      rank: "Familie",
                      latin: "Hyaenidae",
                      danish: "Hyæner",
                      description: "En familie af kødædende pattedyr. Selvom de fysisk og adfærdsmæssigt ligner hunde (Canidae), er de faktisk tættere beslægtet med katte (Felidae) og desmerdyr (Viverridae). De kendes på deres kraftige kæber og skrånende ryg.",
                      children: [
                        {
                          name: "Crocuta",
                          rank: "Slægt",
                          latin: "Crocuta",
                          danish: "Plettede hyæner",
                          description: "En slægt af store hyæner. Nulevende findes kun én art.",
                          children: [
                            {
                              name: "Crocuta crocuta",
                              rank: "Art",
                              latin: "Crocuta crocuta",
                              danish: "Plettet hyæne",
                              description: "Den største hyæneart. Den er kendt for sin 'leende' vokalisering og for at leve i store, komplekse, matriarkalske klaner. Selvom de ofte omtales som ådselædere, er de yderst dygtige og effektive jægere, der nedlægger det meste af deres føde selv.",
                              animalId: "hyaene"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Artiodactyla",
                  rank: "Orden",
                  latin: "Artiodactyla",
                  danish: "Parrettåede hovdyr (inkl. hvaler)",
                  description: "Traditionelt en orden af klovbærende pattedyr. Moderne genetisk forskning har vist, at hvaler udviklede sig direkte fra denne gruppe (nærmest beslægtet med flodheste). Derfor kaldes ordenen i dag ofte Cetartiodactyla.",
                  children: [
                    {
                      name: "Balaenopteridae",
                      rank: "Familie",
                      latin: "Balaenopteridae",
                      danish: "Fasthvaler (Rørhvaler)",
                      description: "Den største familie af bardehvaler. De er kendetegnet ved dybe længdefurer under mundbunden og struben, som tillader mundhulen at udvide sig enormt, når de tager store slurke af vand fyldt med krill eller småfisk.",
                      children: [
                        {
                          name: "Balaenoptera",
                          rank: "Slægt",
                          latin: "Balaenoptera",
                          danish: "Rørhvalslægten",
                          description: "Den dominerende slægt af rørhvaler. De har en strømlinet krop, en lille rygfinne og lange, smalle luffer. Slægten omfatter bl.a. finhvalen, vågehvalen og blåhvalen.",
                          children: [
                            {
                              name: "Balaenoptera musculus",
                              rank: "Art",
                              latin: "Balaenoptera musculus",
                              danish: "Blåhval",
                              description: "Det største dyr, der nogensinde har levet på Jorden – større end selv de største dinosaurer. Den kan blive op til 30 meter lang og veje over 180 tons. Den lever næsten udelukkende af bittesmå lyskrebs (krill), som den filtrerer gennem sine sorte barder.",
                              animalId: "hval"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Delphinidae",
                      rank: "Familie",
                      latin: "Delphinidae",
                      danish: "Delfiner",
                      description: "Den største familie af tandhvaler. De er yderst intelligente, sociale havpattedyr, der bruger ekkolokalisering til at navigere og jage fisk og blæksprutter.",
                      children: [
                        {
                          name: "Tursiops",
                          rank: "Slægt",
                          latin: "Tursiops",
                          danish: "Øresvin",
                          description: "Den mest kendte og almindelige slægt af delfiner. De har en robust krop, et kort 'næb' og et venligt udseende, der har gjort dem utroligt populære i fangenskab og populærkultur.",
                          children: [
                            {
                              name: "Tursiops truncatus",
                              rank: "Art",
                              latin: "Tursiops truncatus",
                              danish: "Øresvin (Delfin)",
                              description: "Den bedst kendte delfinart. De lever i flokke (pods) med komplekse sociale strukturer og kommunikerer med et avanceret sprog af klik og fløjt. Deres hjerner er usædvanligt store og komplekse.",
                              animalId: "delfin"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Camelidae",
                      rank: "Familie",
                      latin: "Camelidae",
                      danish: "Kamelfamilien",
                      description: "En familie af parrettåede hovdyr med lange ben, polstrede trædepuder og stor evne til at klare tørre miljøer. Omfatter kameler, dromedarer, lamaer og alpakaer.",
                      children: [
                        {
                          name: "Camelus",
                          rank: "Slægt",
                          latin: "Camelus",
                          danish: "Kameler",
                          description: "En slægt af store ørkentilpassede klovdyr med pukler, der lagrer fedt som energireserve. De kan udholde lange perioder med varme og vandmangel.",
                          children: [
                            {
                              name: "Camelus dromedarius",
                              rank: "Art",
                              latin: "Camelus dromedarius",
                              danish: "Dromedar (enpuklet kamel)",
                              description: "Den enpuklede kamel, som er udbredt som husdyr i tørre områder i Nordafrika, Mellemøsten og dele af Asien. Puklen lagrer fedt, og kroppen er tilpasset til at spare på vand gennem effektiv temperaturregulering og koncentreret urin.",
                              animalId: "kamel"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Giraffidae",
                      rank: "Familie",
                      latin: "Giraffidae",
                      danish: "Giraffer og okapier",
                      description: "En lille familie af klovdyr, der i dag kun rummer to nulevende slægter: giraffen og okapien. De kendes især på deres lange halse (selvom okapiens er kort) og ben, samt små, hudklædte horn (ossiconer).",
                      children: [
                        {
                          name: "Giraffa",
                          rank: "Slægt",
                          latin: "Giraffa",
                          danish: "Giraffer",
                          description: "En slægt af ekstremt høje afrikanske klovdyr. Deres enorme højde er en evolutionær tilpasning til at spise blade højt oppe i trækronerne, især fra akacietræer, hvor andre planteædere ikke kan nå.",
                          children: [
                            {
                              name: "Giraffa camelopardalis",
                              rank: "Art",
                              latin: "Giraffa camelopardalis",
                              danish: "Giraf",
                              description: "Verdens højeste nulevende landdyr. Hanner kan blive over 5 meter høje. Deres hjerte vejer op til 11 kg og skal pumpe ekstremt hårdt for at få blodet hele vejen op ad halsen til hjernen.",
                              animalId: "giraf"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Bovidae",
                      rank: "Familie",
                      latin: "Bovidae",
                      danish: "Skedehornede dyr",
                      description: "En stor familie af parrettåede hovdyr med permanente horn beklædt af hornskeder. Familien omfatter blandt andet kvæg, får, geder, antiloper og bøfler.",
                      children: [
                        {
                          name: "Bos",
                          rank: "Slægt",
                          latin: "Bos",
                          danish: "Okser og kvæg",
                          description: "En slægt af store drøvtyggende hovdyr, der omfatter tamkvæg og flere vilde oksearter. De har en kompleks mave, som gør dem i stand til at fordøje græs og andet plantemateriale effektivt.",
                          children: [
                            {
                              name: "Bos taurus",
                              rank: "Art",
                              latin: "Bos taurus",
                              danish: "Tamkvæg",
                              description: "Den domesticerede ko, som mennesker har holdt i tusinder af år for mælk, kød, trækkraft og læder. Malkekøer er avlet til høj mælkeydelse og er vigtige husdyr i dansk landbrug.",
                              children: [
                                {
                                  name: "Dansk Holstein",
                                  rank: "Race",
                                  latin: "Bos taurus",
                                  danish: "Almindelig dansk malkeko",
                                  description: "En sortbroget malkeko af Holstein-typen, som er meget almindelig i Danmark. Racen er især avlet til mælkeproduktion og kendes på sin store krop, rolige adfærd og tydelige sorte og hvide aftegninger.",
                                  animalId: "ko"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Perissodactyla",
                  rank: "Orden",
                  latin: "Perissodactyla",
                  danish: "Uparrettåede hovdyr",
                  description: "En orden af pattedyr, der bærer deres vægt primært på den midterste (tredje) tå på hver fod. Omfatter heste, næsehorn og tapirer.",
                  children: [
                    {
                      name: "Equidae",
                      rank: "Familie",
                      latin: "Equidae",
                      danish: "Hestefamilien",
                      description: "En familie af hurtigløbende, græsædende pattedyr, som kun har én tå (en hov) på hver fod.",
                      children: [
                        {
                          name: "Equus",
                          rank: "Slægt",
                          latin: "Equus",
                          danish: "Heste, æsler og zebraer",
                          description: "Den eneste nulevende slægt i hestefamilien. De lever i flokke på åbne sletter og savanner.",
                          children: [
                            {
                              name: "Equus quagga",
                              rank: "Art",
                              latin: "Equus quagga",
                              danish: "Steppezebra",
                              description: "Den mest almindelige og udbredte zebraart. Dens markante sort-hvide striber menes at forvirre rovdyr, regulere kropstemperaturen eller afskrække tsetsefluer.",
                              animalId: "zebra"
                            },
                            {
                              name: "Equus ferus",
                              rank: "Art",
                              latin: "Equus ferus",
                              danish: "Vildhest",
                              description: "Arten, som tamhesten stammer fra. Den oprindelige vilde hest blev tæmmet for ca. 6.000 år siden på de eurasiske stepper.",
                              children: [
                                {
                                  name: "Equus ferus caballus",
                                  rank: "Underart",
                                  latin: "Equus ferus caballus",
                                  danish: "Tamhest",
                                  description: "Hesten har spillet en enorm rolle i menneskets historie som transportmiddel, arbejdsdyr og følgesvend i krig og fred.",
                                  children: [
                                    {
                                      name: "Arabisk fuldblod",
                                      rank: "Race",
                                      latin: "Equus ferus caballus",
                                      danish: "Arabisk fuldblod (Araberhest)",
                                      description: "En af verdens ældste og reneste hesteracer, der stammer fra Den Arabiske Halvø. Kendt for sin udholdenhed, sit karakteristiske let indadbuende profil ('dish-face') og sin højt løftede hale.",
                                      animalId: "arabisk_hest"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Rhinocerotidae",
                      rank: "Familie",
                      latin: "Rhinocerotidae",
                      danish: "Næsehorn",
                      description: "En familie af store, planteædende uparrettåede hovdyr, som er kendetegnet ved deres store størrelse, tykke hud og et eller to horn på snuden.",
                      children: [
                        {
                          name: "Ceratotherium",
                          rank: "Slægt",
                          latin: "Ceratotherium",
                          danish: "Hvide næsehorn",
                          description: "En slægt af næsehorn, der i dag kun indeholder én nulevende art. Navnet betyder 'horn-vilddyr'.",
                          children: [
                            {
                              name: "Ceratotherium simum",
                              rank: "Art",
                              latin: "Ceratotherium simum",
                              danish: "Stumpnæsehorn (Hvidt Næsehorn)",
                              description: "Den største art af næsehorn. Kæmpe græsæder. 'Hvidt' er sandsynligvis en fejloversættelse af det afrikaanse ord 'wyd', som betyder bred, hvilket refererer til dyrets brede mund, der er tilpasset at græsse på savannen.",
                              animalId: "naesehorn"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Rodentia",
                  rank: "Orden",
                  latin: "Rodentia",
                  danish: "Gnavere",
                  description: "Den største orden af pattedyr, som omfatter over 40% af alle pattedyrarter. De kendes på deres konstant voksende, mejselformede fortænder i over- og undermunden, som de skal slide ned ved at gnave. Omfatter bl.a. mus, rotter, egern og bævere."
                },
                {
                  name: "Primates",
                  rank: "Orden",
                  latin: "Primates",
                  danish: "Primater",
                  description: "En orden af pattedyr, der omfatter halvaber, aber og mennesker. De er kendetegnet ved veludviklet syn, fremadrettede øjne, gribehænder og -fødder med flade negle frem for kløer samt en stor og kompleks hjerne.",
                  children: [
                    {
                      name: "Hominidae",
                      rank: "Familie",
                      latin: "Hominidae",
                      danish: "Store menneskeaber",
                      description: "En familie af primater, som inkluderer orangutanger, gorillaer, chimpanser og mennesker. De har ingen hale, er generelt store og er udstyret med avanceret kognition.",
                      children: [
                        {
                          name: "Homo",
                          rank: "Slægt",
                          latin: "Homo",
                          danish: "Mennesker",
                          description: "Den slægt, der inkluderer moderne mennesker samt vores nære, uddøde slægtninge (som neandertalere og Homo erectus). Slægten er kendetegnet ved at gå oprejst på to ben (bipedalisme) og fremstille avancerede redskaber.",
                          children: [
                            {
                              name: "Homo sapiens",
                              rank: "Art",
                              latin: "Homo sapiens",
                              danish: "Menneske",
                              description: "Vores egen art, det 'tænkende menneske'. Den eneste overlevende art i Homo-slægten. Gennem ekstremt avanceret sprog, kultur og teknologi har mennesker spredt sig og tilpasset sig næsten alle miljøer på Jorden.",
                              animalId: "menneske"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Chiroptera",
                  rank: "Orden",
                  latin: "Chiroptera",
                  danish: "Flagermus",
                  description: "Den eneste gruppe af pattedyr, der er i stand til aktiv flyvning. Deres forlemmer er omdannet til vinger bestående af en tynd hudfold spændt ud mellem fingrene. De bruger ekkolokalisering til at navigere i mørke."
                },
                {
                  name: "Proboscidea",
                  rank: "Orden",
                  latin: "Proboscidea",
                  danish: "Snabeldyr",
                  description: "En orden af store, landlevende pattedyr karakteriseret ved at have en snabel (en forlænget næse og overlæbe) og ofte stødtænder. I dag overlever kun elefanterne.",
                  children: [
                    {
                      name: "Elephantidae",
                      rank: "Familie",
                      latin: "Elephantidae",
                      danish: "Elefanter",
                      description: "Den eneste overlevende familie af snabeldyr. De er verdens største nulevende landdyr og er kendt for deres høje intelligens, komplekse sociale strukturer og gode hukommelse.",
                      children: [
                        {
                          name: "Loxodonta",
                          rank: "Slægt",
                          latin: "Loxodonta",
                          danish: "Afrikanske elefanter",
                          description: "Slægten af elefanter, der lever i Afrika. De kendes især på deres meget store ører, der har form som det afrikanske kontinent, og som bruges til at regulere kropsvarmen.",
                          children: [
                            {
                              name: "Loxodonta africana",
                              rank: "Art",
                              latin: "Loxodonta africana",
                              danish: "Afrikansk savanneelefant",
                              description: "Den største af elefantarterne og det største nulevende landdyr. Både hanner og hunner har store stødtænder, som de bruger til at grave efter vand, rykke bark af træer og som våben.",
                              animalId: "elefant"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Monotremata",
                  rank: "Orden",
                  latin: "Monotremata",
                  danish: "Kloakdyr",
                  description: "Den mest primitive orden af nulevende pattedyr. Kloakdyrene er de eneste pattedyr, der lægger æg i stedet for at føde levende unger. De er opkaldt efter den kloakåbning (cloaca), som de bruger til at udskille urin, afføring og æg. I dag kendes kun fem nulevende arter: næbdyret og fire arter af pindsvinmyresluger (echidnaer).",
                  children: [
                    {
                      name: "Ornithorhynchidae",
                      rank: "Familie",
                      latin: "Ornithorhynchidae",
                      danish: "Næbdyrfamilien",
                      description: "En monotypisk familie – den indeholder kun én nulevende art: næbdyret. Det er en reliktfamilie, der repræsenterer en yderst gammel evolutionær linje, der adskilte sig fra andre pattedyr for over 166 millioner år siden.",
                      children: [
                        {
                          name: "Ornithorhynchus",
                          rank: "Slægt",
                          latin: "Ornithorhynchus",
                          danish: "Næbdyrslægten",
                          description: "En monotypisk slægt med kun én art. Slægtsnavnet betyder bogstaveligt 'fugle-næb' på græsk, en reference til det karakteristiske andesnabel-lignende næb.",
                          children: [
                            {
                              name: "Ornithorhynchus anatinus",
                              rank: "Art",
                              latin: "Ornithorhynchus anatinus",
                              danish: "Næbdyr",
                              description: "Et af naturens mest usædvanlige dyr, hjemmehørende i det østlige Australien og Tasmania. Det er ét af kun fem æglæggende pattedyr (kloakdyr). Det har et gummiagtig andesnabel-lignende næb med elektroreceptorer, der kan registrere de elektriske felter fra byttedyrs muskler under vand. Hannerne er desuden udstyret med giftige sporer på bagbenene – en af de meget få giftige pattedyrarter. Da europæerne første gang bragte et udstoppet eksemplar til England, troede forskerne, det var en snyde-konstruktion.",
                              animalId: "naebdyr"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "Aves",
              rank: "Klasse",
              latin: "Aves",
              danish: "Fugle",
              description: "Varmblodede, tobenede hvirveldyr, der lægger hårdskallede æg. Deres forlemmer er omdannet til vinger, deres krop er dækket af fjer, de har hule, lette knogler til flyvning, og de mangler tænder (har hornnæb i stedet).",
              children: [
                {
                  name: "Accipitriformes",
                  rank: "Orden",
                  latin: "Accipitriformes",
                  danish: "Rovfugle (Daglige)",
                  description: "En orden af rovfugle, der jager om dagen. De har et ekstremt skarpt syn (ofte 4-8 gange bedre end menneskets), et kraftigt, krumt næb til at partere bytte, og stærke gribefødder med lange, skarpe klør (tarser).",
                  children: [
                    {
                      name: "Accipitridae",
                      rank: "Familie",
                      latin: "Accipitridae",
                      danish: "Høgefamilien",
                      description: "En meget stor familie af dagaktive rovfugle, der omfatter høge, våger, glenter og de fleste ørne. De har brede vinger, der er ideelle to svæve på varme opvinde (termik).",
                      children: [
                        {
                          name: "Aquila",
                          rank: "Slægt",
                          latin: "Aquila",
                          danish: "De ægte ørne",
                          description: "En slægt af meget store og stærke rovfugle. De adskiller sig fra mange andre rovfugle ved at have fjer helt ned til tæerne (tarsus er fuldt fjerklædt). De er kendt for deres majestætiske flugt og enorme styrke.",
                          children: [
                            {
                              name: "Aquila chrysaetos",
                              rank: "Art",
                              latin: "Aquila chrysaetos",
                              danish: "Kongeørn",
                              description: "En af de største rovfugle på den nordlige halvkugle. Den er mørkebrun med gyldenbrune fjer i nakken (deraf navnet 'Golden Eagle'). Den kan dykke med over 240 km/t, når den jager harer, murmeldyr og endda unge rådyr.",
                              animalId: "ørn"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Passeriformes",
                  rank: "Orden",
                  latin: "Passeriformes",
                  danish: "Spurvefugle",
                  description: "Den absolut største orden af fugle (over halvdelen af alle nulevende arter). De kendes på deres fodopbygning med tre fremadrettede og én bagudrettet tå, som gør dem i stand til at holde fast om grene, samt deres højtudviklede syngeorgan (syrinx)."
                },
                {
                  name: "Strigiformes",
                  rank: "Orden",
                  latin: "Strigiformes",
                  danish: "Ugler",
                  description: "Nataktive rovfugle med store, fremadrettede øjne omgivet af en karakteristisk fjerkrans (slør), der opsamler lyd. De har et fantastisk syn og hørelse samt specialiserede, bløde fjer, der gør deres flugt fuldstændig lydløs."
                },
                {
                  name: "Anseriformes",
                  rank: "Orden",
                  latin: "Anseriformes",
                  danish: "Andefugle",
                  description: "Vandfugle med svømmehud mellem de tre forreste tæer og et fladt, bredt næb forsynet med lameller til at filtrere føde fra vandet. Omfatter svaner, gæs og ænder."
            }
          ]
        },
            {
              name: "Chondrichthyes",
              rank: "Klasse",
              latin: "Chondrichthyes",
              danish: "Bruskfisk",
              description: "Hvirveldyr, hvis skelet udelukkende består af brusk i stedet for knogler. De mangler svømmeblære, har hud dækket af små hudtænder (placoidskæl) og har typisk 5-7 gællespalter. Omfatter hajer, rokker og havmus.",
              children: [
                {
                  name: "Lamniformes",
                  rank: "Orden",
                  latin: "Lamniformes",
                  danish: "Sildehajer",
                  description: "En orden af store hajer med to rygfinner, en gatfinne og fem gællespalter. De mangler blinkhinde på øjnene og har en mund, der strækker sig bag om øjnene.",
                  children: [
                    {
                      name: "Lamnidae",
                      rank: "Familie",
                      latin: "Lamnidae",
                      danish: "Sildehajfamilien",
                      description: "En familie af store, strømlinede og hurtigt svømmende hajer. De har en delvis varmblodet fysiologi (regional endotermi), hvilket gør dem i stand til at opretholde en kropstemperatur højere end det omgivende havvand.",
                      children: [
                        {
                          name: "Carcharodon",
                          rank: "Slægt",
                          latin: "Carcharodon",
                          danish: "Menneskehajer",
                          description: "En slægt af store rovhajer under sildehajfamilien. Den eneste nulevende repræsentant er hvidhajen, der er berygtet som topsprædator i havet.",
                          children: [
                            {
                              name: "Carcharodon carcharias",
                              rank: "Art",
                              latin: "Carcharodon carcharias",
                              danish: "Hvidhaj",
                              description: "Verdens største nulevende rovfisk, der kan blive over 6 meter lang og veje op til 2 tons. Den er en topsprædator i tempererede og subtropiske have. Den jager primært havpattedyr og er kendt for sine kraftfulde kæber og savtakkede tænder.",
                              animalId: "hvidhaj"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Carcharhiniformes",
                  rank: "Orden",
                  latin: "Carcharhiniformes",
                  danish: "Blinkhindehajer (Rovhajer)",
                  description: "Den største orden af hajer. De har to rygfinner uden pigge, en gatfinne, fem gællespalter og en blinkhinde (et tredje øjenlåg), som beskytter øjet under angreb. Omfatter bl.a. hammerhaj, tigerhaj og rødhaj."
                },
                {
                  name: "Rajiformes",
                  rank: "Orden",
                  latin: "Rajiformes",
                  danish: "Egentlige rokker",
                  description: "Bruskfisk med en ekstremt fladtrykt krop, hvor de store brystfinner er vokset sammen med hovedet og danner en skive. Gællespalterne sidder på undersiden. Omfatter bl.a. sømrokken."
                },
                {
                  name: "Squaliformes",
                  rank: "Orden",
                  latin: "Squaliformes",
                  danish: "Pighajer",
                  description: "En orden af hajer kendetegnet ved at have to rygfinner, der ofte er forsynet med en skarp pig forrest, og de mangler helt en gatfinne. Omfatter bl.a. den almindelige pighaj og grønlandshajen."
                }
              ]
            },
            {
              name: "Actinopterygii",
              rank: "Klasse",
              latin: "Actinopterygii",
              danish: "Strålefindede fisk",
              description: "Den mest artsrige klasse af hvirveldyr (over 95% af alle fisk). Deres finner understøttes af tynde, fleksible benstråler frem for kødfulde lapper. De fleste har et forbenet skelet, gællelåg og en svømmeblære.",
              children: [
                {
                  name: "Gadiformes",
                  rank: "Orden",
                  latin: "Gadiformes",
                  danish: "Torskefisk",
                  description: "En orden af primært bundlevende saltvandsfisk med bløde finnestråler. De fleste arter har en enkelt skægtråd under hagen og har ofte to eller tre rygfinner samt en eller to gatfinner.",
                  children: [
                    {
                      name: "Gadidae",
                      rank: "Familie",
                      latin: "Gadidae",
                      danish: "Torskefamilien",
                      description: "En familie af havfisk, der omfatter mange af verdens vigtigste spisefisk. De findes primært på den nordlige halvkugle i tempererede og arktiske have og lever ofte i stimer nær bunden.",
                      children: [
                        {
                          name: "Gadus",
                          rank: "Slægt",
                          latin: "Gadus",
                          danish: "Torskeslægten",
                          description: "En slægt af bundfisk i torskefamilien. De er kendetegnet ved at have tre adskilte rygfinner, to gatfinner og en veludviklet skægtråd på hagen.",
                          children: [
                            {
                              name: "Gadus morhua",
                              rank: "Art",
                              latin: "Gadus morhua",
                              danish: "Torsk",
                              description: "En yderst vigtig spisefisk i de danske og nordatlantiske farvande. Den er en bundlevende rovfisk, der spiser krebsdyr og mindre fisk. Den kendes på den hvide sidelinje, marmorerede farver og den tydelige skægtråd under hagen.",
                              animalId: "torsk"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Perciformes",
                  rank: "Orden",
                  latin: "Perciformes",
                  danish: "Pigfinnefisk",
                  description: "Den største orden af hvirveldyr overhovedet. De er kendetegnet ved at have stive, udelte pigge forrest i ryg- og gatfinnen. Omfatter bl.a. aborre, makrel, tun og koralrevsfisk."
                },
                {
                  name: "Clupeiformes",
                  rank: "Orden",
                  latin: "Clupeiformes",
                  danish: "Sildefisk",
                  description: "Primært stimefisk med en strømlinet krop dækket af blanke, sølvfarvede skæl. De mangler sidelinje og fedtfinne og har en svømmeblære forbundet med tarmen. Omfatter sild, brisling og sardin."
                },
                {
                  name: "Cypriniformes",
                  rank: "Orden",
                  latin: "Cypriniformes",
                  danish: "Karpefisk",
                  description: "En meget stor orden af primært ferskvandsfisk. De er kendetegnet ved at mangle tænder i kæberne (de har i stedet svælgtænder) og har et veludviklet høreapparat (Webersk apparat) forbundet til svømmeblæren. Omfatter karpe, guldfisk og skalle."
                }
              ]
            },
            {
              name: "Reptilia",
              rank: "Klasse",
              latin: "Reptilia",
              danish: "Krybdyr",
              description: "Klasse af vekselvarme hvirveldyr, der trækker vejret med lunger, og hvis hud er dækket af hornskæl eller plader, som beskytter mod udtørring. De fleste lægger æg med en læderagtig skal på land. Omfatter øgler, slanger, skildpadder og krokodiller.",
              children: [
                {
                  name: "Squamata",
                  rank: "Orden",
                  latin: "Squamata",
                  danish: "Skælklædte krybdyr",
                  description: "Den største orden af krybdyr, som omfatter alle slanger og øgler. De er kendetegnet ved at have hud dækket af hornskæl, et bevægeligt kranium (især hos slanger) og at de regelmæssigt skifter ham (hud).",
                  children: [
                    {
                      name: "Iguanidae",
                      rank: "Familie",
                      latin: "Iguanidae",
                      danish: "Leguanfamilien",
                      description: "En familie af primært planteædende øgler, der lever i varme områder i Amerika. De har ofte en kam af rygtakker langs ryggen og nakken samt en veludviklet strubesæk.",
                      children: [
                        {
                          name: "Iguana",
                          rank: "Slægt",
                          latin: "Iguana",
                          danish: "Leguanslægten",
                          description: "En slægt af store, trækravlende øgler under leguanfamilien. De er dygtige svømmere og tilbringer meget tid højt oppe i trætoppene nær vandløb.",
                          children: [
                            {
                              name: "Iguana iguana",
                              rank: "Art",
                              latin: "Iguana iguana",
                              danish: "Grøn leguan",
                              description: "En stor, primært trælevende og planteædende øgle fra Mellem- og Sydamerika. Den kan blive op til 1,5-2 meter lang (inklusive halen). Den bruger sin lange piskesmælds-hale til forsvar og er en fremragende svømmer.",
                              animalId: "leguan"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Serpentes",
                      rank: "Underorden",
                      latin: "Serpentes",
                      danish: "Slanger",
                      description: "En underorden af kødædende krybdyr uden lemmer. De kendes på deres langstrakte kroppe, mangel på øjenlåg og eksterne øreåbninger, samt en enorm fleksibilitet i kæberne, der lader dem sluge meget store byttedyr.",
                      children: [
                        {
                          name: "Viperidae",
                          rank: "Familie",
                          latin: "Viperidae",
                          danish: "Hugormefamilien",
                          description: "En familie af giftige slanger kendetegnet ved at have lange, hule gifttænder forrest i overmunden, som kan foldes op mod ganen, når munden lukkes. De har typisk et trekantet hoved og lodrette pupiller.",
                          children: [
                            {
                              name: "Vipera",
                              rank: "Slægt",
                              latin: "Vipera",
                              danish: "Egentlige hugorme",
                              description: "En slægt af giftige hugorme udbredt i Europa, Asien og Nordafrika. De er tilpasset køligere klimaer end de fleste andre slægter og føder levende unger (ovovivipari).",
                              children: [
                                {
                                  name: "Vipera berus",
                                  rank: "Art",
                                  latin: "Vipera berus",
                                  danish: "Hugorm",
                                  description: "Danmarks eneste giftige slange. Den kendes på sit karakteristiske mørke siksak-mønster langs ryggen (selvom helt sorte individer forekommer). Den lever af små gnavere og firben, som den lammer med sin gift.",
                                  animalId: "slange"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          name: "Boidae",
                          rank: "Familie",
                          latin: "Boidae",
                          danish: "Kvælerslanger",
                          description: "En familie af primært store, ugiftige slanger, der dræber deres bytte ved at kvæle det (konstriktion). De findes i Amerika, Afrika, Europa, Asien og på nogle øer i Stillehavet.",
                          children: [
                            {
                              name: "Boa",
                              rank: "Slægt",
                              latin: "Boa",
                              danish: "Egentlige boaer",
                              description: "En slægt af store kvælerslanger, som er udbredt i Mellem- og Sydamerika. De er primært nataktive og jager fugle og små til mellemstore pattedyr.",
                              children: [
                                {
                                  name: "Boa constrictor",
                                  rank: "Art",
                                  latin: "Boa constrictor",
                                  danish: "Kongeboa (Boaslange)",
                                  description: "En stor og kraftig slange, der kan blive over 3 meter lang. Den er kendt for sin evne til at klatre i træer og for sit smukke, mønstrede skind, der giver fremragende camouflage i regnskoven.",
                                  animalId: "boaslange"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          name: "Elapidae",
                          rank: "Familie",
                          latin: "Elapidae",
                          danish: "Giftsnoge",
                          description: "En stor familie af ekstremt giftige slanger. I modsætning til hugorme, hvis gifttænder kan foldes op, har giftsnoge korte, fastsiddende gifttænder forrest i munden. Omfatter kobraer, mambaer, taipaner og havslanger.",
                          children: [
                            {
                              name: "Naja",
                              rank: "Slægt",
                              latin: "Naja",
                              danish: "Kobraer",
                              description: "Den mest kendte slægt af kobraer, udbredt i Afrika og Asien. De er kendt for deres evne til at rejse den forreste tredjedel af kroppen og spile nakkeskindet ud til en bred 'hætte' (hood), når de føler sig truede.",
                              children: [
                                {
                                  name: "Naja naja",
                                  rank: "Art",
                                  latin: "Naja naja",
                                  danish: "Indisk Kobra (Brilleslange)",
                                  description: "En meget berømt kobraslange kendt for den brille-lignende aftegning bag på hætten. Den er ansvarlig for mange slangebid i Indien. Selvom den er meget giftig, indtager den også en særlig æret plads i hinduistisk mytologi.",
                                  animalId: "kobra"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Anguidae",
                      rank: "Familie",
                      latin: "Anguidae",
                      danish: "Stålorme",
                      description: "En familie af øgler, der på den nordlige halvkugle er kendt for deres mangel på lemmer, hvilket får dem til at ligne slanger. Modsat slanger har de dog øjenlåg, der kan lukkes, og synlige øreåbninger.",
                      children: [
                        {
                          name: "Anguis",
                          rank: "Slægt",
                          latin: "Anguis",
                          danish: "Ægte stålorme",
                          description: "En slægt af benløse øgler. De er ufarlige og lever primært af regnorme, snegle og insekter. Hvis de angribes, kan de smide halen (autotomi) som en afledningsmanøvre.",
                          children: [
                            {
                              name: "Anguis fragilis",
                              rank: "Art",
                              latin: "Anguis fragilis",
                              danish: "Stålorm",
                              description: "En helt almindelig, slangelignende øgle i Danmark. Den har en smuk, metallisk glinsende krop i brune eller kobberagtige nuancer. Mange forveksler den med en slange, men den er helt harmløs og er faktisk et øgle/firben.",
                              animalId: "staalorm"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Varanidae",
                      rank: "Familie",
                      latin: "Varanidae",
                      danish: "Varanfamilien",
                      description: "En familie af store, aktive og kødædende øgler med en lang, tvedelt tunge, kraftige lemmer og kløer samt en lang hale, der ikke kan afkastes (autotomi).",
                      children: [
                        {
                          name: "Varanus",
                          rank: "Slægt",
                          latin: "Varanus",
                          danish: "Varanslægten",
                          description: "Den eneste nulevende slægt i varanfamilien. De er intelligente og aktive jægere med en høj stofskiftehastighed sammenlignet med andre krybdyr.",
                          children: [
                            {
                              name: "Varanus komodoensis",
                              rank: "Art",
                              latin: "Varanus komodoensis",
                              danish: "Komodovaran",
                              description: "Verdens største nulevende øgle, der kan blive op til 3 meter lang og veje over 70 kg. Den lever på en række indonesiske øer. Den jager store byttedyr som hjorte og vildsvin ved hjælp af et giftigt bid og bakteriefyldt spyt.",
                              animalId: "komodovaran"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Dinosauria",
                  rank: "Orden",
                  latin: "Dinosauria",
                  danish: "Dinosaurer",
                  description: "En stor gruppe arkosauriske krybdyr, der dominerede landjorden i Mesozoikum. Gruppen omfatter både uddøde former som Triceratops, Tyrannosaurus og Argentinosaurus samt de nulevende fugle som efterkommere af theropode dinosaurer.",
                  children: [
                    {
                      name: "Ornithischia",
                      rank: "Underorden",
                      latin: "Ornithischia",
                      danish: "Fuglehoftede dinosaurer",
                      description: "En stor gruppe planteædende dinosaurer med en bækkenbygning, der overfladisk minder om fugles. Gruppen omfatter bl.a. pansrede dinosaurer, andenæbsdinosaurer og hornede dinosaurer.",
                      children: [
                        {
                          name: "Ceratopsidae",
                          rank: "Familie",
                          latin: "Ceratopsidae",
                          danish: "Hornede dinosaurer",
                          description: "En familie af store planteædende dinosaurer med kraftige kranier, nakkeskjold og ofte horn. De levede især i Nordamerika i sen Kridttid.",
                          children: [
                            {
                              name: "Triceratops",
                              rank: "Slægt",
                              latin: "Triceratops",
                              danish: "Triceratops",
                              description: "En slægt af store hornede dinosaurer med tre markante horn og et bredt nakkeskjold. Triceratops var en tung planteæder fra sen Kridttid.",
                              children: [
                                {
                                  name: "Triceratops horridus",
                                  rank: "Art",
                                  latin: "Triceratops horridus",
                                  danish: "Triceratops",
                                  description: "En ikonisk hornet dinosaur fra sen Kridttid i Nordamerika. Den havde to lange horn over øjnene, et kortere næsehorn og et kraftigt næb til at bide sej vegetation.",
                                  animalId: "triceratops"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Saurischia",
                      rank: "Underorden",
                      latin: "Saurischia",
                      danish: "Øglehoftede dinosaurer",
                      description: "En hovedgruppe af dinosaurer, der omfatter theropoderne og de langhalsede sauropodomorfer. Fugle udviklede sig senere fra theropode dinosaurer i denne gren.",
                      children: [
                        {
                          name: "Theropoda",
                          rank: "Infraorden",
                          latin: "Theropoda",
                          danish: "Theropoder",
                          description: "Primært tobenede dinosaurer, ofte rovdyr, med gribende forlemmer og lette kranier. Gruppen omfatter både Tyrannosaurus og fuglenes forfædre.",
                          children: [
                            {
                              name: "Tyrannosauridae",
                              rank: "Familie",
                              latin: "Tyrannosauridae",
                              danish: "Tyrannosaurider",
                              description: "En familie af store theropode rovdinosaurer fra sen Kridttid, kendt for kraftige kranier, enorme bidkræfter og relativt små forlemmer.",
                              children: [
                                {
                                  name: "Tyrannosaurus",
                                  rank: "Slægt",
                                  latin: "Tyrannosaurus",
                                  danish: "Tyrannosaurus",
                                  description: "En slægt af meget store rovdinosaurer med massivt kranium, kraftige kæber og tobenet gang. Den mest kendte art er Tyrannosaurus rex.",
                                  children: [
                                    {
                                      name: "Tyrannosaurus rex",
                                      rank: "Art",
                                      latin: "Tyrannosaurus rex",
                                      danish: "Tyrannosaurus rex",
                                      description: "Et af de største landlevende rovdyr i Jordens historie. T. rex levede i Nordamerika i sen Kridttid og havde et ekstremt kraftigt bid, stærke bagben og små, men muskuløse forlemmer.",
                                      animalId: "tyrannosaurus_rex"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          name: "Sauropodomorpha",
                          rank: "Infraorden",
                          latin: "Sauropodomorpha",
                          danish: "Sauropodomorfer",
                          description: "Planteædende dinosaurer, hvor de mest kendte former havde meget lange halse, lange haler og enorme kroppe. Gruppen rummer de største landdyr, der har levet.",
                          children: [
                            {
                              name: "Titanosauria",
                              rank: "Familie",
                              latin: "Titanosauria",
                              danish: "Titanosaurer",
                              description: "En mangfoldig gruppe af sauropoder fra Kridttiden, ofte meget store og udbredt på de sydlige kontinenter. Argentinosaurus hører til blandt de største kendte titanosaurer.",
                              children: [
                                {
                                  name: "Argentinosaurus",
                                  rank: "Slægt",
                                  latin: "Argentinosaurus",
                                  danish: "Argentinosaurus",
                                  description: "En slægt af enorme langhalsede titanosaurer fra Argentina. Fossilerne peger på et dyr blandt de tungeste landdyr, der nogensinde har eksisteret.",
                                  children: [
                                    {
                                      name: "Argentinosaurus huinculensis",
                                      rank: "Art",
                                      latin: "Argentinosaurus huinculensis",
                                      danish: "Argentinosaurus",
                                      description: "En gigantisk planteædende sauropod fra sen Kridttid i Sydamerika. Den havde lang hals, massiv krop og levede sandsynligvis af højt og lavt plantemateriale i åbne landskaber.",
                                      animalId: "argentinosaurus"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Crocodilia",
                  rank: "Orden",
                  latin: "Crocodilia",
                  danish: "Krokodiller",
                  description: "Store, semi-akvatiske rovdyr dækket af hårde hornplader. De har et firekamret hjerte, kraftige kæber og er de nærmeste nulevende slægtninge til fuglene (sammen udgør de Archosauria)."
                },
                {
                  name: "Testudines",
                  rank: "Orden",
                  latin: "Testudines",
                  danish: "Skildpadder",
                  description: "Krybdyr kendetegnet ved et hårdt rygskjold (carapax) og bugskjold (plastron), som er vokset sammen med ribbenene og rygsøjlen. De mangler tænder og har et skarpt hornnæb i stedet."
                },
                {
                  name: "Sphenodontia",
                  rank: "Orden",
                  latin: "Sphenodontia",
                  danish: "Broøgler",
                  description: "En urgammel orden af krybdyr, der i dag kun er repræsenteret af tuataraen i New Zealand. De ligner øgler, men har bevaret mange primitive træk fra dinosaurernes tid, bl.a. et veludviklet issemellemøje (pandeøje)."
                }
              ]
            }
          ]
        },
        {
          name: "Arthropoda",
          rank: "Række",
          latin: "Arthropoda",
          danish: "Leddyr",
          description: "Den mest artsrige og succesfulde række af dyr på Jorden (omfatter over 80% af alle beskrevne dyrearter). De er kendetegnet ved et hårdt ydre skelet (exoskelet) af kitin, en tydeligt segmenteret krop og leddelte ben, som de kan bøje.",
          children: [
            {
              name: "Insecta",
              rank: "Klasse",
              latin: "Insecta",
              danish: "Insekter",
              description: "Leddyr, hvis krop er opdelt i tre tydelige afsnit: hoved (caput), bryst (thorax) og bagkrop (abdomen). De har altid præcis seks gangben (tre par) fæstnet til brystet, ét par antenner, og de fleste voksne arter har vinger.",
              children: [
                {
                  name: "Hymenoptera",
                  rank: "Orden",
                  latin: "Hymenoptera",
                  danish: "Årevingede",
                  description: "En af de største insektordener, der omfatter myrer, hvepse, bier og gedehamse. De har to par gennemsigtige, hindeagtige vinger med et fint netværk af årer. Hos mange arter er hunnens læggebrod omdannet til en giftbrod til forsvar.",
                  children: [
                    {
                      name: "Formicidae",
                      rank: "Familie",
                      latin: "Formicidae",
                      danish: "Myrer",
                      description: "Sociale insekter, der næsten alle lever i organiserede kolonier (tuer eller boer). De har en karakteristisk 'myrehvepsetalje' med et eller to små skæl mellem bryst og bagkrop. De kommunikerer komplekst via kemiske duftstoffer (feromoner).",
                      children: [
                        {
                          name: "Formica",
                          rank: "Slægt",
                          latin: "Formica",
                          danish: "Skovmyrer",
                          description: "En slægt af myrer, der er kendt for at bygge store, kuplede tuer af grannåle, kviste og jord. De er aktive rovdyr, der forsvarer sig aggressivt ved at bide og derefter sprøjte myresyre ind i såret fra bagkroppen.",
                          children: [
                            {
                              name: "Formica rufa",
                              rank: "Art",
                              latin: "Formica rufa",
                              danish: "Rød skovmyre",
                              description: "En almindelig dansk skovmyre. En enkelt tue kan rumme over 100.000 arbejdere og flere dronninger. De spiller en kritisk rolle i skoven ved at holde bestanden af skadelige larver nede og sprede frø fra skovbunden.",
                              animalId: "myre"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Apidae",
                      rank: "Familie",
                      latin: "Apidae",
                      danish: "Langtungebier (Humlebier og honningbier)",
                      description: "En familie af bier, der omfatter many af vores vigtigste bestøvere. De er tæt behårede (ofte med forgrenede hår, der opsamler pollen), og mange arter har 'pollenkurve' på bagbenene til at transportere pollen hjem til boet.",
                      children: [
                        {
                          name: "Bombus",
                          rank: "Slægt",
                          latin: "Bombus",
                          danish: "Humlebier",
                          description: "Store, tæt behårede og ofte farverige bier. De er eminent tilpasset koldt klima, da de kan vibrere deres vingemuskler for at varme sig op (hvilket gør dem aktive tidligt på foråret). De danner mindre, etårige samfund.",
                          children: [
                            {
                              name: "Bombus terrestris",
                              rank: "Art",
                              latin: "Bombus terrestris",
                              danish: "Mørk jordhumle",
                              description: "En af de største og mest udbredte humlebier. Dronningen anlægger sit bo under jorden i forladte musehuller. Den er kendt på sin sorte krop med to gule bånd og en hvidlig bagkropsspids. En uundværlig bestøver af både vilde planter og afgrøder.",
                              animalId: "humlebi"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Coleoptera",
                  rank: "Orden",
                  latin: "Coleoptera",
                  danish: "Biller",
                  description: "Den mest artsrige orden i dyreriget (ca. 400.000 arter). Deres forvinger er omdannet til hårde dækvinger (elytra), som beskytter bagkroppen og flyvevingerne under dem."
                },
                {
                  name: "Lepidoptera",
                  rank: "Orden",
                  latin: "Lepidoptera",
                  danish: "Sommerfugle",
                  description: "Insekter med store vinger dækket af mikroskopiske, farverige skæl. De voksne har en sugesnabbel til nektar, og de gennemgår fuldstændig forvandling fra larve til puppe og voksen."
                },
                {
                  name: "Diptera",
                  rank: "Orden",
                  latin: "Diptera",
                  danish: "Tovinger",
                  description: "Insekter, der kun har ét par flyvinger, da det bageste par er omdannet til små svingkøller (halterer) til balancestyring. Omfatter fluer og myg."
                },
                {
                  name: "Odonata",
                  rank: "Orden",
                  latin: "Odonata",
                  danish: "Guldsmede og vandnymfer",
                  description: "Rovrovende insekter med to par store, gennemsigtige vinger og et meget bevægeligt hoved med enorme sammensatte øjne. Deres nymfer lever i vand.",
                  children: [
                    {
                      name: "Libellulidae",
                      rank: "Familie",
                      latin: "Libellulidae",
                      danish: "Libeller",
                      description: "Den største familie af guldsmede, kendt for deres brede bagkrop og ofte farverige mønstre. De er dygtige flyvere og overvåger ofte deres territorium fra faste udsigtsposter.",
                      children: [
                        {
                          name: "Neurothemis",
                          rank: "Slægt",
                          latin: "Neurothemis",
                          danish: "Rødvingede guldsmede",
                          description: "En slægt af guldsmede fundet i Asien, kendt for hannernes markante rødlige farve, der ofte dækker en stor del af vingerne.",
                          children: [
                            {
                              name: "Neurothemis fluctuans",
                              rank: "Art",
                              latin: "Neurothemis fluctuans",
                              danish: "Rød græshøg",
                              description: "En meget almindelig lille guldsmed i Sydøstasien. Hannerne har karakteristiske dybrøde vinger med gennemsigtige spidser, mens hunnerne er mere brunlige.",
                              animalId: "guldsmed"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "Arachnida",
              rank: "Klasse",
              latin: "Arachnida",
              danish: "Spindlere",
              description: "Leddyr, hvis krop er opdelt i to hoveddele: en sammensmeltet forkrop (cephalothorax) og en bagkrop (abdomen). De har altid otte gangben (fire par), ingen antenner og ingen vinger. Omfatter edderkopper, skorpioner, mejere og mider.",
              children: [
                {
                  "name": "Araneae",
                  "rank": "Orden",
                  "latin": "Araneae",
                  "danish": "Edderkopper",
                  "description": "Spindlere, der har giftkroge (chelicerer) forrest på hovedet til at lamme byttedyr, samt spindevorter på bagkroppen. Spindevorterne udskiller flydende silke, som stivner i luften og bruges til spind, ægkokoner og klatretråde.",
                  children: [
                    {
                      name: "Araneidae",
                      rank: "Familie",
                      latin: "Araneidae",
                      danish: "Hjulspindere",
                      description: "Edderkopper, der bygger de klassiske, geometriske, hjulformede spind, vi ofte ser i haver og skove. De sidder normalt i midten af spindet med hovedet nedad og venter på, at vibrationer afslører et fanget byttedyr.",
                      children: [
                        {
                          name: "Araneus",
                          rank: "Slægt",
                          latin: "Araneus",
                          danish: "Egentlige hjulspindere",
                          description: "En stor slægt af hjulspindere, der findes over hele verden. De har en tyk, ofte mønstret bagkrop. Hunnens spind kan være op til 40 cm i diameter og genopbygges næsten dagligt.",
                          children: [
                            {
                              name: "Araneus diadematus",
                              rank: "Art",
                              latin: "Araneus diadematus",
                              danish: "Korsedderkop",
                              description: "Meget almindelig i Danmark. Den kendes let på det hvide, korsformede mønster på ryggen, som skyldes ophobning af guanin (et affaldsstof) under huden. Den lammer sit bytte med gift og pakker det ind i silke, før den suger det tomt.",
                              animalId: "edderkop"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Theridiidae",
                      rank: "Familie",
                      latin: "Theridiidae",
                      danish: "Kuglespindere",
                      description: "En stor familie af edderkopper, der bygger uregelmæssige, tredimensionelle fangstnet (ikke de klassiske hjulspind). Mange arter er kendetegnet ved en kugleformet bagkrop og potente neurotoksiske gifte. Familien omfatter bl.a. de berygtede sortenkespindere.",
                      children: [
                        {
                          name: "Latrodectus",
                          rank: "Slægt",
                          latin: "Latrodectus",
                          danish: "Sorte enker",
                          description: "En slægt af giftige edderkopper med udpræget kønsforskellighed (seksuel dimorfisme): hunnerne er store og meget giftige, mens hannerne er langt mindre og næsten harmløse. Hunnen er berygtet for at spise hannen efter parringen – deraf det populære navn 'sort enke'.",
                          children: [
                            {
                              name: "Latrodectus mactans",
                              rank: "Art",
                              latin: "Latrodectus mactans",
                              danish: "Sort Enke",
                              description: "En af verdens mest giftige edderkopper. Hunnen er blanksort med et karakteristisk rødt timeglas-mønster på undersiden af bagkroppen. Dens gift (latrotoksin) er et kraftigt neurotoksin, der er ca. 15 gange stærkere end klapperslangegift – men den injicerede mængde er meget lille. Hunnen æder sjældent hannen i naturen; myten stammer fra laboratorieobservationer.",
                              animalId: "sort_enke"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Scorpiones",
                  rank: "Orden",
                  latin: "Scorpiones",
                  danish: "Skorpioner",
                  description: "Spindlere med en tydeligt leddelt bagkrop, der ender i en giftbrod, som kan krummes op over ryggen. Deres pedipalper er omdannet til kraftige gribesakse til at fange og fastholde byttedyr.",
                  children: [
                    {
                      name: "Scorpionidae",
                      rank: "Familie",
                      latin: "Scorpionidae",
                      danish: "Kejserskorpioner",
                      description: "En familie af store, robuste skorpioner, der ofte holdes i fangenskab. De har brede, kraftige gribesakse og en relativt svag gift.",
                      children: [
                        {
                          name: "Pandinus",
                          rank: "Slægt",
                          latin: "Pandinus",
                          danish: "Kejserskorpioner",
                          description: "En slægt af meget store skorpioner, der lever i de afrikanske regnskove og savanner.",
                          children: [
                            {
                              name: "Pandinus imperator",
                              rank: "Art",
                              latin: "Pandinus imperator",
                              danish: "Kejserskorpion",
                              description: "En af verdens største skorpioner, der kan blive op til 20 cm lang. Den er blanksort og fluorescerer under ultraviolet lys. Trods sit frygtindgydende udseende er dens gift ikke dødelig for mennesker; den bruger primært sine enorme kløer til at fange bytte.",
                              animalId: "skorpion"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Opiliones",
                  rank: "Orden",
                  latin: "Opiliones",
                  danish: "Mejere",
                  description: "Spindlere, der kendes på deres ekstremt lange, tynde ben og en krop, hvor forkrop og bagkrop er bredt sammenvokset uden en synlig 'talje'. De mangler giftkirtler og spindekirtler.",
                  children: [
                    {
                      name: "Phalangiidae",
                      rank: "Familie",
                      latin: "Phalangiidae",
                      danish: "Egentlige mejere",
                      description: "En familie af mejere kendetegnet ved de ekstremt lange, tynde ben og parrede øjne placeret på en central øjenhøj på forkroppen.",
                      children: [
                        {
                          name: "Phalangium",
                          rank: "Slægt",
                          latin: "Phalangium",
                          danish: "Egentlige mejere",
                          description: "En slægt af mejere, der er meget almindelige i Europa, ofte fundet på mure, træstammer og i vegetation.",
                          children: [
                            {
                              name: "Phalangium opilio",
                              rank: "Art",
                              latin: "Phalangium opilio",
                              danish: "Almindelig mejer",
                              description: "Meget almindelig mejer i Danmark. Den har en krop på kun 3,5-9 mm, men benene kan være op til 5 cm lange. Den spiser både små insekter, svampe og rådnende organisk materiale og adskiller sig fra edderkopper ved at mangle en synlig talje samt spind og gift.",
                              animalId: "mejer"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Pseudoscorpiones",
                  rank: "Orden",
                  latin: "Pseudoscorpiones",
                  danish: "Pseudoskorpioner",
                  description: "Små spindlere (2-8 mm), der ligner rigtige skorpioner med deres gribesakse, men mangler den lange hale og giftbrod. De lever af mikroskopiske skadedyr som støvlus."
                },
                {
                  name: "Acari",
                  rank: "Orden",
                  latin: "Acari",
                  danish: "Mider og flåter",
                  description: "Den mest artsrige orden af spindlere, som omfatter bittesmå organismer. Deres forkrop og bagkrop er fuldstændig sammensmeltet. Mange arter er parasitter (fx skovflåten) eller nedbrydere.",
                  children: [
                    {
                      name: "Ixodidae",
                      rank: "Familie",
                      latin: "Ixodidae",
                      danish: "Egentlige flåter",
                      description: "En familie af parasitære flåter, der har et hårdt rygskjold (scutum) og suger blod fra hvirveldyr, herunder pattedyr, fugle og krybdyr.",
                      children: [
                        {
                          name: "Ixodes",
                          rank: "Slægt",
                          latin: "Ixodes",
                          danish: "Egentlige flåter",
                          description: "En slægt af flåter, som er kendt for at overføre alvorlige sygdomme som borreliose og TBE til mennesker og dyr.",
                          children: [
                            {
                              name: "Ixodes ricinus",
                              rank: "Art",
                              latin: "Ixodes ricinus",
                              danish: "Skovflåt",
                              description: "En almindelig dansk flåt, der lever i skove og højt græs. Den er en blodsugende parasit, som gennemgår fire livsstadier: æg, larve, nymfe og voksen. Den kan overføre bakterien *Borrelia burgdorferi*, der forårsager sygdommen Lyme borreliose.",
                              animalId: "skovflat"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Solifugae",
                  rank: "Orden",
                  latin: "Solifugae",
                  danish: "Giftsugere (Solifuger)",
                  description: "Hurtige og aggressive spindlere, der lever i tørre ørkenområder. De har enorme, lodret arbejdende kindbakker (chelicerer) og er berygtede for deres glubende appetit, men de er ikke giftige."
                }
              ]
            },
            {
              name: "Malacostraca",
              rank: "Klasse",
              latin: "Malacostraca",
              danish: "Storkrebs",
              description: "Den største klasse af krebsdyr (Crustacea). De har en fast kropsopbygning bestående af et hoved med to par antenner, et brystparti med 8 segmenter og en bagkrop med 6 segmenter samt en halevifte (telson). Mange har et skjold (carapax), der dækker forkroppen.",
              children: [
                {
                  "name": "Decapoda",
                  "rank": "Orden",
                  "latin": "Decapoda",
                  "danish": "Tierkoblede dekrebs",
                  "description": "Krebsdyr med ti gangben (fem par), hvoraf det forreste par ofte er omdannet til store klosakse til forsvar og fødefangst. Omfatter rejer, hummere, krabber og krebs.",
                  children: [
                    {
                      name: "Crangonidae",
                      rank: "Familie",
                      latin: "Crangonidae",
                      danish: "Hesterejefamilien",
                      description: "En familie af rejer, der har en fladtrykt krop fra ryg til bug, hvilket gør dem perfekte til at ligge skjult på havbunden. Deres forreste par gangben har små, falske klosakse.",
                      children: [
                        {
                          name: "Crangon",
                          rank: "Slægt",
                          latin: "Crangon",
                          danish: "Hesterejer",
                          description: "En slægt af rejer, der lever i salt- og brakvand på sandbunde. De er mesterlige til at skifte farve efter underlaget og kan grave sig lynhurtigt ned i sandet ved hjælp af bagkroppen.",
                          children: [
                            {
                              name: "Crangon crangon",
                              rank: "Art",
                              latin: "Crangon crangon",
                              danish: "Hestereje",
                              description: "Også kendt som sandreje eller fjordreje i Danmark. Den er gråbrun og gennemsigtig. Den jager om natten efter smådyr. Når den koges, skifter den farve til rødlig. Den er en vigtig delikatesse og en hjørnesten i Vadehavets økosystem.",
                              animalId: "reje"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Pandalidae",
                      rank: "Familie",
                      latin: "Pandalidae",
                      danish: "Nordhavsrejefamilien",
                      description: "En familie af langstihlede, slanke rejer tilpasset koldt, dybt vand. De er kendetegnet ved lange antenner og en karakteristisk rødlig-orange farve, der skyldes carotenoider fra deres kost. De fleste arter er protandriske hermafroditter (starter livet som hanner og skifter til hunner).",
                      children: [
                        {
                          name: "Pandalus",
                          rank: "Slægt",
                          latin: "Pandalus",
                          danish: "Nordhavsrejer",
                          description: "En slægt af kommercielt vigtige koldtvandsrejer. De lever i dybe, kolde havområder og er protandriske hermafroditter: de starter alle livet som hanner (1-5 år) og skifter derefter biologisk køn til hunner for resten af livet.",
                          children: [
                            {
                              name: "Pandalus borealis",
                              rank: "Art",
                              latin: "Pandalus borealis",
                              danish: "Nordhavsreje",
                              description: "Den kommercielt vigtigste reje i det nordlige Atlanterhav og Stillehav. Den lever på 150–500 meters dybde i arktiske og subarktiske farvande, bl.a. ved Grønland, Island og Norge. Den er pink-orange og er grundlaget for enorme fiskerier. Dens unikke biologi som kønskifter (protandrisk hermafrodit) gør den til et fascinerende studieobjekt.",
                              animalId: "nordhavsreje"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Isopoda",
                  rank: "Orden",
                  latin: "Isopoda",
                  danish: "Bænkebidere",
                  description: "Krebsdyr med syv par ensartede gangben. De er mest kendt for deres landlevende former, bænkebiderne, som kræver fugtige miljøer."
                },
                {
                  name: "Amphipoda",
                  rank: "Orden",
                  latin: "Amphipoda",
                  danish: "Tanglopper",
                  description: "Små, sideværts sammentrykte krebsdyr uden rygskjold. De fleste lever i havet eller ferskvand, hvor de er vigtige nedbrydere og byttedyr."
                },
                {
                  name: "Euphausiacea",
                  rank: "Orden",
                  latin: "Euphausiacea",
                  danish: "Lyskrebs (Krill)",
                  description: "Små, rejelignende krebsdyr, der har lysorganer (fotoforer) og lever i enorme stimer i de åbne oceaner, hvor de er hovedføden for bardehvaler."
                }
              ]
            },
            {
              name: "Chilopoda",
              rank: "Klasse",
              latin: "Chilopoda",
              danish: "Skolopendre",
              description: "Hurtige, fladtrykte mangebenede rovdyr. De har ét par ben pr. kropssegment, og deres forreste benpar er omdannet til kraftige giftkroge, som de bruger til at lamme insekter og andre smådyr.",
              children: [
                {
                  name: "Scolopendromorpha",
                  rank: "Orden",
                  latin: "Scolopendromorpha",
                  danish: "Egentlige skolopendre",
                  description: "Store, kraftige skolopendre med 21 eller 23 par ben. De er berygtede for deres smertefulde og giftige bid og omfatter bl.a. kæmpeskolopenderen."
                },
                {
                  name: "Scutigeromorpha",
                  rank: "Orden",
                  latin: "Scutigeromorpha",
                  danish: "Husskolopendre",
                  description: "Hurtigtløbende skolopendre med 15 par ekstremt lange ben og lange antenner. De jager fluer og edderkopper indendørs."
                },
                {
                  name: "Lithobiomorpha",
                  rank: "Orden",
                  latin: "Lithobiomorpha",
                  danish: "Stenskolopendre",
                  description: "Korte skolopendre med 15 par ben, som almindeligvis findes under sten og bark i Danmark, hvor de jager smådyr."
                }
              ]
            },
            {
              name: "Diplopoda",
              rank: "Klasse",
              latin: "Diplopoda",
              danish: "Tusindben",
              description: "Langsomme, cylinderformede mangebenede dyr med to par ben pr. kropssegment (hvilket skyldes, at segmenterne er sammensmeltet to og to). De lever hovedsageligt af dødt plantemateriale og forsvarer sig ved at rulle sig sammen.",
              children: [
                {
                  name: "Julida",
                  rank: "Orden",
                  latin: "Julida",
                  danish: "Cylinder-tusindben",
                  description: "Klassiske, lange og cylinderformede tusindben med et hårdt kalkskjold. De ruller sig sammen i en stram spiral, når de trues."
                },
                {
                  name: "Polydesmida",
                  rank: "Orden",
                  latin: "Polydesmida",
                  danish: "Flad-tusindben",
                  description: "Tusindben med en fladtrykt krop, hvor segmenterne har brede sideplader (paranota), der stikker ud til siderne. De mangler øjne og producerer ofte blåsyre (cyanid) som kemisk forsvar (aposematisme).",
                  children: [
                    {
                      name: "Xystodesmidae",
                      rank: "Familie",
                      latin: "Xystodesmidae",
                      danish: "Nordamerikanske fladtusindben",
                      description: "En familie af Polydesmida-tusindben hjemmehørende i Nord- og Mellemamerika. De er typisk dekorativt farvede med kontrasterende pletter langs siderne af kropsafsnittene – en advarsel (aposematisme) til rovdyr om, at de er giftige.",
                      children: [
                        {
                          name: "Harpaphe",
                          rank: "Slægt",
                          latin: "Harpaphe",
                          danish: "Mandeltusindben",
                          description: "En slægt af fladtusindben fra Nordamerikas Stillehavskyst. De er velkendte for at afgive en karakteristisk mandelduft, når de forstyrres – duften stammer fra blåsyre (hydrogen cyanid), som de udskiller fra kørtler længs kropsafsnittene.",
                          children: [
                            {
                              name: "Harpaphe haydeniana",
                              rank: "Art",
                              latin: "Harpaphe haydeniana",
                              danish: "Gul-plettet Tusindben",
                              description: "Et tusindben fra Stillehavskysten i Nordamerika (British Columbia til Californien), der lever i tykke lag af fugtigt løvfæld i skøvbunde. Den måler ca. 4 cm og har en blank sort krop med klargule/orange pletter på hvert segment – en klassisk aposematisk farveadvarsel. Når den føler sig truet, udskiller den hydrogen cyanid (blåsyre) fra kørtler i siderne, hvilket giver en tødelig mandelduft. Den spiller en vigtig rolle som nedbryder i skovens kredsforingskredsforingskredsforløb (næringsstofcyklus).",
                              animalId: "harpaphe"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Glomerida",
                  rank: "Orden",
                  latin: "Glomerida",
                  danish: "Kugletusindben",
                  description: "Korte tusindben med en hvælvet krop, der minder om bænkebidere. De kan rulle sig sammen til en fuldstændig lukket, hård kugle."
                }
              ]
            },
            {
              name: "Merostomata",
              rank: "Klasse",
              latin: "Merostomata",
              danish: "Dolkhaler",
              description: "En urgammel klasse af marine klosaksdyr, ofte kaldet 'levende fossiler', da de har ændret sig minimalt i 450 millioner år. De har et hårdt hesteskoformet skjold, gæller på undersiden og en lang halespids.",
              children: [
                {
                  name: "Xiphosura",
                  rank: "Orden",
                  latin: "Xiphosura",
                  danish: "Egentlige dolkhaler",
                  description: "Den eneste nulevende orden under klassen Merostomata. De har et karakteristisk hesteskoformet skjold og lever på havbunden."
                },
                {
                  name: "Eurypterida",
                  rank: "Orden",
                  latin: "Eurypterida",
                  danish: "Søskorpioner",
                  description: "En uddød orden af enorme marine rovdyr (nogle arter blev over 2,5 meter lange), som levede i Silur og Devon."
                }
              ]
            },
            {
              name: "Pycnogonida",
              rank: "Klasse",
              latin: "Pycnogonida",
              danish: "Havedderkopper",
              description: "Marine leddyr, der overfladisk ligner edderkopper, men tilhører deres egen unikke klasse. Deres krop er så lille, at tarmene og kønsorganerne strækker sig helt ud i de lange ben.",
              children: [
                {
                  name: "Pantopoda",
                  rank: "Orden",
                  latin: "Pantopoda",
                  danish: "Egentlige havedderkopper",
                  description: "Den eneste nulevende orden under klassen Pycnogonida, som omfatter alle moderne havedderkopper."
                }
              ]
            },
            {
              name: "Trilobita",
              rank: "Klasse",
              latin: "Trilobita",
              danish: "Trilobitter",
              description: "En uddød klasse af marine leddyr, der levede i jordens oldtid (for 520-250 mio. år siden). De er kendetegnet ved et tre-delt ydre skelet og var nogle af de første dyr med komplekse, sammensatte øjne.",
              children: [
                {
                  name: "Redlichiida",
                  rank: "Orden",
                  latin: "Redlichiida",
                  danish: "Primitive trilobitter",
                  description: "En af de ældste ordner af trilobitter, som levede i Kambrium. De havde mange segmenter og store, halvmåneformede øjne."
                },
                {
                  name: "Ptychopariida",
                  rank: "Orden",
                  latin: "Ptychopariida",
                  danish: "Almindelige trilobitter",
                  description: "En meget stor og divers orden af trilobitter med et simpelt, halvcirkulært hovedskjold."
                },
                {
                  name: "Phacopida",
                  rank: "Orden",
                  latin: "Phacopida",
                  danish: "Kompleksøje-trilobitter",
                  description: "Trilobitter kendetegnet ved at have højtudviklede, sammensatte øjne med store, separate linser af kalk (calcit)."
                }
              ]
            },
            {
              name: "Branchiopoda",
              rank: "Klasse",
              latin: "Branchiopoda",
              danish: "Bladfødder",
              description: "Primitive og små krebsdyr, der primært lever i ferskvand. Omfatter bl.a. dafnier. De bruger deres flade, bladformede ben som både svømmeorganer, fødefangere og gæller.",
              children: [
                {
                  name: "Anostraca",
                  rank: "Orden",
                  latin: "Anostraca",
                  danish: "Gællerejer",
                  description: "En orden af primitive bladfødder, der svømmer på ryggen og mangler et rygskjold. Mange arter lever i midlertidige søer og damme."
                },
                {
                  name: "Notostraca",
                  rank: "Orden",
                  latin: "Notostraca",
                  danish: "Skjoldsommerfugle",
                  description: "Primitive krebsdyr med et stort, fladt rygskjold, der dækker det meste af kroppen. De kaldes ofte 'levende fossiler', da deres morfologi har ændret sig minimalt siden Trias."
                },
                {
                  name: "Cladocera",
                  rank: "Orden",
                  latin: "Cladocera",
                  danish: "Dafnier",
                  description: "Meget små, gennemsigtige ferskvandskrebsdyr, hvor kroppen er omsluttet af en toklappet skal. De bevæger sig i ryk ved hjælp af de store antenner og er en vigtig del af fødekæden."
                }
              ]
            }
          ]
        },
        {
          name: "Mollusca",
          rank: "Række",
          latin: "Mollusca",
          danish: "Bløddyr",
          description: "Dyr med en blød, uleddet krop, der typisk består af et hoved, en muskuløs fod (til at bevæge sig med) og en indvoldsmasse omsluttet af en hudfold (kappen). Kappen udskiller ofte en beskyttende kalkskal. Omfatter snegle, muslinger og blæksprutter.",
          children: [
            {
              name: "Cephalopoda",
              rank: "Klasse",
              latin: "Cephalopoda",
              danish: "Blæksprutter",
              description: "Marine bløddyr, hvor foden har udviklet sig til arme og tentakler, der sidder direkte på hovedet (deraf navnet: 'hoved-fodede'). De har et lukket blodkarsystem, tre hjerter og en utroligt højtudviklet hjerne samt komplekse øjne, der minder om hvirveldyrs.",
              children: [
                {
                  name: "Octopoda",
                  rank: "Orden",
                  latin: "Octopoda",
                  danish: "Ottearmede blæksprutter",
                  description: "Blæksprutter med præcis otte arme forsynet med følsomme sugekopper. De mangler helt en indre eller ydre skal (modsat tiarmede blæksprutter, der har en 'skal' af kalk eller kitin), hvilket gør dem i stand til at mase sig igennem sprækker på størrelse med deres næb.",
                  children: [
                    {
                      name: "Octopodidae",
                      rank: "Familie",
                      latin: "Octopodidae",
                      danish: "Egentlige ottearmede blæksprutter",
                      description: "Den største familie af ottearmede blæksprutter. De er bundlevende (bentiske) og jager primært krabber, hummere og muslinger ved at lamme dem med giftig spyt fra deres hårde hornnæb.",
                      children: [
                        {
                          name: "Octopus",
                          rank: "Slægt",
                          latin: "Octopus",
                          danish: "Egentlige blæksprutter",
                          description: "En slægt af ekstremt intelligente blæksprutter. De har en fantastisk evne til at kamuflere sig ved at ændre både hudens farve (via kromatoforer) og struktur på få sekunder. De er kendt for at kunne løse komplekse gåder, bruge værktøj og huske mennesker.",
                          children: [
                            {
                              name: "Octopus vulgaris",
                              rank: "Art",
                              latin: "Octopus vulgaris",
                              danish: "Almindelig ottearmet blæksprutte",
                              description: "Lever i tropiske og tempererede have verden over. Den bygger huler af sten og muslingeskaller. Undersøgelser har vist, at den har et veludviklet kort- og langtidshukommelsessystem, og dens arme indeholder to tredjedele af dens samlede antal nerveceller (de kan 'tænke' selvstændigt).",
                              animalId: "blæksprutte"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Teuthida",
                  rank: "Orden",
                  latin: "Teuthida",
                  danish: "Tiarmede blæksprutter",
                  description: "Blæksprutter med ti arme (otte korte og to lange fangtentakler). De har en strømlinet, spoleformet krop med stabiliserende finner og en indre 'fjer' af kitin."
                },
                {
                  name: "Sepiida",
                  rank: "Orden",
                  latin: "Sepiida",
                  danish: "Sepiablæksprutter",
                  description: "Blæksprutter kendetegnet ved en fladtrykt krop omgivet af en smal finnekant og en kalkholdig indre skal (sepiaskal), som bruges til opdrift."
                },
                {
                  name: "Nautilida",
                  rank: "Orden",
                  latin: "Nautilida",
                  danish: "Perlebåde",
                  description: "Urgamle blæksprutter, som er de eneste nulevende arter med en ydre, spiralsnoet kalkskal inddelt i luftkamre til at regulere opdrift."
                }
              ]
            },
            {
              name: "Gastropoda",
              rank: "Klasse",
              latin: "Gastropoda",
              danish: "Snegle",
              description: "Den mest artsrige klasse af bløddyr. De har en asymmetrisk krop, oftest med en spiralformet skal, og et veludviklet hoved med tentakler og øjne. Deres krop har gennemgået en 'torsion' (vridning) under udviklingen.",
              children: [
                {
                  name: "Stylommatophora",
                  rank: "Orden",
                  latin: "Stylommatophora",
                  danish: "Landlungesnegle",
                  description: "Landsnegle, der har øjnene siddende på spidsen af et par lange, tilbagetrækkelige tentakler. De ånder med en 'lunge' (en omdannet kappehule).",
                  children: [
                    {
                      name: "Helicidae",
                      rank: "Familie",
                      latin: "Helicidae",
                      danish: "Egentlige landsnegle (Voldsnegle)",
                      description: "En stor familie af velkendte landsnegle med store, ofte farverige og mønstrede skaller.",
                      children: [
                        {
                          name: "Cornu",
                          rank: "Slægt",
                          latin: "Cornu",
                          danish: "Voldsnegle",
                          description: "En slægt af relativt store, europæiske landsnegle.",
                          children: [
                            {
                              name: "Cornu aspersum",
                              rank: "Art",
                              latin: "Cornu aspersum",
                              danish: "Plettet voldsnegl",
                              description: "En meget almindelig landsnegl med en karakteristisk plettet og brunlig skal. Oprindeligt fra Middelhavsområdet, men har spredt sig med mennesker og anses mange steder som et invasivt skadedyr i haver.",
                              animalId: "snegl"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "Annelida",
          rank: "Række",
          latin: "Annelida",
          danish: "Ledorme",
          description: "Dyr med en langstrakt krop, der er opdelt i en lang række gentagne ringformede led (segmenter). De har et veludviklet, lukket blodkarsystem og en væskefyldt kropshule (coelom), der fungerer som et hydroskelet til bevægelse. Omfatter regnorme, igler og børsteorme.",
          children: [
            {
              name: "Clitellata",
              rank: "Klasse",
              latin: "Clitellata",
              danish: "Bælteorme",
              description: "Ledorme, der er kendetegnet ved et 'bælte' (clitellum) – et fortykket hudområde på den forreste del af kroppen. Bæltet udskiller en slimring, som glider af ormen og danner en beskyttende kokon omkring æggene. De er hermafroditter (tvekønnede).",
              children: [
                {
                  name: "Crassiclitellata",
                  rank: "Orden",
                  latin: "Crassiclitellata",
                  danish: "Jordboende bælteorme",
                  description: "En orden af bælteorme, der næsten udelukkende lever på land i fugtig jord, i modsætning til andre grupper, der lever i ferskvand eller havvand.",
                  children: [
                    {
                      name: "Lumbricidae",
                      rank: "Familie",
                      latin: "Lumbricidae",
                      danish: "Egentlige regnorme",
                      description: "En familie af vigtige, jordbundsforbedrende ledorme. De lever af dødt organisk materiale (blade, planterester) og trækker det ned i jorden, hvor det nedbrydes. Derved iltes og gødes jorden, hvilket er fundamentalt for landbrug og natur.",
                      children: [
                        {
                          name: "Lumbricus",
                          rank: "Slægt",
                          latin: "Lumbricus",
                          danish: "Egentlige regnorme",
                          description: "En slægt af regnorme med en rødbrun rygside og en lysere bug. Deres bagende er ofte fladtrykt. De graver dybe, permanente gange i jorden.",
                          children: [
                            {
                              name: "Lumbricus terrestris",
                              rank: "Art",
                              latin: "Lumbricus terrestris",
                              danish: "Stor regnorm",
                              description: "Danmarks største regnorm (kan blive op til 25-30 cm lang). Den graver lodrette gange ned til 2-3 meters dybde. Den kommer op på jordoverfladen om natten for at finde føde og parre sig. Den trækker visne blade ned i sine gange, hvilket skaber frugtbar muldjord.",
                              animalId: "regnorm"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Hirudinida",
                  rank: "Orden",
                  latin: "Hirudinida",
                  danish: "Igler",
                  description: "Primært ferskvandslevende bælteorme. De fleste er rovdyr eller ektoparasitter, der suger blod fra andre dyr ved hjælp af kraftige sugeskiver i begge ender."
                },
                {
                  name: "Lumbriculida",
                  rank: "Orden",
                  latin: "Lumbriculida",
                  danish: "Ferskvands-fåbørsteorme",
                  description: "En orden af bælteorme, der primært lever i ferskvand. De ligner regnorme meget, men trækker vejret under vandet og spiser mudder og planterester."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "Plantae",
      rank: "Rige",
      latin: "Plantae",
      danish: "Planteriget",
      description: "Flercellede organismer, der oftest er autotrofe (producerer deres egen energi via fotosyntese). Deres celler har cellevægge af cellulose, og de mangler generelt evnen til at bevæge sig frit.",
      children: [
        {
          name: "Angiospermae",
          rank: "Række",
          latin: "Angiospermae",
          danish: "Dækfrøede planter (Blomsterplanter)",
          description: "Den mest artsrige og forskelligartede gruppe af landplanter. Deres frø udvikles skjult (dækket) inde i en frugt, og de har komplekse reproduktive strukturer, vi kender som blomster.",
          children: [
            {
              name: "Magnoliopsida",
              rank: "Klasse",
              latin: "Magnoliopsida",
              danish: "Tokimbladede",
              description: "En stor klasse af blomsterplanter, hvis frø oftest har to kimblade (første blade). Deres blade har typisk et netformet åremønster, og deres blomsterdele er ofte i firtal eller femtal.",
              children: [
                {
                  name: "Rosales",
                  rank: "Orden",
                  latin: "Rosales",
                  danish: "Rosenordenen",
                  description: "En stor og økonomisk vigtig orden af tokimbladede planter. Den inkluderer mange frugttræer (æble, pære, kirsebær) samt roser og nældearter.",
                  children: [
                    {
                      name: "Rosaceae",
                      rank: "Familie",
                      latin: "Rosaceae",
                      danish: "Rosenfamilien",
                      description: "En plantefamilie af træer, buske og urter. De har oftest savtakkede blade og femtallige, symmetriske blomster med mange støvdragere.",
                      children: [
                        {
                          name: "Rosa",
                          rank: "Slægt",
                          latin: "Rosa",
                          danish: "Roser",
                          description: "En slægt af oprette, klatrende eller krybende buske. De er ofte udstyret med torne og dyrkes over hele verden for deres skønhed og duft.",
                          children: [
                            {
                              name: "Rosa 'Precious Platinum'",
                              rank: "Art",
                              latin: "Rosa 'Precious Platinum'",
                              danish: "Rose 'Precious Platinum'",
                              description: "En berømt moderne haverose (Hybrid Tea). Den er kendt for sine store, blodrøde, let duftende blomster og fremragende modstandsdygtighed over for sygdomme. Oprindeligt fremavlet i 1974.",
                              animalId: "rose"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Gentianales",
                  rank: "Orden",
                  latin: "Gentianales",
                  danish: "Ensianordenen",
                  description: "En orden, der omfatter mange arter indeholdende komplekse alkaloider (som koffein og kinin).",
                  children: [
                    {
                      name: "Rubiaceae",
                      rank: "Familie",
                      latin: "Rubiaceae",
                      danish: "Krapfamilien",
                      description: "En stor plantefamilie (kaffefamilien), der er udbredt især i troperne. Planterne har oftest modsatte blade og stjerneformede blomster.",
                      children: [
                        {
                          name: "Coffea",
                          rank: "Slægt",
                          latin: "Coffea",
                          danish: "Kaffebuske",
                          description: "En slægt af buske og små træer, der stammer fra det tropiske Asien og Afrika. Deres 'bær' indeholder frø (kaffebønner), som bruges til at brygge kaffe.",
                          children: [
                            {
                              name: "Coffea arabica",
                              rank: "Art",
                              latin: "Coffea arabica",
                              danish: "Ægte kaffebusk (Arabica)",
                              description: "Den mest populære og udbredte kaffeart i verden, der udgør omkring 60% af den globale kaffeproduktion. Den stammer fra højlandet i Etiopien og værdsættes for sin milde og komplekse smag.",
                              animalId: "kaffe"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
]
};

// Dyr til listen (bruges til at bygge dyrevælgeren)
const animals = [
  { id: "løve", name: "Løve", scientific: "Panthera leo", icon: "🦁", theme: "lion", image: "images/lion.jpg" },
  { id: "ørn", name: "Kongeørn", scientific: "Aquila chrysaetos", icon: "🦅", theme: "eagle", image: "images/eagle.jpg" },
  { id: "reje", name: "Hestereje", scientific: "Crangon crangon", icon: "🦐", theme: "shrimp", image: "images/shrimp.jpg" },
  { id: "blæksprutte", name: "Almindelig Blæksprutte", scientific: "Octopus vulgaris", icon: "🐙", theme: "octopus", image: "images/octopus.jpg" },
  { id: "hval", name: "Blåhval", scientific: "Balaenoptera musculus", icon: "🐋", theme: "whale", image: "images/whale.jpg" },
  { id: "regnorm", name: "Stor Regnorm", scientific: "Lumbricus terrestris", icon: "🪱", theme: "earthworm", image: "images/earthworm.jpg" },
  { id: "myre", name: "Rød Skovmyre", scientific: "Formica rufa", icon: "🐜", theme: "ant", image: "images/ant.jpg" },
  { id: "humlebi", name: "Mørk Jordhumle", scientific: "Bombus terrestris", icon: "🐝", theme: "bumblebee", image: "images/bumblebee.jpg" },
  { id: "edderkop", name: "Korsedderkop", scientific: "Araneus diadematus", icon: "🕷️", theme: "spider", image: "images/spider.jpg" },
  { id: "skorpion", name: "Kejserskorpion", scientific: "Pandinus imperator", icon: "🦂", theme: "scorpion", image: "images/skorpion.jpg" },
  { id: "mejer", name: "Almindelig Mejer", scientific: "Phalangium opilio", icon: "🕷️", theme: "harvestman", image: "images/mejer.jpg" },
  { id: "skovflat", name: "Skovflåt", scientific: "Ixodes ricinus", icon: "🕷️", theme: "tick", image: "images/skovflat.jpg" },
  { id: "torsk", name: "Torsk", scientific: "Gadus morhua", icon: "🐟", theme: "cod", image: "images/torsk.jpg" },
  { id: "hvidhaj", name: "Hvidhaj", scientific: "Carcharodon carcharias", icon: "🦈", theme: "shark", image: "images/hvidhaj.jpg" },
  { id: "leguan", name: "Grøn Leguan", scientific: "Iguana iguana", icon: "🦎", theme: "lizard", image: "images/leguan.jpg" },
  { id: "slange", name: "Hugorm", scientific: "Vipera berus", icon: "🐍", theme: "snake", image: "images/slange.jpg" },
  { id: "komodovaran", name: "Komodovaran", scientific: "Varanus komodoensis", icon: "🐉", theme: "komodo", image: "images/komodovaran.jpg" },
  { id: "triceratops", name: "Triceratops", scientific: "Triceratops horridus", icon: "🦕", theme: "triceratops", image: "images/triceratops.png" },
  { id: "tyrannosaurus_rex", name: "Tyrannosaurus rex", scientific: "Tyrannosaurus rex", icon: "🦖", theme: "tyrannosaur", image: "images/tyrannosaurus_rex.png" },
  { id: "argentinosaurus", name: "Argentinosaurus", scientific: "Argentinosaurus huinculensis", icon: "🦕", theme: "sauropod", image: "images/argentinosaurus.png" },
  { id: "sort_enke", name: "Sort Enke", scientific: "Latrodectus mactans", icon: "🕷️", theme: "spider", image: "images/sort_enke.jpg" },
  { id: "nordhavsreje", name: "Nordhavsreje", scientific: "Pandalus borealis", icon: "🦐", theme: "shrimp", image: "images/nordhavsreje.jpg" },
  { id: "gepard", name: "Gepard", scientific: "Acinonyx jubatus", icon: "🐆", theme: "cheetah", image: "images/gepard.jpg" },
  { id: "harpaphe", name: "Gul-plettet Tusindben", scientific: "Harpaphe haydeniana", icon: "🐛", theme: "millipede", image: "images/harpaphe.jpg" },
  { id: "hund", name: "Hund", scientific: "Canis lupus familiaris", icon: "🐕", theme: "dog", image: "images/hund.jpg" },
  { id: "golden_retriever", name: "Golden Retriever", scientific: "Canis lupus familiaris", icon: "🦮", theme: "dog", image: "images/golden_retriever.jpg" },
  { id: "schaefer", name: "Schæferhund", scientific: "Canis lupus familiaris", icon: "🐕‍🦺", theme: "dog", image: "images/schafer.jpg" },
  { id: "boaslange", name: "Boaslange", scientific: "Boa constrictor", icon: "🐍", theme: "snake", image: "images/boaslange.jpg" },
  { id: "kobra", name: "Kobraslange", scientific: "Naja naja", icon: "🐍", theme: "snake", image: "images/kobra.jpg" },
  { id: "staalorm", name: "Stålorm", scientific: "Anguis fragilis", icon: "🦎", theme: "lizard", image: "images/staalorm.jpg" },
  { id: "tiger", name: "Tiger", scientific: "Panthera tigris", icon: "🐅", theme: "tiger", image: "images/tiger.jpg" },
  { id: "guldsmed", name: "Rød Græshøg", scientific: "Neurothemis fluctuans", icon: "🪰", theme: "dragonfly", image: "images/guldsmed.jpg" },
  { id: "snegl", name: "Plettet Voldsnegl", scientific: "Cornu aspersum", icon: "🐌", theme: "snail", image: "images/snegl.jpg" },
  { id: "ulv", name: "Ulv", scientific: "Canis lupus", icon: "🐺", theme: "wolf", image: "images/ulv.jpg" },
  { id: "raev", name: "Rød ræv", scientific: "Vulpes vulpes", icon: "🦊", theme: "fox", image: "images/raev.jpg" },
  { id: "rose", name: "Rose 'Precious Platinum'", scientific: "Rosa 'Precious Platinum'", icon: "🌹", theme: "rose", image: "images/rose.jpg" },
  { id: "kaffe", name: "Kaffebusk", scientific: "Coffea arabica", icon: "☕", theme: "coffee", image: "images/kaffe.jpg" },
  { id: "ecoli", name: "E. coli", scientific: "Escherichia coli", icon: "🦠", theme: "bacteria", image: "images/ecoli.jpg" },
  { id: "sulfolobus", name: "Sulfolobus", scientific: "Sulfolobus acidocaldarius", icon: "🌋", theme: "archaea", image: "images/sulfolobus.jpg" },
  { id: "delfin", name: "Delfin (Øresvin)", scientific: "Tursiops truncatus", icon: "🐬", theme: "dolphin", image: "images/delfin.jpg" },
  { id: "kamel", name: "Dromedar (Kamel)", scientific: "Camelus dromedarius", icon: "🐪", theme: "camel", image: "images/kamel.png" },
  { id: "giraf", name: "Giraf", scientific: "Giraffa camelopardalis", icon: "🦒", theme: "giraffe", image: "images/giraf.jpg" },
  { id: "ko", name: "Almindelig dansk malkeko", scientific: "Bos taurus", icon: "🐄", theme: "cow", image: "images/ko.png" },
  { id: "zebra", name: "Steppezebra", scientific: "Equus quagga", icon: "🦓", theme: "zebra", image: "images/zebra.jpg" },
  { id: "arabisk_hest", name: "Arabisk Fuldblod", scientific: "Equus ferus caballus", icon: "🐎", theme: "horse", image: "images/arabisk_hest.jpg" },
  { id: "menneske", name: "Menneske", scientific: "Homo sapiens", icon: "🧍", theme: "human", image: "images/menneske.jpg" },
  { id: "bjoern", name: "Brun Bjørn", scientific: "Ursus arctos", icon: "🐻", theme: "bear", image: "images/bjoern.jpg" },
  { id: "huskat", name: "Almindelig Huskat", scientific: "Felis catus", icon: "🐈", theme: "lion", image: "images/huskat.jpg" },
  { id: "naebdyr", name: "Næbdyr", scientific: "Ornithorhynchus anatinus", icon: "🦆", theme: "platypus", image: "images/naebdyr.jpg" },
  { id: "naesehorn", name: "Hvidt Næsehorn", scientific: "Ceratotherium simum", icon: "🦏", theme: "rhino", image: "images/naesehorn.jpg" },
  { id: "elefant", name: "Afrikansk Elefant", scientific: "Loxodonta africana", icon: "🐘", theme: "elephant", image: "images/elefant.jpg" },
  { id: "hyaene", name: "Plettet Hyæne", scientific: "Crocuta crocuta", icon: "😂", theme: "hyena", image: "images/hyaene.jpg" }
];

// Funktion til at finde stien (lineage) fra roden til et bestemt dyr
function getLineageForAnimal(tree, animalId, path = []) {
  const currentPath = [...path, tree];
  
  if (tree.animalId === animalId) {
    return currentPath;
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      const result = getLineageForAnimal(child, animalId, currentPath);
      if (result) return result;
    }
  }
  
  return null;
}

// Funktion til at finde alle noder på et bestemt taksonomisk niveau (f.eks. alle Rækker) i vores træ
function getAllTaxaAtRank(tree, rank, results = []) {
  if (tree.rank === rank) {
    // Undgå dubletter
    if (!results.some(r => r.name === tree.name)) {
      results.push(tree);
    }
  }
  if (tree.children) {
    for (const child of tree.children) {
      getAllTaxaAtRank(child, rank, results);
    }
  }
  return results;
}

// Funktion til at finde undergrupper (børn) af et bestemt taxon i vores træ
function getChildrenOfTaxon(tree, taxonName) {
  if (tree.name === taxonName) {
    return tree.children || [];
  }
  if (tree.children) {
    for (const child of tree.children) {
      const result = getChildrenOfTaxon(child, taxonName);
      if (result) return result;
    }
  }
  return null;
}

// Funktion til at søge efter en taxon-node ved navn i træet
function findTaxonNodeByName(tree, name) {
  if (tree.name === name) {
    return tree;
  }
  if (tree.children) {
    for (const child of tree.children) {
      const result = findTaxonNodeByName(child, name);
      if (result) return result;
    }
  }
  return null;
}

// Funktion til at lukke alle dropdown-menuer i stien
function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".stepper-dropdown");
  dropdowns.forEach(d => d.classList.remove("show"));
  
  const steps = document.querySelectorAll(".stepper-item");
  steps.forEach(s => s.classList.remove("dropdown-open"));
}

// Funktion til at justere dropdown-menuens placering så den ikke ryger uden for skærmen
function adjustDropdownPosition(dropdown) {
  dropdown.style.left = "";
  dropdown.style.right = "";
  
  const rect = dropdown.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  if (rect.right > viewportWidth) {
    const offset = rect.right - viewportWidth + 16;
    dropdown.style.left = `calc(0px - ${offset}px)`;
  }
  
  if (rect.left < 0) {
    const offset = -rect.left + 16;
    dropdown.style.left = `${offset}px`;
  }
}

// Funktion til at finde stien fra roden til en node med et bestemt navn
function getPathToNode(tree, name, path = []) {
  const currentPath = [...path, tree];
  if (tree.name === name) {
    return currentPath;
  }
  if (tree.children) {
    for (const child of tree.children) {
      const result = getPathToNode(child, name, currentPath);
      if (result) return result;
    }
  }
  return null;
}

// Funktion til at vælge en taxon-sti direkte (fx når en bruger vælger et led uden dyr)
function selectTaxonPath(targetNode, targetRankIndex) {
  // Find stien til denne node
  const path = getPathToNode(taxonomyTree, targetNode.name);
  if (!path) return;
  
  selectedLineage = path;
  activeRankIndex = targetRankIndex;
  
  // Opdater dyrenavnet øverst i visualiseringen til intet specifikt dyr
  currentAnimalId = null;
  activeAnimalName.innerHTML = `<em>Intet repræsentativt dyr</em>`;
  activeAnimalIcon.textContent = "🔍";
  document.body.className = "theme-default"; // Slate/neutral tema
  
  // Fjern den aktive markering fra dyrekortene
  const cards = animalGrid.querySelectorAll(".animal-card");
  cards.forEach(card => card.classList.remove("active"));
  
  // Render stien
  renderStepper();
  
  // Opdater detalje-området
  updateDetailView();
}


// Funktion til at finde alle dyr (blandt de 14), der tilhører et bestemt taxon (f.eks. alle under Arthropoda)
function getAnimalsInTaxon(taxonNode) {
  const list = [];
  function recurse(node) {
    if (node.animalId) {
      const anim = animals.find(a => a.id === node.animalId);
      if (anim) list.push(anim);
    }
    if (node.children) {
      for (const child of node.children) {
        recurse(child);
      }
    }
  }
  recurse(taxonNode);
  return list;
}

// Global app-tilstand
let currentAnimalId = "løve";
let activeRankIndex = 3; // Række (Phylum) som standard
let selectedLineage = [];
let viewMode = "linnaeus"; // "linnaeus" | "clade"
let activeCladeIndex = 0;  // aktiv trin-index i kladestien

// DOM Elementer
const animalGrid = document.getElementById("animal-grid");
const animalSearchInput = document.getElementById("animal-search-input");
const stepperContainer = document.getElementById("stepper-container");
const detailRankTitle = document.getElementById("detail-rank-title");
const detailRankMeaning = document.getElementById("detail-rank-meaning");
const detailRankEtymology = document.getElementById("detail-rank-etymology");
const detailTaxonLatin = document.getElementById("detail-taxon-latin");
const detailTaxonDanish = document.getElementById("detail-taxon-danish");
const detailTaxonDesc = document.getElementById("detail-taxon-desc");
const activeAnimalName = document.getElementById("active-animal-name");
const activeAnimalIcon = document.getElementById("active-animal-icon");

// Clade glossary elements
const cladeBtn = document.getElementById("clade-info-btn");
const cladeModal = document.getElementById("clade-modal");
const closeModal = document.getElementById("close-modal");

// Alternatives section DOM elements
const subDivTitle = document.getElementById("subdivision-title");
const subDivGrid = document.getElementById("subdivision-grid");

// Initialisering af dyrevælger-gitteret
function initAnimalGrid() {
  const searchTerm = animalSearchInput?.value.trim().toLocaleLowerCase("da-DK") || "";
  const visibleAnimals = animals
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "da-DK", { sensitivity: "base" }))
    .filter(animal => {
      const name = animal.name.toLocaleLowerCase("da-DK");
      const scientific = animal.scientific.toLocaleLowerCase("da-DK");
      return name.includes(searchTerm) || scientific.includes(searchTerm);
    });

  animalGrid.innerHTML = "";

  if (visibleAnimals.length === 0) {
    animalGrid.innerHTML = `
      <div class="animal-grid-empty">
        Ingen resultater. Prøv et andet navn eller latinsk navn.
      </div>
    `;
    return;
  }

  visibleAnimals.forEach(animal => {
    const card = document.createElement("div");
    card.className = `animal-card theme-${animal.theme}`;
    card.dataset.animalId = animal.id;
    if (animal.id === currentAnimalId) {
      card.classList.add("active");
    }
    
    card.innerHTML = `
      <div class="animal-card-icon">
        <img src="${animal.image}" alt="${animal.name}" class="animal-card-thumb">
      </div>
      <div class="animal-card-info">
        <h3 class="animal-card-name">${animal.name}</h3>
        <span class="animal-card-scientific">${animal.scientific}</span>
      </div>
    `;
    
    card.addEventListener("click", (e) => {
      if (e.target.closest(".foreign-word")) return;
      selectAnimal(animal.id);
    });
    
    animalGrid.appendChild(card);
  });
}

function updateAnimalGridActiveState() {
  const cards = animalGrid.querySelectorAll(".animal-card");
  cards.forEach(card => {
    card.classList.toggle("active", card.dataset.animalId === currentAnimalId);
  });
}

function selectAnimal(animalId) {
  currentAnimalId = animalId;
  
  // Opdater aktiv klasse i gitteret
  updateAnimalGridActiveState();
  
  // Hent ny sti
  selectedLineage = getLineageForAnimal(taxonomyTree, animalId);
  
  // Opdater dyrenavnet øverst i visualiseringen
  const animalObj = animals.find(a => a.id === animalId);
  activeAnimalName.textContent = animalObj.name;
  
  // Opdater avatar og hero-billede
  if (activeAnimalIcon) {
    if (activeAnimalIcon.tagName === "IMG") {
      activeAnimalIcon.src = animalObj.image;
      activeAnimalIcon.alt = animalObj.name;
    } else {
      activeAnimalIcon.textContent = animalObj.icon;
    }
  }
  
  const activeAnimalHeroImg = document.getElementById("active-animal-hero-img");
  const activeAnimalHeroScientific = document.getElementById("active-animal-hero-scientific");
  
  if (activeAnimalHeroImg) {
    activeAnimalHeroImg.src = animalObj.image;
    activeAnimalHeroImg.alt = animalObj.name;
  }
  if (activeAnimalHeroScientific) {
    activeAnimalHeroScientific.textContent = animalObj.scientific;
  }
  
  // Opdater CSS tema-klasse på body for dynamisk baggrundsglød
  document.body.className = `theme-${animalObj.theme}`;
  
  // Render sti og detaljer afhængigt af visnings-mode
  if (viewMode === "clade") {
    const path = (typeof cladePaths !== 'undefined') ? cladePaths[currentAnimalId] : null;
    activeCladeIndex = path ? Math.max(0, path.length - 3) : 0;
    renderCladeStepper();
    updateCladeDetailView();
  } else {
    renderStepper();
    updateDetailView();
  }
}

// Render den lodrette taksonomiske sti (stepper)
function renderStepper() {
  stepperContainer.innerHTML = "";
  
  selectedLineage.forEach((node, index) => {
    const step = document.createElement("div");
    step.className = "stepper-item";
    if (index === activeRankIndex) {
      step.classList.add("active");
    }
    
    // Ikon eller tal for niveauet
    const isSpecies = index === selectedLineage.length - 1;
    const bulletContent = isSpecies ? "🎯" : (index + 1);
    
    // Find alle alternativer på dette niveau baseret på forældrenoden i stien
    let options = [];
    if (index === 0) {
      options = [node];
    } else {
      const parentNode = selectedLineage[index - 1];
      options = parentNode.children || [];
    }
    
    // Byg dropdown-HTML hvis der er mere end 1 valgmulighed
    let dropdownHtml = "";
    const hasOptions = options.length > 1;
    if (hasOptions) {
      dropdownHtml = `
        <div class="stepper-dropdown" id="dropdown-${index}">
          ${options.map(opt => {
            const isActive = opt.name === node.name;
            return `
              <div class="stepper-dropdown-item ${isActive ? 'active' : ''}" data-taxon-name="${opt.name}">
                <span>${wrapForeignWords(opt.danish)}</span>
                <span class="stepper-dropdown-item-latin">${wrapForeignWords(opt.latin)}</span>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }
    
    const arrowHtml = hasOptions ? `<span class="stepper-arrow">▾</span>` : "";
    
    step.innerHTML = `
      <div class="stepper-bullet">${bulletContent}</div>
      <div class="stepper-content">
        <div class="stepper-rank">${wrapForeignWords(rankExplanations[node.rank] ? rankExplanations[node.rank].title : node.rank)} ${arrowHtml}</div>
        <div class="stepper-name-danish">${wrapForeignWords(node.danish)}</div>
        <div class="stepper-name-latin">${wrapForeignWords(node.latin)}</div>
      </div>
      ${dropdownHtml}
    `;
    
    step.addEventListener("click", (e) => {
      if (e.target.closest(".foreign-word")) return;
      // Hvis vi klikker på dropdown eller dets emner, skal vi ikke lukke/togle her
      if (e.target.closest(".stepper-dropdown")) {
        return;
      }
      
      const dropdown = step.querySelector(".stepper-dropdown");
      const wasShown = dropdown && dropdown.classList.contains("show");
      
      // Luk alle åbne dropdowns først
      closeAllDropdowns();
      
      activeRankIndex = index;
      // Opdater stepper aktiv klasse
      const steps = stepperContainer.querySelectorAll(".stepper-item");
      steps.forEach((s, idx) => {
        if (idx === index) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
      updateDetailView();
      
      // Hvis dette element har en dropdown, og den ikke var vist, vis den
      if (dropdown && !wasShown) {
        dropdown.classList.add("show");
        step.classList.add("dropdown-open");
        adjustDropdownPosition(dropdown);
        e.stopPropagation(); // Stop så document-click listeneren ikke lukker den med det samme
      }
    });
    
    // Gør dropdown-emnerne klikbare
    if (hasOptions) {
      const dropdownItems = step.querySelectorAll(".stepper-dropdown-item");
      dropdownItems.forEach(item => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const taxonName = item.getAttribute("data-taxon-name");
          const targetNode = options.find(opt => opt.name === taxonName);
          if (targetNode) {
            const representativeAnimals = getAnimalsInTaxon(targetNode);
            if (representativeAnimals.length > 0) {
              const hasCurrent = representativeAnimals.some(a => a.id === currentAnimalId);
              const targetAnimalId = hasCurrent ? currentAnimalId : representativeAnimals[0].id;
              
              activeRankIndex = index;
              selectAnimal(targetAnimalId);
            } else {
              selectTaxonPath(targetNode, index);
            }
          }
          closeAllDropdowns();
        });
      });
    }
    
    stepperContainer.appendChild(step);
  });
}

// Opdater detaljeområdet baseret på det valgte stiniveau
function updateDetailView() {
  if (!selectedLineage || selectedLineage.length === 0) return;
  
  const currentNode = selectedLineage[activeRankIndex];
  const rank = currentNode.rank;
  
  // 1. Vis rang-definitionen
  const rankInfo = rankExplanations[rank];
  if (rankInfo) {
    detailRankTitle.innerHTML = wrapForeignWords(rankInfo.title);
    detailRankMeaning.innerHTML = wrapForeignWords(rankInfo.meaning);
    detailRankEtymology.innerHTML = wrapForeignWords(`<strong>Etymologi:</strong> ${rankInfo.etymology}`);
  }
  
  // 2. Vis det specifikke taxons detaljer
  detailTaxonLatin.innerHTML = wrapForeignWords(currentNode.latin);
  detailTaxonDanish.innerHTML = wrapForeignWords(currentNode.danish);
  detailTaxonDesc.innerHTML = wrapForeignWords(currentNode.description);
  
  // 3. Find og vis alternative undergrupper (alternativer under forældrenoden)
  renderAlternatives(currentNode, indexToRank(activeRankIndex));
}

// Hjælpefunktion til at konvertere index til rangnavn
function indexToRank(index) {
  if (selectedLineage && selectedLineage[index] && selectedLineage[index].rank) {
    return selectedLineage[index].rank;
  }
  const ranks = ["Liv", "Domæne", "Rige", "Række", "Klasse", "Orden", "Familie", "Slægt", "Art"];
  return ranks[index];
}

// Vis undergrupper under det valgte niveau
function renderAlternatives(currentNode, currentRank) {
  subDivGrid.innerHTML = "";
  
  // Hvis vi er på Art-niveauet, er der ingen undergrupper i klassisk forstand
  if (currentRank === "Art") {
    subDivTitle.textContent = "Undergrupper under denne slægt";
    const infoText = document.createElement("div");
    infoText.className = "info-text-box";
    infoText.innerHTML = `
      <p><em>${currentNode.danish}</em> er det sidste niveau i vores klassifikation. Der er ikke yderligere undergrupper under en enkelt art i denne visualisering.</p>
      <p>Moderne biologer kan dog inddele arter i <strong>underarter</strong> (f.eks. sibirisk tiger vs. bengalsk tiger), hvis de er geografisk isolerede og har udviklet mindre forskelle.</p>
    `;
    subDivGrid.appendChild(infoText);
    return;
  }
  
  // Vi vil finde børnene af DETTE taxon (f.eks. hvis vi har klikket på Række, vil vi se klasserne UNDER denne Række)
  // Dette svarer præcis til brugerens ønske: "Ved f.eks. phylum vil jeg kunne se ... de alternative klasser, der eksisterer herunder."
  const nextRank = indexToRank(activeRankIndex + 1);
  
  const nextRankPlural = {
    "Domæne": "Domæner (Domains)",
    "Rige": "Riger (Kingdoms)",
    "Række": "Rækker (Phyla)",
    "Klasse": "Klasser (Classes)",
    "Orden": "Ordener (Orders)",
    "Familie": "Familier (Families)",
    "Slægt": "Slægter (Genera)",
    "Art": "Arter (Species)"
  }[nextRank] || nextRank + "er";

  subDivTitle.textContent = `${nextRankPlural} under ${currentNode.danish} (${currentNode.latin})`;
  
  // Hent børnene direkte fra det aktuelle trin i træet
  const children = currentNode.children || [];
  
  if (children.length === 0) {
    subDivGrid.innerHTML = "<p class='no-data-msg'>Ingen yderligere underopdelinger registreret i vores database.</p>";
    return;
  }
  
  children.forEach(child => {
    // Find ud af hvilke af vores 9 dyr der tilhører dette under-taxon
    const representativeAnimals = getAnimalsInTaxon(child);
    
    // Tjek om barnet er på den aktive sti for det nuværende valgte dyr
    const isNextInLineage = selectedLineage.some(node => node.name === child.name);
    
    const card = document.createElement("div");
    card.className = "subdivision-card";
    if (isNextInLineage) {
      card.classList.add("active-path");
    }
    
    // Byg dyre-badges til kortet
    let animalsHtml = "";
    if (representativeAnimals.length > 0) {
      animalsHtml = `
        <div class="sub-card-animals">
          <strong>Dyr herunder i listen:</strong>
          <div class="badge-container">
            ${representativeAnimals.map(anim => `
              <span class="animal-badge ${anim.id === currentAnimalId ? 'current' : ''}" data-animal-id="${anim.id}">
                ${anim.icon} ${anim.name}
              </span>
            `).join("")}
          </div>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="sub-card-header">
        <div>
          <span class="sub-card-rank-label">${wrapForeignWords(rankExplanations[child.rank] ? rankExplanations[child.rank].title : child.rank)}</span>
          <h4 class="sub-card-danish">${wrapForeignWords(child.danish)}</h4>
          <span class="sub-card-latin">${wrapForeignWords(child.latin)}</span>
        </div>
        ${isNextInLineage ? '<span class="active-badge">Valgte dyrs sti</span>' : ''}
      </div>
      <p class="sub-card-desc">${wrapForeignWords(child.description)}</p>
      ${animalsHtml}
    `;
    
    // Gør dyre-badges klikbare, så man hurtigt kan skifte til et af de dyr
    const badges = card.querySelectorAll(".animal-badge");
    badges.forEach(badge => {
      badge.addEventListener("click", (e) => {
        e.stopPropagation(); // Undgå at klikke på kortet
        const animId = badge.getAttribute("data-animal-id");
        selectAnimal(animId);
      });
    });
    
    // Gør hele kortet klikbart for at dykke ned i den gren!
    card.addEventListener("click", (e) => {
      if (e.target.closest(".foreign-word")) return;
      // Find det første dyr i listen under denne gren og vælg det
      if (representativeAnimals.length > 0) {
        selectAnimal(representativeAnimals[0].id);
        // Indstil det aktive rank-index til det næste niveau (det vi lige klikkede på)
        activeRankIndex = activeRankIndex + 1;
        renderStepper();
        updateDetailView();
      } else {
        // Hvis der ikke er noget repræsentativt dyr under denne gren, vælger vi stien direkte
        selectTaxonPath(child, activeRankIndex + 1);
      }
    });
    
    subDivGrid.appendChild(card);
  });
}

// Modal handlinger for Klad/Clade forklaring
cladeBtn.addEventListener("click", () => {
  cladeModal.classList.add("show");
});

closeModal.addEventListener("click", () => {
  cladeModal.classList.remove("show");
});

/* ==========================================================================
   Sammenligningsmodul
   ========================================================================== */
function getAnimalById(animalId) {
  return animals.find(animal => animal.id === animalId);
}

function getSharedLineageDepth(leftLineage, rightLineage) {
  const maxDepth = Math.min(leftLineage.length, rightLineage.length);
  let sharedDepth = -1;

  for (let index = 0; index < maxDepth; index++) {
    const leftNode = leftLineage[index];
    const rightNode = rightLineage[index];
    if (leftNode.rank === rightNode.rank && leftNode.name === rightNode.name) {
      sharedDepth = index;
    } else {
      break;
    }
  }

  return sharedDepth;
}

function populateCompareSelect(selectEl, selectedAnimalId) {
  if (!selectEl) return;

  selectEl.innerHTML = animals
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "da-DK", { sensitivity: "base" }))
    .map(animal => `
      <option value="${animal.id}" ${animal.id === selectedAnimalId ? "selected" : ""}>
        ${animal.name} (${animal.scientific})
      </option>
    `)
    .join("");
}

function renderCompareColumn(animal, lineage, sharedDepth, sideLabel) {
  return `
    <article class="compare-lineage-card theme-${animal.theme}">
      <div class="compare-hero">
        <img src="${animal.image}" alt="${animal.name}" class="compare-hero-img">
        <div class="compare-hero-overlay">
          <span class="compare-side-label">${sideLabel}</span>
          <h3>${animal.name}</h3>
          <span>${animal.scientific}</span>
        </div>
      </div>
      <div class="compare-lineage-list">
        ${lineage.map((node, index) => {
          const stateClass = index <= sharedDepth ? "shared" : "different";
          const rankTitle = viewMode === "clade" 
            ? (node.rank === "ART" ? "Art (Species)" : "Klad (Clade)")
            : (rankExplanations[node.rank] ? rankExplanations[node.rank].title : node.rank);
          const scientificName = node.latin || node.name || "";
          return `
            <div class="compare-row ${stateClass}">
              <div class="compare-row-index">${index + 1}</div>
              <div class="compare-row-content">
                <span class="compare-row-rank">${rankTitle}</span>
                <strong>${node.danish}</strong>
                <em>${scientificName}</em>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderCompareView() {
  if (!compareAnimalLeft || !compareAnimalRight || !compareGrid || !compareSummary) return;

  const leftAnimal = getAnimalById(compareAnimalLeft.value);
  const rightAnimal = getAnimalById(compareAnimalRight.value);
  if (!leftAnimal || !rightAnimal) return;

  let leftLineage, rightLineage;
  if (viewMode === "clade") {
    leftLineage = (typeof cladePaths !== 'undefined') ? (cladePaths[leftAnimal.id] || []) : [];
    rightLineage = (typeof cladePaths !== 'undefined') ? (cladePaths[rightAnimal.id] || []) : [];
  } else {
    leftLineage = getLineageForAnimal(taxonomyTree, leftAnimal.id) || [];
    rightLineage = getLineageForAnimal(taxonomyTree, rightAnimal.id) || [];
  }

  const sharedDepth = getSharedLineageDepth(leftLineage, rightLineage);
  const sharedNode = sharedDepth >= 0 ? leftLineage[sharedDepth] : null;
  const splitLeft = leftLineage[sharedDepth + 1];
  const splitRight = rightLineage[sharedDepth + 1];

  if (leftAnimal.id === rightAnimal.id) {
    compareSummary.innerHTML = `
      <strong>Samme organisme valgt.</strong>
      <span>Hele den viste ${viewMode === "clade" ? "kladistiske" : "taksonomiske"} linje er identisk.</span>
    `;
  } else if (sharedNode && splitLeft && splitRight) {
    const sharedRank = viewMode === "clade" ? "Klad" : (rankExplanations[sharedNode.rank] ? rankExplanations[sharedNode.rank].title : sharedNode.rank);
    compareSummary.innerHTML = `
      <strong>Fælles til og med ${sharedRank}: ${sharedNode.danish}.</strong>
      <span>Grenene skilles derefter ved ${splitLeft.danish} og ${splitRight.danish}.</span>
    `;
  } else if (sharedNode) {
    const sharedRank = viewMode === "clade" ? "Klad" : (rankExplanations[sharedNode.rank] ? rankExplanations[sharedNode.rank].title : sharedNode.rank);
    compareSummary.innerHTML = `
      <strong>Fælles til og med ${sharedRank}: ${sharedNode.danish}.</strong>
      <span>Den ene klassifikation fortsætter længere i databasen.</span>
    `;
  } else {
    compareSummary.innerHTML = `
      <strong>Ingen fælles ${viewMode === "clade" ? "klader" : "taksonomiske niveauer"} fundet i den viste sti.</strong>
      <span>Prøv et andet par organismer.</span>
    `;
  }

  compareGrid.innerHTML = `
    ${renderCompareColumn(leftAnimal, leftLineage, sharedDepth, "Organisme 1")}
    ${renderCompareColumn(rightAnimal, rightLineage, sharedDepth, "Organisme 2")}
  `;
}

function showCladeDetailModal(node) {
  if (cladeDetailModal && cladeDetailTitle && cladeDetailDesc) {
    const nameDanish = node.danish || node.name || "";
    const nameScientific = node.latin || node.name || "";
    cladeDetailTitle.innerHTML = `🧬 ${nameDanish} <span style="font-style: italic; font-size: 1.1rem; color: var(--accent); font-weight: normal; margin-left: 0.5rem;">(${nameScientific})</span>`;
    cladeDetailDesc.innerHTML = wrapForeignWords(node.desc || node.description || "Ingen beskrivelse tilgængelig.");
    cladeDetailModal.classList.add("show");
  }
}

function initCompareView() {
  if (!compareAnimalLeft || !compareAnimalRight) return;

  populateCompareSelect(compareAnimalLeft, currentAnimalId || "ulv");
  populateCompareSelect(compareAnimalRight, "raev");

  compareAnimalLeft.addEventListener("change", renderCompareView);
  compareAnimalRight.addEventListener("change", renderCompareView);

  if (compareSwapBtn) {
    compareSwapBtn.addEventListener("click", () => {
      const leftValue = compareAnimalLeft.value;
      compareAnimalLeft.value = compareAnimalRight.value;
      compareAnimalRight.value = leftValue;
      renderCompareView();
    });
  }

  // Click handler on compare grid rows
  if (compareGrid) {
    compareGrid.addEventListener("click", (e) => {
      const row = e.target.closest(".compare-row");
      if (!row) return;

      const card = row.closest(".compare-lineage-card");
      if (!card) return;

      const sideLabelEl = card.querySelector(".compare-side-label");
      if (!sideLabelEl) return;

      const side = sideLabelEl.textContent.trim();
      const index = parseInt(row.querySelector(".compare-row-index").textContent) - 1;

      const leftAnimal = getAnimalById(compareAnimalLeft.value);
      const rightAnimal = getAnimalById(compareAnimalRight.value);
      const animal = side === "Organisme 1" ? leftAnimal : rightAnimal;

      let lineage;
      if (viewMode === "clade") {
        lineage = (typeof cladePaths !== 'undefined') ? (cladePaths[animal.id] || []) : [];
      } else {
        lineage = getLineageForAnimal(taxonomyTree, animal.id) || [];
      }

      const node = lineage[index];
      if (node) {
        showCladeDetailModal(node);
      }
    });
  }

  // Modal dismiss triggers
  if (closeCladeDetailModalBtn && cladeDetailModal) {
    closeCladeDetailModalBtn.addEventListener("click", () => {
      cladeDetailModal.classList.remove("show");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === cladeDetailModal) {
      cladeDetailModal.classList.remove("show");
    }
  });

  renderCompareView();
}

/* ==========================================================================
   Quiz Modul Logik
   ========================================================================== */
const quizData = [
  { term: "Eukaryoter", latin: "Eukaryota", rank: "Domæne" },
  { term: "Dyreriget", latin: "Animalia", rank: "Rige" },
  { term: "Rygstrengsdyr", latin: "Chordata", rank: "Række" },
  { term: "Pattedyr", latin: "Mammalia", rank: "Klasse" },
  { term: "Leddyr", latin: "Arthropoda", rank: "Række" },
  { term: "Insekter", latin: "Insecta", rank: "Klasse" },
  { term: "Rovdyr", latin: "Carnivora", rank: "Orden" },
  { term: "Slanger", latin: "Serpentes", rank: "Underorden" },
  { term: "Kattefamilien", latin: "Felidae", rank: "Familie" },
  { term: "Brølekatteslægten", latin: "Panthera", rank: "Slægt" },
  { term: "Løve", latin: "Panthera leo", rank: "Art" },
  { term: "Hund", latin: "Canis lupus familiaris", rank: "Underart" },
  { term: "Golden Retriever", latin: "Canis lupus familiaris", rank: "Race" },
  { term: "Klovdyr og hvaler", latin: "Cetartiodactyla", rank: "Klad" },
  { term: "Egentlige fugle (Ornithurae)", latin: "Ornithurae", rank: "Underklad" }
];

const allRanks = [
  "Domæne", "Rige", "Række", "Klasse", "Orden", "Underorden", 
  "Familie", "Slægt", "Art", "Underart", "Race", "Klad", "Underklad"
];

let currentQuizIndex = 0;
let quizScore = 0;
let activeQuizQuestion = null;
let shuffledQuizData = [];

// View Toggle DOM Elements
const viewTreeBtn = document.getElementById("view-tree-btn");
const viewCompareBtn = document.getElementById("view-compare-btn");
const viewQuizBtn = document.getElementById("view-quiz-btn");
const animalsSection = document.getElementById("animals-section");
const visualizerSection = document.getElementById("visualizer-section");
const compareSection = document.getElementById("compare-section");
const quizSection = document.getElementById("quiz-section");
const compareAnimalLeft = document.getElementById("compare-animal-left");
const compareAnimalRight = document.getElementById("compare-animal-right");
const compareSwapBtn = document.getElementById("compare-swap-btn");
const compareSummary = document.getElementById("compare-summary");
const compareGrid = document.getElementById("compare-grid");

// Clade Detail Modal DOM Elements
const cladeDetailModal = document.getElementById("clade-detail-modal");
const closeCladeDetailModalBtn = document.getElementById("close-clade-detail-modal");
const cladeDetailTitle = document.getElementById("clade-detail-title");
const cladeDetailDesc = document.getElementById("clade-detail-desc");

// Quiz DOM Elements
const quizScoreEl = document.getElementById("quiz-score");
const quizProgressEl = document.getElementById("quiz-progress");
const quizTermEl = document.getElementById("quiz-term");
const quizLatinEl = document.getElementById("quiz-latin");
const quizOptionsEl = document.getElementById("quiz-options");
const quizFeedbackEl = document.getElementById("quiz-feedback");
const quizFeedbackTitle = document.getElementById("quiz-feedback-title");
const quizFeedbackText = document.getElementById("quiz-feedback-text");
const quizNextBtn = document.getElementById("quiz-next-btn");

function shuffleArray(array) {
  let curId = array.length;
  while (0 !== curId) {
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

function initQuiz() {
  quizScore = 0;
  currentQuizIndex = 0;
  shuffledQuizData = shuffleArray([...quizData]).slice(0, 10); // Vælg 10 tilfældige spørgsmål
  loadNextQuestion();
}

function loadNextQuestion() {
  if (currentQuizIndex >= shuffledQuizData.length) {
    // Quiz slut
    quizTermEl.textContent = "Quiz Færdig!";
    quizLatinEl.textContent = `Du fik ${quizScore} ud af ${shuffledQuizData.length} rigtige.`;
    quizOptionsEl.innerHTML = "";
    quizFeedbackEl.className = "quiz-feedback show";
    quizFeedbackTitle.textContent = "Flot klaret!";
    quizFeedbackText.textContent = "Vil du prøve igen?";
    quizNextBtn.textContent = "Genstart Quiz";
    quizNextBtn.style.display = "inline-block";
    quizNextBtn.onclick = () => { initQuiz(); };
    return;
  }

  activeQuizQuestion = shuffledQuizData[currentQuizIndex];
  
  // Opdater UI
  quizScoreEl.textContent = `Score: ${quizScore} / ${shuffledQuizData.length}`;
  quizProgressEl.textContent = `Spørgsmål ${currentQuizIndex + 1}`;
  quizTermEl.textContent = activeQuizQuestion.term;
  quizLatinEl.textContent = `(${activeQuizQuestion.latin})`;
  
  quizFeedbackEl.className = "quiz-feedback"; // Skjul feedback
  quizNextBtn.style.display = "none";
  
  // Generer svarknapper
  quizOptionsEl.innerHTML = "";
  allRanks.forEach(rank => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = rank;
    btn.onclick = () => checkAnswer(rank, btn);
    quizOptionsEl.appendChild(btn);
  });
}

function checkAnswer(selectedRank, btnElement) {
  const isCorrect = selectedRank === activeQuizQuestion.rank;
  
  // Deaktiver alle knapper
  const allBtns = quizOptionsEl.querySelectorAll(".quiz-option-btn");
  allBtns.forEach(b => b.disabled = true);
  
  if (isCorrect) {
    btnElement.classList.add("correct");
    quizScore++;
    quizFeedbackEl.className = "quiz-feedback show success";
    quizFeedbackTitle.textContent = "Korrekt!";
    quizFeedbackText.textContent = `Helt rigtigt. ${activeQuizQuestion.term} er en ${activeQuizQuestion.rank.toLowerCase()}.`;
  } else {
    btnElement.classList.add("wrong");
    
    // Find den rigtige og fremhæv den
    allBtns.forEach(b => {
      if (b.textContent === activeQuizQuestion.rank) {
        b.classList.add("correct");
      }
    });
    
    quizFeedbackEl.className = "quiz-feedback show error";
    quizFeedbackTitle.textContent = "Forkert!";
    quizFeedbackText.textContent = `Desværre. ${activeQuizQuestion.term} er faktisk en ${activeQuizQuestion.rank.toLowerCase()}.`;
  }
  
  quizScoreEl.textContent = `Score: ${quizScore} / ${shuffledQuizData.length}`;
  
  quizNextBtn.textContent = "Næste spørgsmål";
  quizNextBtn.style.display = "inline-block";
  quizNextBtn.onclick = () => {
    currentQuizIndex++;
    loadNextQuestion();
  };
}

// View Toggle Handlinger
function setActiveView(activeView) {
  const isTree = activeView === "tree";
  const isCompare = activeView === "compare";
  const isQuiz = activeView === "quiz";

  [
    [viewTreeBtn, isTree],
    [viewCompareBtn, isCompare],
    [viewQuizBtn, isQuiz]
  ].forEach(([button, isActive]) => {
    if (!button) return;
    button.classList.toggle("btn-primary", isActive);
    button.classList.toggle("btn-secondary", !isActive);
  });

  animalsSection.style.display = isTree ? "block" : "none";
  visualizerSection.style.display = isTree ? "block" : "none";
  if (compareSection) compareSection.style.display = isCompare ? "block" : "none";
  quizSection.style.display = isQuiz ? "block" : "none";

  if (isCompare) {
    renderCompareView();
  }
  if (isQuiz) {
    initQuiz(); // Start en ny quiz hver gang vi skifter
  }
}

if (viewTreeBtn && viewCompareBtn && viewQuizBtn) {
  viewTreeBtn.addEventListener("click", () => setActiveView("tree"));
  viewCompareBtn.addEventListener("click", () => setActiveView("compare"));
  viewQuizBtn.addEventListener("click", () => setActiveView("quiz"));
}

window.addEventListener("click", (e) => {
  if (e.target === cladeModal) {
    cladeModal.classList.remove("show");
  }
});

// --- KLADISTISK VISNING LOGIK ---
function setViewMode(mode) {
  viewMode = mode;
  const linnaeusBtn = document.getElementById("mode-linnaeus-btn");
  const cladeBtn = document.getElementById("mode-clade-btn");
  const compareLinnaeusBtn = document.getElementById("compare-mode-linnaeus-btn");
  const compareCladeBtn = document.getElementById("compare-mode-clade-btn");
  
  if (linnaeusBtn && cladeBtn) {
    if (mode === "linnaeus") {
      linnaeusBtn.classList.add("active");
      cladeBtn.classList.remove("active");
      document.getElementById("lineage-col-title").textContent = "Taksonomisk Linje";
      document.getElementById("lineage-col-desc").textContent = "Fra det mest generelle (Domæne) til det mest specifikke (Art).";
    } else {
      cladeBtn.classList.add("active");
      linnaeusBtn.classList.remove("active");
      document.getElementById("lineage-col-title").textContent = "Fylogenetisk Linje";
      document.getElementById("lineage-col-desc").textContent = "Viser præcis hvordan dyret er beslægtet i en ubrudt udviklingslinje.";
    }
  }

  if (compareLinnaeusBtn && compareCladeBtn) {
    if (mode === "linnaeus") {
      compareLinnaeusBtn.classList.add("active");
      compareCladeBtn.classList.remove("active");
    } else {
      compareCladeBtn.classList.add("active");
      compareLinnaeusBtn.classList.remove("active");
    }
  }
  
  selectAnimal(currentAnimalId);
  renderCompareView();
}

function renderCladeStepper() {
  if (typeof cladePaths === 'undefined') {
    stepperContainer.innerHTML = '<div class="clade-no-data">Kladistisk data indlæses...</div>';
    return;
  }
  const path = cladePaths[currentAnimalId];
  if (!path) {
    stepperContainer.innerHTML = '<div class="clade-no-data">Ingen kladistisk data for dette dyr.</div>';
    return;
  }

  stepperContainer.innerHTML = "";
  
  path.forEach((node, index) => {
    const item = document.createElement("div");
    item.className = "stepper-item clade-step";
    if (index === activeCladeIndex) item.classList.add("active");
    if (index === path.length - 1) item.classList.add("stepper-last");

    const line = document.createElement("div");
    line.className = "stepper-line";

    const bullet = document.createElement("div");
    bullet.className = "stepper-bullet";
    bullet.textContent = index === path.length - 1 ? "🎯" : "KLAD";

    const content = document.createElement("div");
    content.className = "stepper-content";

    const rankEl = document.createElement("div");
    rankEl.className = "stepper-rank";
    rankEl.innerHTML = wrapForeignWords(node.rank);

    const danishEl = document.createElement("div");
    danishEl.className = "stepper-name-danish";
    danishEl.innerHTML = wrapForeignWords(node.danish);

    const latinEl = document.createElement("div");
    latinEl.className = "stepper-name-latin";
    latinEl.innerHTML = wrapForeignWords(node.latin);

    content.appendChild(rankEl);
    content.appendChild(danishEl);
    content.appendChild(latinEl);

    item.appendChild(line);
    item.appendChild(bullet);
    item.appendChild(content);

    item.addEventListener("click", (e) => {
      if (e.target.closest(".foreign-word")) return;
      activeCladeIndex = index;
      renderCladeStepper();
      updateCladeDetailView();
    });

    stepperContainer.appendChild(item);
  });
}

function updateCladeDetailView() {
  if (typeof cladePaths === 'undefined') return;
  const path = cladePaths[currentAnimalId];
  if (!path || !path[activeCladeIndex]) return;

  const currentNode = path[activeCladeIndex];
  
  detailRankTitle.innerHTML = wrapForeignWords("Klad (Monofyletisk gruppe)");
  detailRankMeaning.innerHTML = wrapForeignWords("En klad er en gruppe bestående af en fælles stamfader og alle dens efterkommere.");
  detailRankEtymology.innerHTML = wrapForeignWords(`<strong>Etymologi:</strong> Fra græsk <em>klados</em> (gren).`);
  
  detailTaxonDanish.innerHTML = wrapForeignWords(currentNode.danish);
  detailTaxonLatin.innerHTML = wrapForeignWords(currentNode.latin);
  detailTaxonDesc.innerHTML = wrapForeignWords(currentNode.desc || "Denne gruppe repræsenterer en specifik gren på livets træ.");
  
  renderCladeAlternatives(path, activeCladeIndex);
}

function renderCladeAlternatives(path, index) {
  const currentNode = path[index];
  subDivTitle.textContent = `Nærmeste slægtskab i appen`;
  subDivGrid.innerHTML = "";
  
  let sharingHtml = "";
  
  // Find alle dyr i appen, der også tilhører præcis denne klad (samme latin navn)
  const sharedAnimals = [];
  animals.forEach(a => {
    if (a.id === currentAnimalId) return;
    const aPath = cladePaths[a.id];
    if (aPath && aPath.some(n => n.latin === currentNode.latin)) {
      sharedAnimals.push(a);
    }
  });

  if (sharedAnimals.length > 0) {
    const badgesHtml = sharedAnimals.map(a => `
      <span class="clade-badge" onclick="selectAnimal('${a.id}')" title="${a.name}" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin:2px;">
        ${a.icon} ${a.name}
      </span>
    `).join("");
    sharingHtml = `<div style="margin-top:0.8rem; font-size:0.8rem; color:var(--text-muted);">
      <strong>Andre i appen der tilhører ${currentNode.danish}:</strong><br>
      <div style="margin-top:0.3rem;">${badgesHtml}</div>
    </div>`;
  } else {
    sharingHtml = `<div style="margin-top:0.8rem; font-size:0.8rem; color:var(--text-muted);"><em>Ingen andre dyr i appen deler præcis denne klad.</em></div>`;
  }

  let prevHtml = "";
  if (index > 0) {
    prevHtml = `<div style="margin-top: 1rem; font-size:0.8rem;">
      <span style="color:var(--text-muted)">Opstået fra klad: </span> 
      <strong style="color:var(--text-primary); cursor:pointer;" onclick="activeCladeIndex=${index-1}; renderCladeStepper(); updateCladeDetailView();">⬆️ ${path[index-1].danish}</strong>
    </div>`;
  }

  let nextHtml = "";
  if (index < path.length - 1) {
    nextHtml = `<div style="margin-top: 0.5rem; font-size:0.8rem;">
      <span style="color:var(--text-muted)">Udvikler sig videre til: </span> 
      <strong style="color:var(--text-primary); cursor:pointer;" onclick="activeCladeIndex=${index+1}; renderCladeStepper(); updateCladeDetailView();">⬇️ ${path[index+1].danish}</strong>
    </div>`;
  }

  const card = document.createElement("div");
  card.className = "clade-info-panel";
  card.innerHTML = `
    <div class="clade-panel-label">${wrapForeignWords(currentNode.rank)}</div>
    <div class="clade-panel-name">${wrapForeignWords(currentNode.danish)}</div>
    <div class="clade-panel-desc">${wrapForeignWords(currentNode.desc || "Denne gruppe er defineret ved unikke evolutionære træk (synapomorfier), der deles af alle gruppens medlemmer.")}</div>
    ${prevHtml}${nextHtml}
    ${sharingHtml}
  `;
  subDivGrid.appendChild(card);
}

const etymologyDict = {
  "prokaryoter": "Før kerne (græsk: pro = før, karyon = nød/kerne).",
  "eukaryoter": "Ægte kerne (græsk: eu = ægte, karyon = nød/kerne).",
  "fotosyntese": "At sætte sammen med lys (græsk: photo = lys, synthesis = sammensætning).",
  "autotrof": "Selv-ernærende (græsk: autos = selv, trophe = ernæring).",
  "heterotrof": "Anden-ernærende (græsk: heteros = anden, trophe = ernæring).",
  "morfologiske": "Vedr. form og bygning (græsk: morphe = form, logos = lære).",
  "monofyletisk": "Af én stamme (græsk: monos = én, phyle = stamme).",
  "kladistik": "Fra græsk klados = gren.",
  "fylogenetisk": "Vedr. stammens udvikling (græsk: phylon = stamme, genesis = oprindelse).",
  "takson": "Fra græsk taxis = ordning.",
  "taxon": "Fra græsk taxis = ordning.",
  "ekkolokalisering": "Lyd-stedbestemmelse (græsk echo + latin locus).",
  "ovovivipari": "Æg-levendefødende (latin: ovum = æg, vivus = levende, parere = at føde).",
  "konstriktion": "Sammensnøring (latin: constringere).",
  "biota": "Fra græsk 'biote' (liv) og latin 'biota'.",
  "eukaryota": "Ægte kerne (græsk: eu = ægte, karyon = nød/kerne).",
  "prokaryota": "Før kerne (græsk: pro = før, karyon = nød/kerne).",
  "animalia": "Fra latin 'animalis' (har en ånde/sjæl).",
  "chordata": "Fra græsk 'chorde' (streng/reb), refererer til rygstrengen.",
  "chordater": "Dansk form af Chordata. Fra græsk 'chorde' (streng/reb), refererer til rygstrengen.",
  "arthropoda": "Fra græsk 'arthron' (led) og 'podos' (fod/ben).",
  "mammalia": "Fra latin 'mamma' (bryst).",
  "aves": "Fra latin for 'fugle'.",
  "reptilia": "Fra latin 'repere' (at krybe).",
  "amphibia": "Fra græsk 'amphi' (begge) og 'bios' (liv) - lever både i vand og på land.",
  "actinopterygii": "Fra græsk 'aktis' (stråle) og 'pteryx' (finne/vinge).",
  "chondrichthyes": "Fra græsk 'chondros' (brusk) og 'ichthys' (fisk).",
  "placoidskæl": "Fra græsk 'plax' (flad plade) og 'eidos' (form).",
  "fungi": "Fra latin for 'svamp'.",
  "plantae": "Fra latin for 'plante'.",
  "bacteria": "Fra græsk 'bakterion' (lille stav).",
  "archaea": "Fra græsk 'archaios' (gammel/oprindelig).",
  "insecta": "Fra latin 'insectum' (indskåret/opdelt), refererer til leddelt krop.",
  "carnivora": "Fra latin 'caro' (kød) og 'vorare' (at sluge).",
  "felidae": "Fra latin 'feles' (kat).",
  "panthera": "Fra græsk 'panther' (panter/stor kat).",
  "leo": "Fra latin 'leo' (løve).",
  "primates": "Fra latin 'primus' (første/fornemste).",
  "hominidae": "Fra latin 'homo' (menneske).",
  "sapiens": "Fra latin 'sapiens' (vis/fornuftig)."
};

function wrapForeignWords(text) {
  if (!text) return text;
  let wrappedText = text;
  const words = Object.keys(etymologyDict).sort((a, b) => b.length - a.length);
  
  for (const word of words) {
    const regex = new RegExp("\\\\b(" + word + ")\\\\b(?![^<]*>)", "gi");
    wrappedText = wrappedText.replace(regex, (match) => {
      if (match.includes("foreign-word")) return match;
      return '<span class="foreign-word" data-word="' + word.toLowerCase() + '" style="cursor:help; border-bottom:1px dotted var(--accent);">' + match + '</span>';
    });
  }
  return wrappedText;
}

// Global click listener til at lukke dropdown-menuer når der klikkes udenfor
document.addEventListener("click", () => {
  closeAllDropdowns();
});

// Start appen
document.addEventListener("DOMContentLoaded", () => {
  if (animalSearchInput) {
    animalSearchInput.addEventListener("input", initAnimalGrid);
  }

  // Toggle events
  const modeLinnaeusBtn = document.getElementById("mode-linnaeus-btn");
  const modeCladeBtn = document.getElementById("mode-clade-btn");
  
  if (modeLinnaeusBtn) {
    modeLinnaeusBtn.addEventListener("click", () => setViewMode("linnaeus"));
  }
  if (modeCladeBtn) {
    modeCladeBtn.addEventListener("click", () => setViewMode("clade"));
  }

  const compareModeLinnaeusBtn = document.getElementById("compare-mode-linnaeus-btn");
  const compareModeCladeBtn = document.getElementById("compare-mode-clade-btn");
  if (compareModeLinnaeusBtn) {
    compareModeLinnaeusBtn.addEventListener("click", () => setViewMode("linnaeus"));
  }
  if (compareModeCladeBtn) {
    compareModeCladeBtn.addEventListener("click", () => setViewMode("clade"));
  }

  // Etymology Tooltip Logic
  const tooltip = document.getElementById("etymology-tooltip");
  if (tooltip) {
    document.body.addEventListener("click", (e) => {
      const foreignWordEl = e.target.closest(".foreign-word");
      if (foreignWordEl) {
        const word = foreignWordEl.getAttribute("data-word");
        const definition = etymologyDict[word];
        
        if (definition) {
          tooltip.innerHTML = '<strong>' + foreignWordEl.textContent + '</strong> ' + definition;
          tooltip.classList.remove("hidden");
          tooltip.classList.add("show");
          
          const rect = foreignWordEl.getBoundingClientRect();
          tooltip.style.left = (rect.left + window.scrollX) + 'px';
          tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
          
          tooltip.style.position = 'absolute';
          tooltip.style.background = 'var(--bg-card)';
          tooltip.style.border = '1px solid var(--accent)';
          tooltip.style.padding = '0.5rem';
          tooltip.style.borderRadius = '8px';
          tooltip.style.zIndex = '9999';
          tooltip.style.color = 'var(--text-primary)';
          tooltip.style.boxShadow = 'var(--shadow-lg)';
        }
      } else {
        tooltip.classList.remove("show");
        tooltip.classList.add("hidden");
      }
    });
  }

  initAnimalGrid();
  initCompareView();
  selectAnimal("løve"); // Vælg løve som standard
});
