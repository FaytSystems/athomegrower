function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const defaults = {
  "pet-friendly": {
    petStatus: "pet-friendly",
    lightText: "Bright indirect light",
    careLevel: "easy",
    waterText: "Water when the top inch of soil dries",
    soilText: "Airy, well-draining indoor potting mix",
    plantType: "pet-friendly houseplant",
    bestFor: "Pet-aware homes, shelves, desks, and bright rooms",
    description: "A pet-aware plant profile added to the expanded AtHomeGrower library. Verify with a veterinarian if a pet chews plants heavily.",
  },
  toxic: {
    petStatus: "toxic",
    lightText: "Bright indirect light",
    careLevel: "moderate",
    waterText: "Water when the top 1-2 inches dry",
    soilText: "Well-draining indoor potting mix",
    plantType: "decorative toxic houseplant",
    bestFor: "Display areas away from pets and children",
    description: "A decorative plant profile for growers who need clear keep-away notes, care basics, and diagnosis links.",
  },
  herbs: {
    petStatus: "check-before-use",
    lightText: "Full sun to bright light",
    careLevel: "easy",
    waterText: "Keep evenly moist, then let the surface dry lightly",
    soilText: "Well-draining herb or vegetable potting mix",
    plantType: "culinary or useful herb",
    bestFor: "Kitchen gardens, containers, raised beds, and pollinator plantings",
    description: "An herb profile added for cooking, fragrance, tea, pollinators, or garden utility.",
  },
  vegetables: {
    petStatus: "check-before-use",
    lightText: "Full sun to bright light",
    careLevel: "moderate",
    waterText: "Keep evenly moist during active growth",
    soilText: "Rich, well-draining vegetable garden mix",
    plantType: "edible vegetable crop",
    bestFor: "Raised beds, patio containers, kitchen gardens, and sunny plots",
    description: "A vegetable profile with practical care, soil, watering, and placement notes for home growers.",
  },
  fruits: {
    petStatus: "check-before-use",
    lightText: "Full sun to bright light",
    careLevel: "moderate",
    waterText: "Keep evenly moist during flowering and fruiting",
    soilText: "Rich, well-draining fruit or berry mix",
    plantType: "fruiting plant",
    bestFor: "Container fruit, edible landscapes, orchards, and sunny garden spaces",
    description: "A fruit profile added to the expanded library for edible gardens and container growing.",
  },
  "cover-crops": {
    petStatus: "check-before-use",
    lightText: "Full sun to bright light",
    careLevel: "easy",
    waterText: "Keep evenly moist while establishing",
    soilText: "Average to fertile, well-drained soil",
    plantType: "soil-building cover crop",
    bestFor: "Soil building, erosion control, mulch, nitrogen capture, and garden rotations",
    description: "A cover crop profile for building soil, protecting beds, feeding soil biology, or filling seasonal gaps.",
  },
};

function parseLines(category, text) {
  return text
    .trim()
    .split(/\n+/)
    .map((line, index) => {
      const [name, botanicalName = "", plantType = "", lightText = "", waterText = "", soilText = "", careLevel = ""] = line.split("|").map((item) => item.trim());
      const base = defaults[category];
      return {
        id: `supplemental-${category}-${slugify(name)}`,
        source: "supplemental-expansion",
        plantTypeCategory: category,
        number: 9000 + index,
        name,
        botanicalName,
        slug: slugify(name),
        image: "",
        alt: `${name} plant illustration`,
        petStatus: base.petStatus,
        lightText: lightText || base.lightText,
        careLevel: careLevel || base.careLevel,
        waterText: waterText || base.waterText,
        soilText: soilText || base.soilText,
        foliageType: plantType || base.plantType,
        plantType: plantType || base.plantType,
        bestFor: base.bestFor,
        description: `${name} is ${base.description.charAt(0).toLowerCase()}${base.description.slice(1)}`,
        finderTags: [
          `category:${category}`,
          `plant-type:${category}`,
          "fill-my-space:enabled",
          "plant-facts:enabled",
          "plant-care:enabled",
          `care:${slugify(careLevel || base.careLevel)}`,
        ],
        environment: category === "cover-crops" || category === "vegetables" || category === "fruits" ? "outdoor" : "indoor-outdoor",
        environmentLabel: category === "cover-crops" || category === "vegetables" || category === "fruits" ? "Outdoor" : "Indoor/Outdoor",
        overview: "",
        light: lightText || base.lightText,
        soilMix: soilText || base.soilText,
        soilMoisture: base.waterText,
        whenToWater: waterText || base.waterText,
        whenToFertilize: category === "cover-crops" ? "Usually not needed unless soil is extremely depleted." : "Feed lightly during active growth when the plant is producing new leaves, stems, flowers, or fruit.",
        howToPrune: category === "cover-crops" ? "Cut, mow, chop, or tarp before the crop sets unwanted seed." : "Remove damaged growth and harvest or prune in small amounts so the plant can recover.",
        repottingRootbound: "Move container plants up one pot size when roots circle densely or watering becomes difficult.",
        commonPestsDiseases: "Watch for aphids, mites, thrips, whiteflies, leaf spot, powdery mildew, damping off, and root rot.",
        companionPlanting: "Match nearby plants by light, water, airflow, and harvest timing.",
        quickTags: [category.replace("-", " "), plantType || base.plantType, lightText || base.lightText, careLevel || base.careLevel],
        season: category === "cover-crops" ? "seasonal rotation crop" : "",
        plantingWindow: category === "cover-crops" ? "Sow in the window that matches your climate, frost timing, and whether the cover is warm-season or cool-season." : "",
        termination: category === "cover-crops" ? "Terminate before seed set unless reseeding is desired." : "",
        uses: category === "cover-crops" ? "Soil cover, biomass, nutrient cycling, weed suppression, erosion control, pollinator support, or nitrogen fixation depending on the species." : "",
      };
    });
}

const supplementalPlants = [
  ...parseLines("pet-friendly", `
Silver Ribbon Fern|Pteris cretica|fern
Brake Fern|Pteris cretica|fern
Kangaroo Paw Fern|Microsorum diversifolium|fern
Blue Star Fern|Phlebodium aureum|fern
Cretan Brake Fern|Pteris cretica|fern
Heart Fern|Hemionitis arifolia|fern
Cliff Brake Fern|Pellaea rotundifolia|fern
Japanese Bird's Nest Fern|Asplenium nidus|fern
Victoria Bird's Nest Fern|Asplenium antiquum|fern
Austral Gem Fern|Asplenium dimorphum x difforme|fern
Elkhorn Fern|Platycerium bifurcatum|fern
Button Fern|Pellaea rotundifolia|fern
Maidenhair Spleenwort|Asplenium trichomanes|fern
Holly Fern|Cyrtomium falcatum|fern
Peperomia Frost|Peperomia caperata|peperomia
Peperomia Napoli Nights|Peperomia caperata|peperomia
Peperomia Emerald Ripple|Peperomia caperata|peperomia
Peperomia Piccolo Banda|Peperomia albovittata|peperomia
Peperomia Ginny|Peperomia clusiifolia|peperomia
Peperomia Pixie Lime|Peperomia orba|peperomia
Peperomia Jayde|Peperomia polybotrya|peperomia
Peperomia Raindrop|Peperomia polybotrya|peperomia
Peperomia Beetle|Peperomia quadrangularis|peperomia
Peperomia Tetragona|Peperomia tetragona|peperomia
Peperomia Ruby Cascade|Peperomia rubella|peperomia
Peperomia String of Turtles|Peperomia prostrata|trailing peperomia
Peperomia Hope|Peperomia tetraphylla|trailing peperomia
Peperomia Parallel|Peperomia puteolata|peperomia
Peperomia Rosso|Peperomia caperata|peperomia
Peperomia Obtusifolia Variegata|Peperomia obtusifolia|peperomia
Calathea Orbifolia|Goeppertia orbifolia|prayer plant
Calathea Freddie|Goeppertia concinna|prayer plant
Calathea White Fusion|Goeppertia lietzei|prayer plant
Calathea Network|Goeppertia kegeljanii|prayer plant
Calathea Beauty Star|Goeppertia ornata|prayer plant
Calathea Dottie|Goeppertia roseopicta|prayer plant
Calathea Medallion|Goeppertia veitchiana|prayer plant
Calathea Rattlesnake|Goeppertia insignis|prayer plant
Calathea Peacock Plant|Goeppertia makoyana|prayer plant
Calathea White Star|Goeppertia majestica|prayer plant
Calathea Warscewiczii|Goeppertia warszewiczii|prayer plant
Calathea Zebrina|Goeppertia zebrina|prayer plant
Calathea Misto|Goeppertia louisae|prayer plant
Calathea Leopardina|Goeppertia leopardina|prayer plant
Ctenanthe Burle-Marxii|Ctenanthe burle-marxii|prayer plant
Ctenanthe Lubbersiana|Ctenanthe lubbersiana|prayer plant
Ctenanthe Setosa Grey Star|Ctenanthe setosa|prayer plant
Stromanthe Triostar|Stromanthe sanguinea|prayer plant
Maranta Fascinator|Maranta leuconeura|prayer plant
Maranta Kerchoveana|Maranta leuconeura|prayer plant
Maranta Silver Band|Maranta leuconeura|prayer plant
Fittonia White Anne|Fittonia albivenis|nerve plant
Fittonia Pink Angel|Fittonia albivenis|nerve plant
Fittonia Red Star|Fittonia albivenis|nerve plant
Pilea Silver Tree|Pilea spruceana|pilea
Pilea Norfolk|Pilea spruceana|pilea
Pilea Dark Mystery|Pilea involucrata|pilea
Pilea Aquamarine|Pilea glauca|pilea
Pilea Baby Tears|Pilea depressa|pilea
Pilea Creeping Charlie|Pilea nummulariifolia|trailing plant
Pilea Silver Cloud|Pilea pubescens|pilea
Swedish Ivy|Plectranthus verticillatus|trailing plant
Variegated Swedish Ivy|Plectranthus coleoides|trailing plant
Creeping Jenny|Lysimachia nummularia|trailing plant
Hoya Carnosa|Hoya carnosa|hoya
Hoya Compacta|Hoya carnosa compacta|hoya
Hoya Krimson Queen|Hoya carnosa|hoya
Hoya Krimson Princess|Hoya carnosa|hoya
Hoya Pubicalyx|Hoya pubicalyx|hoya
Hoya Kerrii|Hoya kerrii|hoya
Hoya Australis|Hoya australis|hoya
Hoya Linearis|Hoya linearis|hoya
Hoya Wayetii|Hoya wayetii|hoya
Hoya Obovata|Hoya obovata|hoya
Hoya Mathilde|Hoya carnosa x serpens|hoya
Hoya Bella|Hoya lanceolata bella|hoya
Hoya Curtisii|Hoya curtisii|hoya
Hoya Lacunosa|Hoya lacunosa|hoya
Hoya Shepherdii|Hoya shepherdii|hoya
Hoya Sunrise|Hoya obscura hybrid|hoya
Phalaenopsis Orchid|Phalaenopsis spp.|orchid
Dendrobium Orchid|Dendrobium spp.|orchid
Cattleya Orchid|Cattleya spp.|orchid
Oncidium Orchid|Oncidium spp.|orchid
Cymbidium Orchid|Cymbidium spp.|orchid
Paphiopedilum Orchid|Paphiopedilum spp.|orchid
Miltoniopsis Orchid|Miltoniopsis spp.|orchid
Jewel Orchid|Ludisia discolor|orchid
Vanda Orchid|Vanda spp.|orchid
Guzmania Bromeliad|Guzmania spp.|bromeliad
Neoregelia Bromeliad|Neoregelia spp.|bromeliad
Vriesea Bromeliad|Vriesea spp.|bromeliad
Aechmea Bromeliad|Aechmea spp.|bromeliad
Cryptanthus Earth Star|Cryptanthus bivittatus|bromeliad
Air Plant Ionantha|Tillandsia ionantha|air plant
Air Plant Xerographica|Tillandsia xerographica|air plant
Air Plant Bulbosa|Tillandsia bulbosa|air plant
Air Plant Stricta|Tillandsia stricta|air plant
Christmas Cactus|Schlumbergera bridgesii|holiday cactus
Thanksgiving Cactus|Schlumbergera truncata|holiday cactus
Easter Cactus|Rhipsalidopsis gaertneri|holiday cactus
Mistletoe Cactus|Rhipsalis baccifera|jungle cactus
Fishbone Cactus|Disocactus anguliger|jungle cactus
Burro's Tail|Sedum morganianum|succulent
Echeveria Lola|Echeveria 'Lola'|succulent
Echeveria Perle von Nurnberg|Echeveria 'Perle von Nurnberg'|succulent
Zebra Haworthia|Haworthiopsis attenuata|succulent
Haworthia Cooperi|Haworthia cooperi|succulent
Gasteria Little Warty|Gasteria 'Little Warty'|succulent
Sempervivum Hens and Chicks|Sempervivum tectorum|succulent
Lithops Living Stones|Lithops spp.|succulent
Baby Tears|Soleirolia soleirolii|groundcover houseplant
Goldfish Plant|Nematanthus gregarius|flowering houseplant
Lipstick Plant|Aeschynanthus radicans|flowering houseplant
Polka Dot Plant|Hypoestes phyllostachya|foliage plant
Purple Waffle Plant|Hemigraphis alternata|foliage plant
Cast Iron Plant|Aspidistra elatior|low-light foliage plant
Ponytail Palm|Beaucarnea recurvata|succulent palm
Lady Palm|Rhapis excelsa|palm
Kentia Palm|Howea forsteriana|palm
Bamboo Palm|Chamaedorea seifrizii|palm
Cat Palm|Chamaedorea cataractarum|palm
Pygmy Date Palm|Phoenix roebelenii|palm
Chinese Fan Palm|Livistona chinensis|palm
Money Tree|Pachira aquatica|indoor tree
Mosaic Plant|Ludwigia sedioides|aquatic plant
Water Lettuce|Pistia stratiotes|aquatic plant
Water Hyacinth|Eichhornia crassipes|aquatic plant
`),
  ...parseLines("toxic", `
Golden Pothos|Epipremnum aureum|aroid vine
Marble Queen Pothos|Epipremnum aureum|aroid vine
Neon Pothos|Epipremnum aureum|aroid vine
Jade Pothos|Epipremnum aureum|aroid vine
Pearls and Jade Pothos|Epipremnum aureum|aroid vine
Manjula Pothos|Epipremnum aureum|aroid vine
Cebu Blue Pothos|Epipremnum pinnatum|aroid vine
Satin Pothos|Scindapsus pictus|aroid vine
Silver Splash Pothos|Scindapsus pictus|aroid vine
Heartleaf Philodendron|Philodendron hederaceum|aroid vine
Philodendron Brasil|Philodendron hederaceum|aroid vine
Philodendron Micans|Philodendron hederaceum|aroid vine
Philodendron Birkin|Philodendron 'Birkin'|aroid foliage plant
Philodendron Prince of Orange|Philodendron hybrid|aroid foliage plant
Philodendron Pink Princess|Philodendron erubescens|aroid foliage plant
Philodendron White Knight|Philodendron erubescens|aroid foliage plant
Philodendron Rojo Congo|Philodendron hybrid|aroid foliage plant
Philodendron Xanadu|Thaumatophyllum xanadu|aroid foliage plant
Split-Leaf Philodendron|Thaumatophyllum bipinnatifidum|aroid foliage plant
Monstera Deliciosa|Monstera deliciosa|aroid vine
Monstera Adansonii|Monstera adansonii|aroid vine
Monstera Peru|Monstera karstenianum|aroid vine
Rhaphidophora Tetrasperma|Rhaphidophora tetrasperma|aroid vine
Mini Monstera|Rhaphidophora tetrasperma|aroid vine
Swiss Cheese Vine|Monstera adansonii|aroid vine
ZZ Plant|Zamioculcas zamiifolia|rhizomatous houseplant
Raven ZZ Plant|Zamioculcas zamiifolia|rhizomatous houseplant
Snake Plant Laurentii|Dracaena trifasciata|succulent foliage plant
Snake Plant Moonshine|Dracaena trifasciata|succulent foliage plant
Whale Fin Sansevieria|Dracaena masoniana|succulent foliage plant
Bird's Nest Sansevieria|Dracaena trifasciata hahnii|succulent foliage plant
Dieffenbachia Camille|Dieffenbachia seguine|aroid foliage plant
Dieffenbachia Tropic Snow|Dieffenbachia seguine|aroid foliage plant
Chinese Evergreen Silver Bay|Aglaonema commutatum|aroid foliage plant
Chinese Evergreen Red Siam|Aglaonema hybrid|aroid foliage plant
Chinese Evergreen Maria|Aglaonema commutatum|aroid foliage plant
Peace Lily Domino|Spathiphyllum wallisii|flowering aroid
Anthurium Flamingo Flower|Anthurium andraeanum|flowering aroid
Anthurium Clarinervium|Anthurium clarinervium|aroid foliage plant
Arrowhead Vine|Syngonium podophyllum|aroid vine
Syngonium Neon Robusta|Syngonium podophyllum|aroid vine
Alocasia Polly|Alocasia amazonica|aroid foliage plant
Alocasia Frydek|Alocasia micholitziana|aroid foliage plant
Alocasia Regal Shields|Alocasia odora x reginula|aroid foliage plant
Alocasia Silver Dragon|Alocasia baginda|aroid foliage plant
Alocasia Black Velvet|Alocasia reginula|aroid foliage plant
Colocasia Elephant Ear|Colocasia esculenta|aroid foliage plant
Caladium White Christmas|Caladium bicolor|aroid foliage plant
Caladium Red Flash|Caladium bicolor|aroid foliage plant
Fiddle Leaf Fig|Ficus lyrata|ficus tree
Rubber Tree Burgundy|Ficus elastica|ficus tree
Rubber Tree Tineke|Ficus elastica|ficus tree
Weeping Fig|Ficus benjamina|ficus tree
Ficus Audrey|Ficus benghalensis|ficus tree
Ficus Alii|Ficus binnendijkii|ficus tree
Creeping Fig|Ficus pumila|ficus vine
Croton Petra|Codiaeum variegatum|colorful foliage plant
Croton Mammy|Codiaeum variegatum|colorful foliage plant
Dracaena Marginata|Dracaena marginata|cane houseplant
Corn Plant|Dracaena fragrans|cane houseplant
Dracaena Lemon Lime|Dracaena fragrans|cane houseplant
Dracaena Janet Craig|Dracaena fragrans|cane houseplant
Lucky Bamboo|Dracaena sanderiana|cane houseplant
Yucca Cane|Yucca gigantea|cane houseplant
Schefflera Arboricola|Heptapleurum arboricola|umbrella tree
Umbrella Tree|Heptapleurum actinophyllum|umbrella tree
English Ivy|Hedera helix|ivy
Algerian Ivy|Hedera algeriensis|ivy
German Ivy|Delairea odorata|ivy-like vine
String of Pearls|Curio rowleyanus|succulent vine
String of Bananas|Curio radicans|succulent vine
String of Dolphins|Curio peregrinus|succulent vine
Jade Plant|Crassula ovata|succulent
Silver Dollar Jade|Crassula arborescens|succulent
Kalanchoe Flaming Katy|Kalanchoe blossfeldiana|succulent
Mother of Thousands|Kalanchoe daigremontiana|succulent
Pencil Cactus|Euphorbia tirucalli|succulent euphorbia
African Milk Tree|Euphorbia trigona|succulent euphorbia
Crown of Thorns|Euphorbia milii|succulent euphorbia
Desert Rose|Adenium obesum|succulent shrub
Sago Palm|Cycas revoluta|cycad
Cardboard Palm|Zamia furfuracea|cycad
Oleander|Nerium oleander|flowering shrub
Yellow Oleander|Cascabela thevetia|flowering shrub
Foxglove|Digitalis purpurea|flowering plant
Lily of the Valley|Convallaria majalis|flowering groundcover
Easter Lily|Lilium longiflorum|lily
Asiatic Lily|Lilium asiatic hybrids|lily
Tiger Lily|Lilium lancifolium|lily
Daylily|Hemerocallis spp.|flowering perennial
Amaryllis|Hippeastrum spp.|bulb
Daffodil|Narcissus spp.|bulb
Tulip|Tulipa spp.|bulb
Hyacinth|Hyacinthus orientalis|bulb
Autumn Crocus|Colchicum autumnale|bulb
Cyclamen|Cyclamen persicum|flowering plant
Azalea|Rhododendron spp.|flowering shrub
Rhododendron|Rhododendron spp.|flowering shrub
Hydrangea|Hydrangea macrophylla|flowering shrub
Chrysanthemum|Chrysanthemum morifolium|flowering plant
Castor Bean|Ricinus communis|ornamental annual
Jerusalem Cherry|Solanum pseudocapsicum|fruiting ornamental
Nightshade|Solanum spp.|fruiting ornamental
Asparagus Fern|Asparagus setaceus|fern-like houseplant
Plumosa Fern|Asparagus setaceus|fern-like houseplant
Foxtail Fern|Asparagus densiflorus|fern-like houseplant
Bird of Paradise|Strelitzia reginae|tropical foliage plant
Clivia|Clivia miniata|flowering plant
Oxalis Purple Shamrock|Oxalis triangularis|bulbous foliage plant
Ti Plant|Cordyline fruticosa|colorful foliage plant
Moses in the Cradle|Tradescantia spathacea|foliage plant
Inch Plant|Tradescantia zebrina|trailing foliage plant
Purple Heart|Tradescantia pallida|trailing foliage plant
Mandevilla|Mandevilla sanderi|flowering vine
Dipladenia|Mandevilla spp.|flowering vine
Lantana|Lantana camara|flowering plant
Brugmansia Angel's Trumpet|Brugmansia spp.|flowering shrub
Datura Moonflower|Datura inoxia|flowering plant
`),
  ...parseLines("herbs", `
Genovese Basil|Ocimum basilicum|culinary basil
Thai Basil|Ocimum basilicum var. thyrsiflora|culinary basil
Lemon Basil|Ocimum basilicum citriodorum|culinary basil
Lime Basil|Ocimum americanum|culinary basil
Holy Basil|Ocimum tenuiflorum|tea herb
Cinnamon Basil|Ocimum basilicum|culinary basil
Purple Basil|Ocimum basilicum|culinary basil
Greek Columnar Basil|Ocimum basilicum|culinary basil
African Blue Basil|Ocimum kilimandscharicum x basilicum|pollinator herb
Sweet Dani Basil|Ocimum basilicum|culinary basil
Italian Oregano|Origanum vulgare|culinary herb
Greek Oregano|Origanum vulgare hirtum|culinary herb
Mexican Oregano|Lippia graveolens|culinary herb
Golden Oregano|Origanum vulgare aureum|culinary herb
Syrian Oregano|Origanum syriacum|culinary herb
Sweet Marjoram|Origanum majorana|culinary herb
Pot Marjoram|Origanum onites|culinary herb
Common Thyme|Thymus vulgaris|culinary herb
Lemon Thyme|Thymus citriodorus|culinary herb
Orange Thyme|Thymus fragrantissimus|culinary herb
Woolly Thyme|Thymus pseudolanuginosus|groundcover herb
Creeping Thyme|Thymus serpyllum|groundcover herb
Caraway Thyme|Thymus herba-barona|culinary herb
English Thyme|Thymus vulgaris|culinary herb
French Thyme|Thymus vulgaris|culinary herb
Rosemary Tuscan Blue|Salvia rosmarinus|culinary herb
Rosemary Arp|Salvia rosmarinus|culinary herb
Rosemary Prostratus|Salvia rosmarinus|trailing herb
Rosemary Barbecue|Salvia rosmarinus|culinary herb
Common Sage|Salvia officinalis|culinary herb
Purple Sage|Salvia officinalis purpurascens|culinary herb
Golden Sage|Salvia officinalis icterina|culinary herb
Pineapple Sage|Salvia elegans|tea herb
Clary Sage|Salvia sclarea|fragrance herb
Common Mint|Mentha spicata|culinary mint
Peppermint|Mentha x piperita|culinary mint
Chocolate Mint|Mentha x piperita|culinary mint
Apple Mint|Mentha suaveolens|culinary mint
Pineapple Mint|Mentha suaveolens variegata|culinary mint
Mojito Mint|Mentha x villosa|culinary mint
Corsican Mint|Mentha requienii|groundcover herb
Mountain Mint|Pycnanthemum muticum|pollinator herb
Lemon Balm|Melissa officinalis|tea herb
Lime Balm|Melissa officinalis|tea herb
Bee Balm|Monarda didyma|pollinator herb
Wild Bergamot|Monarda fistulosa|pollinator herb
Catnip|Nepeta cataria|tea herb
Catmint|Nepeta faassenii|pollinator herb
German Chamomile|Matricaria chamomilla|tea herb
Roman Chamomile|Chamaemelum nobile|tea herb
Feverfew|Tanacetum parthenium|medicinal herb
Tansy|Tanacetum vulgare|garden utility herb
Yarrow|Achillea millefolium|pollinator herb
Calendula|Calendula officinalis|edible flower herb
Borage|Borago officinalis|edible flower herb
Nasturtium|Tropaeolum majus|edible flower herb
Anise Hyssop|Agastache foeniculum|tea herb
Hyssop|Hyssopus officinalis|culinary herb
Horehound|Marrubium vulgare|tea herb
Lovage|Levisticum officinale|culinary herb
Chervil|Anthriscus cerefolium|culinary herb
Salad Burnet|Sanguisorba minor|culinary herb
French Sorrel|Rumex scutatus|culinary herb
Garden Sorrel|Rumex acetosa|culinary herb
Stevia|Stevia rebaudiana|sweet herb
Shiso|Perilla frutescens|culinary herb
Green Shiso|Perilla frutescens|culinary herb
Red Shiso|Perilla frutescens|culinary herb
Culantro|Eryngium foetidum|culinary herb
Epazote|Dysphania ambrosioides|culinary herb
Papalo|Porophyllum ruderale|culinary herb
Pipicha|Porophyllum tagetoides|culinary herb
Vietnamese Coriander|Persicaria odorata|culinary herb
Vietnamese Balm|Elsholtzia ciliata|culinary herb
Lemongrass|Cymbopogon citratus|culinary herb
Citronella Grass|Cymbopogon nardus|fragrance herb
Bay Laurel|Laurus nobilis|culinary tree herb
Curry Leaf Plant|Murraya koenigii|culinary shrub herb
Makrut Lime Leaf|Citrus hystrix|culinary tree herb
Pandan|Pandanus amaryllifolius|culinary leaf herb
Garlic Chives|Allium tuberosum|culinary herb
Common Chives|Allium schoenoprasum|culinary herb
Society Garlic|Tulbaghia violacea|culinary herb
Welsh Onion|Allium fistulosum|culinary allium
Fennel|Foeniculum vulgare|culinary herb
Bronze Fennel|Foeniculum vulgare purpureum|culinary herb
Dill|Anethum graveolens|culinary herb
Parsley Flat Leaf|Petroselinum crispum|culinary herb
Parsley Curly|Petroselinum crispum|culinary herb
Cilantro|Coriandrum sativum|culinary herb
Cutting Celery|Apium graveolens secalinum|culinary herb
Summer Savory|Satureja hortensis|culinary herb
Winter Savory|Satureja montana|culinary herb
French Tarragon|Artemisia dracunculus|culinary herb
Mexican Tarragon|Tagetes lucida|culinary herb
Lavender English|Lavandula angustifolia|fragrance herb
Lavender Spanish|Lavandula stoechas|fragrance herb
Lavender Grosso|Lavandula x intermedia|fragrance herb
Angelica|Angelica archangelica|culinary herb
Caraway|Carum carvi|seed herb
Cumin|Cuminum cyminum|seed herb
Fenugreek|Trigonella foenum-graecum|seed herb
Ajwain|Trachyspermum ammi|seed herb
Nigella|Nigella sativa|seed herb
Sesame|Sesamum indicum|seed herb
Anise|Pimpinella anisum|seed herb
Licorice|Glycyrrhiza glabra|root herb
Marshmallow|Althaea officinalis|root herb
Comfrey|Symphytum officinale|garden utility herb
Plantain Herb|Plantago major|garden herb
Stinging Nettle|Urtica dioica|garden herb
Hops|Humulus lupulus|brewing herb
Saffron Crocus|Crocus sativus|spice herb
Ginger|Zingiber officinale|rhizome herb
Turmeric|Curcuma longa|rhizome herb
Galangal|Alpinia galanga|rhizome herb
Cardamom|Elettaria cardamomum|spice herb
Horseradish|Armoracia rusticana|root herb
Wasabi|Eutrema japonicum|root herb
Arugula|Eruca vesicaria|peppery herb
Purslane|Portulaca oleracea|edible leaf herb
Good King Henry|Blitum bonus-henricus|perennial green herb
Orach|Atriplex hortensis|edible leaf herb
Mitsuba|Cryptotaenia japonica|culinary herb
Lovage Leaf Celery|Levisticum officinale|culinary herb
`),
  ...parseLines("vegetables", `
Roma Tomato|Solanum lycopersicum|fruiting vegetable
Cherry Tomato|Solanum lycopersicum|fruiting vegetable
Grape Tomato|Solanum lycopersicum|fruiting vegetable
Beefsteak Tomato|Solanum lycopersicum|fruiting vegetable
San Marzano Tomato|Solanum lycopersicum|fruiting vegetable
Brandywine Tomato|Solanum lycopersicum|fruiting vegetable
Cherokee Purple Tomato|Solanum lycopersicum|fruiting vegetable
Sungold Tomato|Solanum lycopersicum|fruiting vegetable
Tomatillo|Physalis philadelphica|fruiting vegetable
Ground Cherry|Physalis pruinosa|fruiting vegetable
Bell Pepper|Capsicum annuum|fruiting vegetable
Jalapeno Pepper|Capsicum annuum|fruiting vegetable
Serrano Pepper|Capsicum annuum|fruiting vegetable
Poblano Pepper|Capsicum annuum|fruiting vegetable
Anaheim Pepper|Capsicum annuum|fruiting vegetable
Habanero Pepper|Capsicum chinense|fruiting vegetable
Thai Chili Pepper|Capsicum annuum|fruiting vegetable
Shishito Pepper|Capsicum annuum|fruiting vegetable
Eggplant Black Beauty|Solanum melongena|fruiting vegetable
Japanese Eggplant|Solanum melongena|fruiting vegetable
Fairy Tale Eggplant|Solanum melongena|fruiting vegetable
Potato Yukon Gold|Solanum tuberosum|root vegetable
Potato Russet|Solanum tuberosum|root vegetable
Sweet Potato|Ipomoea batatas|root vegetable
Yam|Dioscorea spp.|root vegetable
Carrot Nantes|Daucus carota|root vegetable
Carrot Danvers|Daucus carota|root vegetable
Purple Carrot|Daucus carota|root vegetable
Parsnip|Pastinaca sativa|root vegetable
Beet Detroit Dark Red|Beta vulgaris|root vegetable
Golden Beet|Beta vulgaris|root vegetable
Chioggia Beet|Beta vulgaris|root vegetable
Turnip Purple Top|Brassica rapa|root vegetable
Rutabaga|Brassica napus|root vegetable
Radish Cherry Belle|Raphanus sativus|root vegetable
Daikon Radish|Raphanus sativus|root vegetable
Watermelon Radish|Raphanus sativus|root vegetable
Kohlrabi|Brassica oleracea gongylodes|stem vegetable
Celeriac|Apium graveolens rapaceum|root vegetable
Salsify|Tragopogon porrifolius|root vegetable
Scorzonera|Scorzonera hispanica|root vegetable
Jerusalem Artichoke|Helianthus tuberosus|tuber vegetable
Onion Yellow Storage|Allium cepa|allium vegetable
Red Onion|Allium cepa|allium vegetable
White Onion|Allium cepa|allium vegetable
Shallot|Allium cepa aggregatum|allium vegetable
Garlic Hardneck|Allium sativum|allium vegetable
Garlic Softneck|Allium sativum|allium vegetable
Leek|Allium ampeloprasum|allium vegetable
Scallion|Allium fistulosum|allium vegetable
Walking Onion|Allium proliferum|allium vegetable
Elephant Garlic|Allium ampeloprasum|allium vegetable
Broccoli|Brassica oleracea italica|brassica vegetable
Broccolini|Brassica oleracea x Brassica rapa|brassica vegetable
Cauliflower|Brassica oleracea botrytis|brassica vegetable
Romanesco|Brassica oleracea botrytis|brassica vegetable
Cabbage Green|Brassica oleracea capitata|brassica vegetable
Cabbage Red|Brassica oleracea capitata|brassica vegetable
Savoy Cabbage|Brassica oleracea sabauda|brassica vegetable
Brussels Sprouts|Brassica oleracea gemmifera|brassica vegetable
Kale Lacinato|Brassica oleracea acephala|leafy green
Kale Red Russian|Brassica napus pabularia|leafy green
Kale Curly|Brassica oleracea acephala|leafy green
Collard Greens|Brassica oleracea acephala|leafy green
Mustard Greens|Brassica juncea|leafy green
Mizuna|Brassica rapa nipposinica|leafy green
Tatsoi|Brassica rapa narinosa|leafy green
Bok Choy|Brassica rapa chinensis|leafy green
Pak Choi|Brassica rapa chinensis|leafy green
Napa Cabbage|Brassica rapa pekinensis|leafy green
Komatsuna|Brassica rapa perviridis|leafy green
Gai Lan|Brassica oleracea alboglabra|leafy green
Choy Sum|Brassica rapa parachinensis|leafy green
Lettuce Romaine|Lactuca sativa|leafy green
Lettuce Butterhead|Lactuca sativa|leafy green
Lettuce Oakleaf|Lactuca sativa|leafy green
Lettuce Crisphead|Lactuca sativa|leafy green
Spinach|Spinacia oleracea|leafy green
Swiss Chard|Beta vulgaris cicla|leafy green
Malabar Spinach|Basella alba|vining green
New Zealand Spinach|Tetragonia tetragonioides|leafy green
Amaranth Greens|Amaranthus tricolor|leafy green
Endive|Cichorium endivia|leafy green
Escarole|Cichorium endivia|leafy green
Radicchio|Cichorium intybus|leafy green
Frisee|Cichorium endivia|leafy green
Mache|Valerianella locusta|leafy green
Claytonia|Claytonia perfoliata|leafy green
Cucumber Slicing|Cucumis sativus|cucurbit vegetable
Pickling Cucumber|Cucumis sativus|cucurbit vegetable
Lemon Cucumber|Cucumis sativus|cucurbit vegetable
Armenian Cucumber|Cucumis melo flexuosus|cucurbit vegetable
Zucchini|Cucurbita pepo|summer squash
Yellow Crookneck Squash|Cucurbita pepo|summer squash
Pattypan Squash|Cucurbita pepo|summer squash
Butternut Squash|Cucurbita moschata|winter squash
Acorn Squash|Cucurbita pepo|winter squash
Delicata Squash|Cucurbita pepo|winter squash
Spaghetti Squash|Cucurbita pepo|winter squash
Kabocha Squash|Cucurbita maxima|winter squash
Pumpkin Sugar Pie|Cucurbita pepo|winter squash
Pumpkin Jack O Lantern|Cucurbita pepo|winter squash
Bitter Melon|Momordica charantia|cucurbit vegetable
Luffa Gourd|Luffa aegyptiaca|gourd vegetable
Bottle Gourd|Lagenaria siceraria|gourd vegetable
Okra Clemson Spineless|Abelmoschus esculentus|fruiting vegetable
Okra Burgundy|Abelmoschus esculentus|fruiting vegetable
Sweet Corn|Zea mays|grain vegetable
Popcorn|Zea mays everta|grain vegetable
Snap Pea|Pisum sativum|legume vegetable
Snow Pea|Pisum sativum|legume vegetable
Shelling Pea|Pisum sativum|legume vegetable
Green Bean Bush|Phaseolus vulgaris|legume vegetable
Pole Bean|Phaseolus vulgaris|legume vegetable
Runner Bean|Phaseolus coccineus|legume vegetable
Lima Bean|Phaseolus lunatus|legume vegetable
Fava Bean|Vicia faba|legume vegetable
Yardlong Bean|Vigna unguiculata sesquipedalis|legume vegetable
Cowpea|Vigna unguiculata|legume vegetable
Edamame|Glycine max|legume vegetable
Chickpea|Cicer arietinum|legume vegetable
Lentil|Lens culinaris|legume vegetable
Asparagus|Asparagus officinalis|perennial vegetable
Artichoke|Cynara cardunculus scolymus|perennial vegetable
Rhubarb|Rheum rhabarbarum|perennial vegetable
Sea Kale|Crambe maritima|perennial vegetable
Cardoon|Cynara cardunculus|perennial vegetable
Fiddlehead Fern|Matteuccia struthiopteris|perennial vegetable
Watercress|Nasturtium officinale|aquatic vegetable
Lotus Root|Nelumbo nucifera|aquatic vegetable
Taro|Colocasia esculenta|tuber vegetable
Cassava|Manihot esculenta|root vegetable
Jicama|Pachyrhizus erosus|root vegetable
`),
  ...parseLines("fruits", `
Meyer Lemon|Citrus x meyeri|citrus fruit
Eureka Lemon|Citrus limon|citrus fruit
Lisbon Lemon|Citrus limon|citrus fruit
Key Lime|Citrus aurantiifolia|citrus fruit
Persian Lime|Citrus latifolia|citrus fruit
Calamondin Orange|Citrus microcarpa|citrus fruit
Kumquat|Citrus japonica|citrus fruit
Nagami Kumquat|Citrus japonica|citrus fruit
Mandarin Orange|Citrus reticulata|citrus fruit
Clementine|Citrus clementina|citrus fruit
Satsuma Mandarin|Citrus unshiu|citrus fruit
Blood Orange|Citrus sinensis|citrus fruit
Navel Orange|Citrus sinensis|citrus fruit
Grapefruit|Citrus paradisi|citrus fruit
Pomelo|Citrus maxima|citrus fruit
Yuzu|Citrus junos|citrus fruit
Finger Lime|Citrus australasica|citrus fruit
Apple Gala|Malus domestica|tree fruit
Apple Fuji|Malus domestica|tree fruit
Apple Honeycrisp|Malus domestica|tree fruit
Apple Granny Smith|Malus domestica|tree fruit
Apple Golden Delicious|Malus domestica|tree fruit
Apple Pink Lady|Malus domestica|tree fruit
Crabapple|Malus spp.|tree fruit
Pear Bartlett|Pyrus communis|tree fruit
Pear Bosc|Pyrus communis|tree fruit
Pear Anjou|Pyrus communis|tree fruit
Asian Pear|Pyrus pyrifolia|tree fruit
Quince|Cydonia oblonga|tree fruit
Peach Elberta|Prunus persica|stone fruit
Peach Reliance|Prunus persica|stone fruit
Nectarine|Prunus persica nucipersica|stone fruit
Apricot|Prunus armeniaca|stone fruit
Plum Santa Rosa|Prunus salicina|stone fruit
European Plum|Prunus domestica|stone fruit
Damson Plum|Prunus domestica insititia|stone fruit
Sweet Cherry|Prunus avium|stone fruit
Sour Cherry|Prunus cerasus|stone fruit
Nanking Cherry|Prunus tomentosa|shrub fruit
Almond|Prunus dulcis|nut fruit
Blackberry|Rubus fruticosus|berry fruit
Raspberry Red|Rubus idaeus|berry fruit
Raspberry Black|Rubus occidentalis|berry fruit
Raspberry Golden|Rubus idaeus|berry fruit
Boysenberry|Rubus ursinus x idaeus|berry fruit
Loganberry|Rubus x loganobaccus|berry fruit
Marionberry|Rubus ursinus|berry fruit
Dewberry|Rubus flagellaris|berry fruit
Blueberry Highbush|Vaccinium corymbosum|berry fruit
Blueberry Lowbush|Vaccinium angustifolium|berry fruit
Rabbiteye Blueberry|Vaccinium virgatum|berry fruit
Cranberry|Vaccinium macrocarpon|berry fruit
Lingonberry|Vaccinium vitis-idaea|berry fruit
Huckleberry|Vaccinium spp.|berry fruit
Gooseberry|Ribes uva-crispa|berry fruit
Red Currant|Ribes rubrum|berry fruit
Black Currant|Ribes nigrum|berry fruit
White Currant|Ribes rubrum|berry fruit
Jostaberry|Ribes x nidigrolaria|berry fruit
Elderberry|Sambucus canadensis|berry fruit
Aronia Berry|Aronia melanocarpa|berry fruit
Serviceberry|Amelanchier alnifolia|berry fruit
Mulberry|Morus alba|tree fruit
Fig Brown Turkey|Ficus carica|tree fruit
Fig Celeste|Ficus carica|tree fruit
Fig Chicago Hardy|Ficus carica|tree fruit
Pomegranate|Punica granatum|tree fruit
Persimmon American|Diospyros virginiana|tree fruit
Persimmon Asian|Diospyros kaki|tree fruit
Pawpaw|Asimina triloba|tree fruit
Jujube|Ziziphus jujuba|tree fruit
Medlar|Mespilus germanica|tree fruit
Loquat|Eriobotrya japonica|tree fruit
Olive|Olea europaea|tree fruit
Grape Concord|Vitis labrusca|vine fruit
Grape Thompson Seedless|Vitis vinifera|vine fruit
Grape Muscadine|Vitis rotundifolia|vine fruit
Grape Niagara|Vitis labrusca|vine fruit
Kiwi Hardy|Actinidia arguta|vine fruit
Kiwi Fuzzy|Actinidia deliciosa|vine fruit
Passion Fruit|Passiflora edulis|vine fruit
Maypop|Passiflora incarnata|vine fruit
Dragon Fruit|Selenicereus undatus|cactus fruit
Prickly Pear|Opuntia ficus-indica|cactus fruit
Pineapple|Ananas comosus|tropical fruit
Banana Dwarf Cavendish|Musa acuminata|tropical fruit
Plantain|Musa paradisiaca|tropical fruit
Papaya|Carica papaya|tropical fruit
Mango|Mangifera indica|tropical fruit
Avocado|Persea americana|tropical fruit
Guava|Psidium guajava|tropical fruit
Strawberry Guava|Psidium cattleianum|tropical fruit
Pineapple Guava|Acca sellowiana|subtropical fruit
Lychee|Litchi chinensis|tropical fruit
Longan|Dimocarpus longan|tropical fruit
Rambutan|Nephelium lappaceum|tropical fruit
Starfruit|Averrhoa carambola|tropical fruit
Sapodilla|Manilkara zapota|tropical fruit
Canistel|Pouteria campechiana|tropical fruit
Mamey Sapote|Pouteria sapota|tropical fruit
Black Sapote|Diospyros nigra|tropical fruit
Soursop|Annona muricata|tropical fruit
Cherimoya|Annona cherimola|tropical fruit
Sugar Apple|Annona squamosa|tropical fruit
Jackfruit|Artocarpus heterophyllus|tropical fruit
Breadfruit|Artocarpus altilis|tropical fruit
Tamarind|Tamarindus indica|tropical fruit
Date Palm|Phoenix dactylifera|palm fruit
Coffee Plant|Coffea arabica|tropical fruit
Cacao|Theobroma cacao|tropical fruit
Vanilla Orchid|Vanilla planifolia|orchid fruit
Melon Cantaloupe|Cucumis melo|melon fruit
Honeydew Melon|Cucumis melo|melon fruit
Watermelon Crimson Sweet|Citrullus lanatus|melon fruit
Watermelon Sugar Baby|Citrullus lanatus|melon fruit
`),
  ...parseLines("cover-crops", `
Subterranean Clover|Trifolium subterraneum|legume cover crop
Persian Clover|Trifolium resupinatum|legume cover crop
Alsike Clover|Trifolium hybridum|legume cover crop
Balansa Clover|Trifolium michelianum|legume cover crop
Ladino Clover|Trifolium repens|legume cover crop
Kura Clover|Trifolium ambiguum|legume cover crop
Strawberry Clover|Trifolium fragiferum|legume cover crop
Serradella|Ornithopus sativus|legume cover crop
Sainfoin|Onobrychis viciifolia|legume cover crop
Birdsfoot Trefoil|Lotus corniculatus|legume cover crop
Fenugreek Cover Crop|Trigonella foenum-graecum|legume cover crop
Chickling Vetch|Lathyrus sativus|legume cover crop
Hairy Vetch|Vicia villosa|legume cover crop
Purple Vetch|Vicia benghalensis|legume cover crop
Common Vetch|Vicia sativa|legume cover crop
Woollypod Vetch|Vicia villosa dasycarpa|legume cover crop
Austrian Winter Pea|Pisum sativum arvense|legume cover crop
Forage Pea|Pisum sativum arvense|legume cover crop
Field Pea|Pisum sativum arvense|legume cover crop
Cowpea Iron Clay|Vigna unguiculata|warm-season legume cover crop
Cowpea Red Ripper|Vigna unguiculata|warm-season legume cover crop
Sunn Hemp|Crotalaria juncea|warm-season legume cover crop
Sesbania|Sesbania exaltata|warm-season legume cover crop
Lablab Bean|Lablab purpureus|warm-season legume cover crop
Velvet Bean|Mucuna pruriens|warm-season legume cover crop
Soybean Cover Crop|Glycine max|warm-season legume cover crop
Mung Bean Cover Crop|Vigna radiata|warm-season legume cover crop
Adzuki Bean Cover Crop|Vigna angularis|warm-season legume cover crop
Tepary Bean Cover Crop|Phaseolus acutifolius|warm-season legume cover crop
Cereal Rye|Secale cereale|grass cover crop
Winter Wheat|Triticum aestivum|grass cover crop
Spring Wheat|Triticum aestivum|grass cover crop
Winter Barley|Hordeum vulgare|grass cover crop
Spring Barley|Hordeum vulgare|grass cover crop
Triticale|Triticosecale|grass cover crop
Spelt Cover Crop|Triticum spelta|grass cover crop
Emmer Cover Crop|Triticum dicoccum|grass cover crop
Oat Cover Crop|Avena sativa|grass cover crop
Black Oat|Avena strigosa|grass cover crop
Annual Ryegrass|Lolium multiflorum|grass cover crop
Perennial Ryegrass|Lolium perenne|grass cover crop
Italian Ryegrass|Lolium multiflorum|grass cover crop
Orchardgrass|Dactylis glomerata|grass cover crop
Timothy Grass|Phleum pratense|grass cover crop
Tall Fescue|Festuca arundinacea|grass cover crop
Meadow Fescue|Festuca pratensis|grass cover crop
Festulolium|Festulolium spp.|grass cover crop
Sudangrass|Sorghum bicolor sudanense|warm-season grass cover crop
Sorghum-Sudangrass|Sorghum bicolor x drummondii|warm-season grass cover crop
Forage Sorghum|Sorghum bicolor|warm-season grass cover crop
Pearl Millet|Pennisetum glaucum|warm-season grass cover crop
Japanese Millet|Echinochloa esculenta|warm-season grass cover crop
Browntop Millet|Urochloa ramosa|warm-season grass cover crop
Foxtail Millet|Setaria italica|warm-season grass cover crop
Proso Millet|Panicum miliaceum|warm-season grass cover crop
Teff|Eragrostis tef|warm-season grass cover crop
Corn Cover Crop|Zea mays|warm-season grass cover crop
Forage Radish|Raphanus sativus|brassica cover crop
Daikon Tillage Radish|Raphanus sativus|brassica cover crop
Oilseed Radish|Raphanus sativus oleiformis|brassica cover crop
Mustard Cover Crop|Brassica juncea|brassica cover crop
White Mustard|Sinapis alba|brassica cover crop
Brown Mustard|Brassica juncea|brassica cover crop
Yellow Mustard|Sinapis alba|brassica cover crop
Rapeseed|Brassica napus|brassica cover crop
Canola Cover Crop|Brassica napus|brassica cover crop
Turnip Cover Crop|Brassica rapa|brassica cover crop
Forage Turnip|Brassica rapa|brassica cover crop
Kale Cover Crop|Brassica oleracea|brassica cover crop
Collard Cover Crop|Brassica oleracea|brassica cover crop
Arugula Cover Crop|Eruca sativa|brassica cover crop
Phacelia|Phacelia tanacetifolia|pollinator cover crop
Calendula Cover Crop|Calendula officinalis|pollinator cover crop
Bachelor Button Cover Crop|Centaurea cyanus|pollinator cover crop
Cosmos Cover Crop|Cosmos bipinnatus|pollinator cover crop
Zinnia Cover Crop|Zinnia elegans|pollinator cover crop
Sunflower Cover Crop|Helianthus annuus|broadleaf cover crop
Safflower Cover Crop|Carthamus tinctorius|broadleaf cover crop
Flax Cover Crop|Linum usitatissimum|broadleaf cover crop
Sesame Cover Crop|Sesamum indicum|broadleaf cover crop
Amaranth Cover Crop|Amaranthus spp.|broadleaf cover crop
Quinoa Cover Crop|Chenopodium quinoa|broadleaf cover crop
Chia Cover Crop|Salvia hispanica|broadleaf cover crop
Camelina|Camelina sativa|broadleaf cover crop
Niger Seed|Guizotia abyssinica|broadleaf cover crop
Plantain Cover Crop|Plantago lanceolata|forage cover crop
Chicory Cover Crop|Cichorium intybus|deep-rooted cover crop
Forage Chicory|Cichorium intybus|deep-rooted cover crop
Burnet Cover Crop|Sanguisorba minor|forage cover crop
Yarrow Cover Crop|Achillea millefolium|pollinator cover crop
Warm Season Soil Builder Mix|Mixed species planting|cover crop mix
Cool Season Soil Builder Mix|Mixed species planting|cover crop mix
No-Till Garden Mix|Mixed species planting|cover crop mix
Raised Bed Winter Mix|Mixed species planting|cover crop mix
Raised Bed Summer Mix|Mixed species planting|cover crop mix
Container Soil Refresh Mix|Mixed species planting|cover crop mix
Orchard Pollinator Mix|Mixed species planting|cover crop mix
Vegetable Bed Rotation Mix|Mixed species planting|cover crop mix
Clay Soil Breaker Mix|Mixed species planting|cover crop mix
Sandy Soil Builder Mix|Mixed species planting|cover crop mix
`),
  ...parseLines("pet-friendly", `
Japanese Holly Fern|Cyrtomium falcatum|fern
Silver Lace Fern|Pteris ensiformis|fern
Variegated Brake Fern|Pteris cretica|fern
Fluffy Ruffle Fern|Nephrolepis exaltata|fern
Green Fantasy Fern|Nephrolepis exaltata|fern
Rabbit's Foot Fern|Davallia fejeensis|fern
Squirrel's Foot Fern|Davallia trichomanoides|fern
Peperomia Rana Verde|Peperomia albovittata|peperomia
Peperomia Red Edge|Peperomia clusiifolia|peperomia
Peperomia Golden Gate|Peperomia obtusifolia|peperomia
Peperomia Jelly|Peperomia clusiifolia|peperomia
Peperomia Marble|Peperomia obtusifolia|peperomia
Peperomia Variegated Cupid|Peperomia scandens|trailing peperomia
Calathea Jungle Rose|Goeppertia roseopicta|prayer plant
Calathea Royal Standard|Goeppertia roseopicta|prayer plant
Calathea Crimson|Goeppertia roseopicta|prayer plant
Calathea Corona|Goeppertia roseopicta|prayer plant
Calathea Green Goddess|Goeppertia louisae|prayer plant
Calathea Silver Plate|Goeppertia roseopicta|prayer plant
Maranta Black Prayer Plant|Maranta leuconeura|prayer plant
Maranta Green Prayer Plant|Maranta leuconeura|prayer plant
Maranta Variegata|Maranta leuconeura|prayer plant
Hoya Retusa|Hoya retusa|hoya
Hoya Serpens|Hoya serpens|hoya
Hoya Polyneura|Hoya polyneura|hoya
Hoya Krohniana|Hoya krohniana|hoya
Hoya Macrophylla|Hoya latifolia|hoya
Hoya Finlaysonii|Hoya finlaysonii|hoya
Hoya Chelsea|Hoya carnosa|hoya
Dischidia Million Hearts|Dischidia ruscifolia|trailing plant
Dischidia Watermelon|Dischidia ovata|trailing plant
Dischidia Nummularia|Dischidia nummularia|trailing plant
Lepismium Cruciforme|Lepismium cruciforme|jungle cactus
Rhipsalis Paradoxa|Rhipsalis paradoxa|jungle cactus
Rhipsalis Pilocarpa|Rhipsalis pilocarpa|jungle cactus
Hatiora Salicornioides|Hatiora salicornioides|jungle cactus
Echeveria Black Prince|Echeveria 'Black Prince'|succulent
Echeveria Blue Atoll|Echeveria 'Blue Atoll'|succulent
Echeveria Topsy Turvy|Echeveria runyonii|succulent
Sedum Burrito|Sedum morganianum|succulent
Sedum Little Missy|Sedum lineare|succulent
Graptopetalum Ghost Plant|Graptopetalum paraguayense|succulent
Pachyphytum Moonstones|Pachyphytum oviferum|succulent
Aeonium Kiwi|Aeonium haworthii|succulent
Parlor Palm Bella|Chamaedorea elegans|palm
Metallica Palm|Chamaedorea metallica|palm
Reed Palm|Chamaedorea seifrizii|palm
`),
  ...parseLines("toxic", `
Aconite|Aconitum napellus|toxic perennial
Monkshood|Aconitum spp.|toxic perennial
Delphinium|Delphinium spp.|toxic perennial
Larkspur|Consolida ajacis|toxic annual
Hellebore|Helleborus orientalis|toxic perennial
Christmas Rose|Helleborus niger|toxic perennial
Iris|Iris germanica|toxic rhizome plant
Dutch Iris|Iris x hollandica|toxic bulb
Wisteria|Wisteria sinensis|toxic vine
Japanese Wisteria|Wisteria floribunda|toxic vine
Yew|Taxus baccata|toxic evergreen
Japanese Yew|Taxus cuspidata|toxic evergreen
Boxwood|Buxus sempervirens|toxic shrub
Privet|Ligustrum vulgare|toxic shrub
Lily Magnolia|Magnolia liliiflora|ornamental shrub
Virginia Creeper|Parthenocissus quinquefolia|ornamental vine
Boston Ivy|Parthenocissus tricuspidata|ornamental vine
Morning Glory|Ipomoea purpurea|toxic vine
Moonflower Vine|Ipomoea alba|toxic vine
Sweet Pea|Lathyrus odoratus|toxic vine
Bleeding Heart|Lamprocapnos spectabilis|toxic perennial
Calla Lily|Zantedeschia aethiopica|toxic aroid
Arum Lily|Zantedeschia spp.|toxic aroid
Jack-in-the-Pulpit|Arisaema triphyllum|toxic aroid
Skunk Cabbage|Symplocarpus foetidus|toxic aroid
Mayapple|Podophyllum peltatum|toxic perennial
Pokeweed|Phytolacca americana|toxic perennial
Jimsonweed|Datura stramonium|toxic annual
Castor Oil Plant|Ricinus communis|toxic annual
Rosary Pea|Abrus precatorius|toxic vine
Coral Bean|Erythrina herbacea|toxic shrub
Carolina Jessamine|Gelsemium sempervirens|toxic vine
Autumn Olive|Elaeagnus umbellata|shrub
Snowdrop|Galanthus nivalis|toxic bulb
Glory-of-the-Snow|Chionodoxa luciliae|toxic bulb
Star of Bethlehem|Ornithogalum umbellatum|toxic bulb
Crocus Spring|Crocus vernus|bulb
Bluebell|Hyacinthoides non-scripta|toxic bulb
Gladiolus|Gladiolus spp.|toxic bulb
Ranunculus|Ranunculus asiaticus|toxic flowering plant
Buttercup|Ranunculus spp.|toxic flowering plant
Anemone|Anemone coronaria|toxic flowering plant
Poinsettia|Euphorbia pulcherrima|irritating euphorbia
Snow-on-the-Mountain|Euphorbia marginata|irritating euphorbia
Spurge|Euphorbia spp.|irritating euphorbia
Flapjack Kalanchoe|Kalanchoe luciae|succulent
Panda Plant|Kalanchoe tomentosa|succulent
String of Tears|Curio herreianus|succulent vine
Blue Chalk Sticks|Curio repens|succulent
Aeonium Black Rose|Aeonium arboreum|succulent
Aloe Aristata|Aristaloe aristata|succulent
Aloe Lace|Aristaloe aristata|succulent
Silver Squill|Ledebouria socialis|bulb
Pregnant Onion|Albuca bracteata|bulb
Climbing Onion|Bowiea volubilis|bulb
Madagascar Palm|Pachypodium lamerei|succulent tree
Plumeria|Plumeria rubra|tropical tree
Frangipani|Plumeria spp.|tropical tree
`),
  ...parseLines("herbs", `
Micro Basil|Ocimum basilicum|micro herb
Micro Cilantro|Coriandrum sativum|micro herb
Micro Dill|Anethum graveolens|micro herb
Micro Parsley|Petroselinum crispum|micro herb
Micro Chives|Allium schoenoprasum|micro herb
Micro Arugula|Eruca vesicaria|micro herb
Micro Shiso|Perilla frutescens|micro herb
Micro Sorrel|Rumex acetosa|micro herb
Lemon Verbena|Aloysia citrodora|tea herb
Lemon Myrtle|Backhousia citriodora|tea herb
Lemon Grass East Indian|Cymbopogon flexuosus|culinary herb
Mexican Mint Marigold|Tagetes lucida|culinary herb
Costmary|Tanacetum balsamita|tea herb
Southernwood|Artemisia abrotanum|fragrance herb
Mugwort|Artemisia vulgaris|garden herb
Wormwood|Artemisia absinthium|garden herb
Rue|Ruta graveolens|garden herb
Skullcap|Scutellaria lateriflora|tea herb
Tulsi Kapoor|Ocimum tenuiflorum|tea herb
Tulsi Rama|Ocimum tenuiflorum|tea herb
Tulsi Krishna|Ocimum tenuiflorum|tea herb
Anise Basil|Ocimum basilicum|culinary basil
Cardoon Herb|Cynara cardunculus|culinary herb
Vietnamese Fish Mint|Houttuynia cordata|culinary herb
Chinese Celery|Apium graveolens|culinary herb
Mitsuba Purple|Cryptotaenia japonica|culinary herb
Garland Chrysanthemum|Glebionis coronaria|culinary herb
Edible Chrysanthemum Greens|Glebionis coronaria|culinary herb
Rau Om|Limnophila aromatica|culinary herb
Rice Paddy Herb|Limnophila aromatica|culinary herb
Ngo Gai|Eryngium foetidum|culinary herb
Yerba Buena|Clinopodium douglasii|tea herb
Yerba Mate|Ilex paraguariensis|tea herb
Guayusa|Ilex guayusa|tea herb
Roselle|Hibiscus sabdariffa|tea herb
Hibiscus Tea Plant|Hibiscus sabdariffa|tea herb
Scented Geranium Rose|Pelargonium graveolens|fragrance herb
Scented Geranium Lemon|Pelargonium crispum|fragrance herb
Scented Geranium Mint|Pelargonium tomentosum|fragrance herb
Scented Geranium Nutmeg|Pelargonium fragrans|fragrance herb
Spilanthes|Acmella oleracea|edible flower herb
Toothache Plant|Acmella oleracea|edible flower herb
Moringa Leaf|Moringa oleifera|culinary leaf herb
Curry Plant|Helichrysum italicum|fragrance herb
Szechuan Pepper Leaf|Zanthoxylum simulans|culinary herb
Sansho Leaf|Zanthoxylum piperitum|culinary herb
Sweet Woodruff|Galium odoratum|fragrance herb
Meadowsweet|Filipendula ulmaria|tea herb
`),
  ...parseLines("vegetables", `
Chinese Broccoli|Brassica oleracea alboglabra|leafy green
Yu Choy|Brassica rapa parachinensis|leafy green
Tokyo Bekana|Brassica rapa chinensis|leafy green
Hon Tsai Tai|Brassica rapa chinensis|leafy green
Chinese Mustard|Brassica juncea|leafy green
Red Mustard|Brassica juncea|leafy green
Green Tatsoi|Brassica rapa narinosa|leafy green
Purple Mizuna|Brassica rapa nipposinica|leafy green
Water Spinach|Ipomoea aquatica|leafy green
Sweet Potato Greens|Ipomoea batatas|leafy green
Pumpkin Shoots|Cucurbita spp.|edible shoot vegetable
Pea Shoots|Pisum sativum|edible shoot vegetable
Sunflower Shoots|Helianthus annuus|edible shoot vegetable
Broccoli Raab|Brassica rapa ruvo|brassica vegetable
Rapini|Brassica rapa ruvo|brassica vegetable
Spigariello|Brassica oleracea acephala|leafy green
Tree Collards|Brassica oleracea|perennial leafy green
Walking Stick Kale|Brassica oleracea longata|leafy green
Perpetual Spinach|Beta vulgaris cicla|leafy green
Egyptian Spinach|Corchorus olitorius|leafy green
Molokhia|Corchorus olitorius|leafy green
Tinda|Praecitrullus fistulosus|cucurbit vegetable
Ivy Gourd|Coccinia grandis|cucurbit vegetable
Snake Gourd|Trichosanthes cucumerina|gourd vegetable
Wax Gourd|Benincasa hispida|gourd vegetable
Chayote|Sechium edule|cucurbit vegetable
Tromboncino Squash|Cucurbita moschata|summer squash
Rampicante Squash|Cucurbita moschata|summer squash
Tatume Squash|Cucurbita pepo|summer squash
Seminole Pumpkin|Cucurbita moschata|winter squash
Honeynut Squash|Cucurbita moschata|winter squash
Candy Roaster Squash|Cucurbita maxima|winter squash
Oca|Oxalis tuberosa|tuber vegetable
Ulluco|Ullucus tuberosus|tuber vegetable
Mashua|Tropaeolum tuberosum|tuber vegetable
Yacon|Smallanthus sonchifolius|root vegetable
Skirret|Sium sisarum|root vegetable
Hamburg Parsley|Petroselinum crispum tuberosum|root vegetable
Parsley Root|Petroselinum crispum tuberosum|root vegetable
Belgian Endive|Cichorium intybus|leafy vegetable
Chinese Artichoke|Stachys affinis|tuber vegetable
Winged Bean|Psophocarpus tetragonolobus|legume vegetable
Hyacinth Bean|Lablab purpureus|legume vegetable
Scarlet Runner Bean|Phaseolus coccineus|legume vegetable
Tepary Bean|Phaseolus acutifolius|legume vegetable
Moth Bean|Vigna aconitifolia|legume vegetable
Urad Bean|Vigna mungo|legume vegetable
Mung Bean|Vigna radiata|legume vegetable
Adzuki Bean|Vigna angularis|legume vegetable
`),
  ...parseLines("fruits", `
Alpine Strawberry|Fragaria vesca|berry fruit
Mara des Bois Strawberry|Fragaria x ananassa|berry fruit
June-Bearing Strawberry|Fragaria x ananassa|berry fruit
Everbearing Strawberry|Fragaria x ananassa|berry fruit
Day-Neutral Strawberry|Fragaria x ananassa|berry fruit
Pink Lemonade Blueberry|Vaccinium corymbosum|berry fruit
Sunshine Blue Blueberry|Vaccinium corymbosum|berry fruit
Top Hat Blueberry|Vaccinium corymbosum|container berry fruit
Dwarf Mulberry|Morus nigra|container fruit
Dwarf Pomegranate|Punica granatum nana|container fruit
Dwarf Banana|Musa acuminata|container fruit
Dwarf Peach|Prunus persica|container fruit
Dwarf Nectarine|Prunus persica nucipersica|container fruit
Dwarf Fig|Ficus carica|container fruit
Dwarf Meyer Lemon|Citrus x meyeri|container citrus
Bearss Lime|Citrus latifolia|citrus fruit
Moro Blood Orange|Citrus sinensis|citrus fruit
Cara Cara Orange|Citrus sinensis|citrus fruit
Tangelo|Citrus x tangelo|citrus fruit
Ugli Fruit|Citrus reticulata x paradisi|citrus fruit
Rangpur Lime|Citrus limonia|citrus fruit
Sudachi|Citrus sudachi|citrus fruit
Kaffir Lime Fruit|Citrus hystrix|citrus fruit
Miracle Fruit|Synsepalum dulcificum|tropical fruit
Barbados Cherry|Malpighia emarginata|tropical fruit
Surinam Cherry|Eugenia uniflora|tropical fruit
Pitanga|Eugenia uniflora|tropical fruit
Jaboticaba|Plinia cauliflora|tropical fruit
Grumichama|Eugenia brasiliensis|tropical fruit
Feijoa|Acca sellowiana|subtropical fruit
Che Fruit|Maclura tricuspidata|tree fruit
Cornelian Cherry|Cornus mas|tree fruit
Sea Buckthorn|Hippophae rhamnoides|berry fruit
Honeyberry|Lonicera caerulea|berry fruit
Haskap Berry|Lonicera caerulea|berry fruit
Goji Berry|Lycium barbarum|berry fruit
Hardy Orange|Poncirus trifoliata|citrus relative
Currant Tomato|Solanum pimpinellifolium|small fruiting plant
Cape Gooseberry|Physalis peruviana|small fruiting plant
Naranjilla|Solanum quitoense|tropical fruit
Tamarillo|Solanum betaceum|tropical fruit
Pepino Melon|Solanum muricatum|tropical fruit
Melon Charentais|Cucumis melo|melon fruit
Canary Melon|Cucumis melo|melon fruit
Casaba Melon|Cucumis melo|melon fruit
Crenshaw Melon|Cucumis melo|melon fruit
Santa Claus Melon|Cucumis melo|melon fruit
Galia Melon|Cucumis melo|melon fruit
Asian Melon|Cucumis melo|melon fruit
Horned Melon|Cucumis metuliferus|melon fruit
`),
  ...parseLines("cover-crops", `
Frosty Berseem Clover|Trifolium alexandrinum|legume cover crop
Fixation Balansa Clover|Trifolium michelianum|legume cover crop
Mammoth Red Clover|Trifolium pratense|legume cover crop
Medium Red Clover|Trifolium pratense|legume cover crop
Dutch White Clover|Trifolium repens|legume cover crop
New Zealand White Clover|Trifolium repens|legume cover crop
Yellow Sweet Clover|Melilotus officinalis|legume cover crop
White Sweet Clover|Melilotus albus|legume cover crop
Medic Black|Medicago lupulina|legume cover crop
Bur Medic|Medicago polymorpha|legume cover crop
Alfalfa Cover Crop|Medicago sativa|legume cover crop
Lupine Cover Crop|Lupinus spp.|legume cover crop
Blue Lupine|Lupinus angustifolius|legume cover crop
White Lupine|Lupinus albus|legume cover crop
Pharaoh Pea|Pisum sativum arvense|legume cover crop
Maple Pea|Pisum sativum arvense|legume cover crop
Bell Bean|Vicia faba|legume cover crop
Horse Bean|Vicia faba|legume cover crop
Milky Oat|Avena sativa|grass cover crop
Hulless Oat|Avena nuda|grass cover crop
Forage Oat|Avena sativa|grass cover crop
Winter Hardy Oat|Avena sativa|grass cover crop
Ryegrass Tetraploid|Lolium multiflorum|grass cover crop
Ryegrass Diploid|Lolium multiflorum|grass cover crop
Hybrid Ryegrass|Lolium hybridum|grass cover crop
Creeping Red Fescue|Festuca rubra|grass cover crop
Chewings Fescue|Festuca rubra commutata|grass cover crop
Hard Fescue|Festuca brevipila|grass cover crop
Blue Grama|Bouteloua gracilis|grass cover crop
Buffalograss|Bouteloua dactyloides|grass cover crop
Switchgrass|Panicum virgatum|grass cover crop
Big Bluestem|Andropogon gerardii|grass cover crop
Little Bluestem|Schizachyrium scoparium|grass cover crop
Indiangrass|Sorghastrum nutans|grass cover crop
Forage Collards|Brassica oleracea|brassica cover crop
Graza Radish|Raphanus sativus|brassica cover crop
Groundhog Radish|Raphanus sativus|brassica cover crop
Daikon Nitro Radish|Raphanus sativus|brassica cover crop
Pacific Gold Mustard|Brassica juncea|brassica cover crop
Ida Gold Mustard|Sinapis alba|brassica cover crop
Caliente Mustard|Brassica juncea|brassica cover crop
Forage Rape|Brassica napus|brassica cover crop
Hunter Brassica|Brassica rapa|brassica cover crop
Seven Top Turnip|Brassica rapa|brassica cover crop
Pollinator Buckwheat Mix|Mixed species planting|cover crop mix
Beneficial Insect Mix|Mixed species planting|cover crop mix
Quick Green Manure Mix|Mixed species planting|cover crop mix
Biofumigation Mix|Mixed species planting|cover crop mix
Nitrogen Builder Mix|Mixed species planting|cover crop mix
Winterkill Mulch Mix|Mixed species planting|cover crop mix
Living Pathway Mix|Mixed species planting|cover crop mix
Greenhouse Bench Cover Mix|Mixed species planting|cover crop mix
Microgreen Soil Recovery Mix|Mixed species planting|cover crop mix
Perennial Alley Mix|Mixed species planting|cover crop mix
`),
  ...parseLines("herbs", `
Black Cumin|Nigella sativa|seed herb
Mexican Coriander|Eryngium foetidum|culinary herb
Hoja Santa|Piper auritum|culinary herb
Kinh Gioi|Elsholtzia ciliata|culinary herb
Sweet Cicely|Myrrhis odorata|culinary herb
Alexanders|Smyrnium olusatrum|culinary herb
`),
  ...parseLines("fruits", `
Asian Persimmon Fuyu|Diospyros kaki|tree fruit
Asian Persimmon Hachiya|Diospyros kaki|tree fruit
American Plum|Prunus americana|stone fruit
Beach Plum|Prunus maritima|stone fruit
Sand Cherry|Prunus pumila|shrub fruit
Buffaloberry|Shepherdia argentea|berry fruit
Nannyberry|Viburnum lentago|native fruit
Highbush Cranberry|Viburnum trilobum|native fruit
Oregon Grape|Mahonia aquifolium|berry fruit
Medlar Nottingham|Mespilus germanica|tree fruit
Hardy Fig Olympian|Ficus carica|tree fruit
Pakistan Mulberry|Morus macroura|tree fruit
White Mulberry|Morus alba|tree fruit
Black Mulberry|Morus nigra|tree fruit
Red Mulberry|Morus rubra|tree fruit
`),
  ...parseLines("cover-crops", `
Early Spring Nectar Mix|Mixed species planting|cover crop mix
Late Summer Gap Mix|Mixed species planting|cover crop mix
Pollinator Orchard Alley Mix|Mixed species planting|cover crop mix
`),
];

module.exports = { supplementalPlants };
