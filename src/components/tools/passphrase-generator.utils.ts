// Diceware-style passphrase generation using a sizeable embedded wordlist and
// cryptographically-strong randomness for every choice (word picks, number,
// separator selection).

// Diceware-style wordlist derived from the EFF large wordlist
// (https://www.eff.org/dice). Filtered to 2048 short, lowercase a-z words
// (3-7 chars) — a solid subset of the full 7776-word list, kept compact for
// bundle size. log2(2048) ~= 11.0 bits per word.
export const DICEWARE_WORDS: readonly string[] = [
  "abacus", "abdomen", "abide", "abiding", "ability", "ablaze", "able", "abreast", "abridge", "abroad", "absence", "absolve",
  "abstain", "absurd", "accent", "acclaim", "account", "acetone", "aching", "acid", "acorn", "acquire", "acre", "acrobat",
  "acronym", "acting", "action", "active", "actress", "acts", "acutely", "aerosol", "afar", "affair", "affirm", "affix",
  "afford", "affront", "aflame", "afloat", "afoot", "afraid", "aged", "ageless", "agency", "agenda", "agent", "aghast",
  "agile", "agility", "aging", "agonize", "agony", "agreed", "aground", "ahead", "ahoy", "aide", "aids", "aim",
  "ajar", "alarm", "album", "alfalfa", "algebra", "alias", "alibi", "aliens", "alike", "alive", "almanac", "almost",
  "aloe", "aloft", "aloha", "alone", "aloof", "alright", "alto", "alumni", "always", "amaze", "amber", "ambush",
  "amends", "amenity", "amiable", "amid", "amigo", "amino", "amiss", "ammonia", "amnesty", "among", "amount", "ample",
  "amplify", "amply", "amuck", "amulet", "amused", "amuser", "amusing", "anagram", "anatomy", "anchor", "anchovy", "ancient",
  "android", "anemia", "anemic", "anew", "angelic", "anger", "angled", "angler", "angles", "angling", "angrily", "angular",
  "animal", "animate", "anime", "ankle", "annex", "annuity", "another", "antacid", "anthem", "anthill", "antics", "antler",
  "antonym", "antsy", "anvil", "anybody", "anyhow", "anymore", "anyone", "anytime", "anyway", "aorta", "apache", "apostle",
  "appear", "appease", "applaud", "apple", "applied", "apply", "approve", "apricot", "april", "apron", "aptly", "aqua",
  "area", "arena", "argue", "arise", "armband", "armed", "armful", "armhole", "arming", "armless", "armoire", "armored",
  "armory", "armrest", "army", "aroma", "arose", "around", "arousal", "arrange", "array", "arrest", "arrival", "arrive",
  "arson", "art", "ascend", "ascent", "ashamed", "ashen", "ashes", "ashy", "aside", "askew", "asleep", "aspect",
  "aspire", "aspirin", "astound", "astride", "astute", "atlas", "atom", "atop", "atrium", "atrophy", "attach", "attain",
  "attempt", "attest", "attic", "attire", "auction", "audible", "audibly", "audio", "august", "author", "autism", "avatar",
  "avenge", "avenue", "average", "avert", "aviator", "avid", "avoid", "await", "awaken", "award", "aware", "awhile",
  "awkward", "awning", "awoke", "awry", "axis", "babble", "babied", "baboon", "backed", "backer", "backing", "backlit",
  "backlog", "backup", "bacon", "badass", "badge", "badland", "badly", "badness", "baffle", "bagel", "bagful", "baggage",
  "bagged", "baggie", "bagging", "baggy", "bagpipe", "baked", "bakery", "baking", "balance", "balcony", "balmy", "bamboo",
  "banana", "banish", "banjo", "banked", "banker", "banking", "banner", "banshee", "banter", "barbed", "barbell", "barber",
  "barcode", "barge", "barista", "barley", "barmaid", "barman", "barn", "barrack", "barrel", "barrier", "bash", "basics",
  "basil", "basin", "basis", "basket", "batboy", "batch", "bath", "baton", "bats", "battery", "batting", "battle",
  "bauble", "bazooka", "blabber", "bladder", "blade", "blah", "blame", "blaming", "blank", "blast", "blazer", "blazing",
  "bleach", "bleak", "bleep", "blemish", "blend", "bless", "blimp", "bling", "blinked", "blinker", "blinks", "blip",
  "blitz", "bloated", "blob", "blog", "blooper", "blot", "blouse", "blubber", "bluff", "bluish", "blunt", "blurb",
  "blurred", "blurry", "blurt", "blush", "boaster", "boat", "bobbed", "bobbing", "bobble", "bobcat", "bobsled", "bobtail",
  "body", "bogged", "boggle", "bogus", "boil", "bok", "bolster", "bolt", "bonanza", "bonded", "bonding", "boned",
  "boney", "bonfire", "bonnet", "bonsai", "bonus", "bony", "book", "booted", "booth", "bootie", "booting", "bootleg",
  "boots", "boozy", "borax", "boring", "borough", "boss", "botany", "botch", "both", "bottle", "bottom", "bounce",
  "bouncy", "bovine", "boxcar", "boxer", "boxing", "boxlike", "boxy", "breach", "breath", "breeder", "breeze", "breezy",
  "brewery", "brewing", "briar", "bribe", "brick", "bride", "bridged", "brigade", "bright", "brim", "bring", "brink",
  "brisket", "briskly", "bristle", "brittle", "broaden", "broadly", "broiler", "broken", "broker", "bronco", "bronze", "brook",
  "broom", "brought", "browse", "brunch", "brunt", "brush", "brute", "bubble", "bubbly", "bucked", "bucket", "buckle",
  "budding", "buddy", "budget", "buffalo", "buffed", "buffer", "buffing", "buffoon", "buggy", "bulb", "bulge", "bulgur",
  "bulk", "bulldog", "bullion", "bullish", "bullpen", "bully", "bunch", "bundle", "bungee", "bunion", "bunkbed", "bunny",
  "bunt", "busboy", "bush", "busily", "busload", "bust", "buzz", "cabana", "cabbage", "cabbie", "cable", "caboose",
  "cache", "cackle", "cacti", "cactus", "caddie", "caddy", "cadet", "cadmium", "cage", "cahoots", "cake", "calcium",
  "caliber", "calm", "caloric", "calorie", "calzone", "cameo", "camera", "camper", "camping", "campus", "canal", "canary",
  "cancel", "candied", "candle", "candy", "cane", "canine", "canned", "canning", "cannon", "cannot", "canola", "canon",
  "canopy", "canteen", "canyon", "capable", "capably", "cape", "capital", "capitol", "capped", "capsize", "capsule", "caption",
  "captive", "capture", "caramel", "carat", "caravan", "carbon", "carded", "cardiac", "caress", "cargo", "caring", "carless",
  "carload", "carnage", "carol", "carpool", "carport", "carried", "carrot", "carry", "cartel", "carton", "cartoon", "carve",
  "carving", "carwash", "cascade", "case", "cash", "casing", "casino", "casket", "catalog", "catcall", "catcher", "catchy",
  "caterer", "catfish", "catlike", "catnap", "catnip", "catsup", "cattail", "cattle", "catty", "catwalk", "caucus", "causal",
  "cause", "causing", "caution", "cavalry", "caviar", "cavity", "cedar", "celery", "celtic", "cement", "census", "certify",
  "chafe", "chain", "chair", "chalice", "chamber", "chance", "change", "channel", "chant", "chaos", "chapped", "chaps",
  "chapter", "charger", "chariot", "charity", "charm", "charred", "charter", "chase", "chasing", "chaste", "chatter", "chatty",
  "cheddar", "cheek", "cheer", "cheese", "cheesy", "chef", "chemist", "chemo", "cherub", "chess", "chest", "chevron",
  "chevy", "chewer", "chewing", "chewy", "chief", "chili", "chill", "chimp", "chip", "chirpy", "chive", "choice",
  "choking", "chomp", "chooser", "choosy", "chop", "chosen", "chowder", "chrome", "chubby", "chuck", "chug", "chummy",
  "chump", "chunk", "churn", "chute", "cider", "cinch", "cinema", "circle", "circus", "citable", "citadel", "citizen",
  "citric", "citrus", "city", "civic", "civil", "clad", "claim", "clammy", "clamor", "clamp", "clang", "clapped",
  "clapper", "clarify", "clarity", "clash", "clasp", "class", "clatter", "clause", "claw", "clay", "clean", "clear",
  "cleat", "cleaver", "cleft", "clench", "clerk", "clever", "clicker", "client", "climate", "cling", "clinic", "clip",
  "clique", "cloak", "clobber", "clock", "clone", "cloning", "closure", "clothes", "cloud", "clover", "clubbed", "clump",
  "clumsy", "clunky", "clutch", "clutter", "coach", "coastal", "coaster", "coat", "cobalt", "cobbler", "cobweb", "cocoa",
  "coconut", "cod", "coerce", "coexist", "coffee", "coil", "coke", "cola", "cold", "collage", "collar", "collide",
  "collie", "colony", "colt", "coma", "come", "comfort", "comfy", "comic", "coming", "comma", "commend", "comment",
  "commode", "common", "commute", "company", "compare", "compel", "compile", "comply", "compost", "comrade", "concave", "conceal",
  "concept", "concert", "conch", "concise", "concur", "condone", "conduit", "cone", "confess", "confirm", "conform", "conical",
  "conjure", "consent", "console", "consult", "contact", "contend", "contest", "context", "contort", "contour", "control", "convene",
  "convent", "cope", "copied", "copier", "copilot", "coping", "copious", "copper", "copy", "coral", "cork", "corncob",
  "cornea", "corned", "corner", "corny", "coroner", "corral", "correct", "corrode", "corsage", "corset", "cortex", "cosmic",
  "cosmos", "cost", "cottage", "cotton", "couch", "cough", "could", "country", "county", "courier", "cover", "coveted",
  "coyness", "cozily", "cozy", "cradle", "crafter", "crafty", "cramp", "crane", "cranial", "cranium", "crank", "crate",
  "crave", "craving", "crayon", "crazed", "crazily", "crazy", "creamed", "creamer", "crease", "create", "credit", "creed",
  "creme", "creole", "crepe", "crept", "crested", "crevice", "crewman", "crib", "cricket", "cried", "crier", "crimp",
  "crimson", "cringe", "crinkle", "crinkly", "crisped", "crisply", "crispy", "critter", "croak", "crock", "crook", "croon",
  "crop", "cross", "crouch", "crouton", "crowbar", "crowd", "crown", "crucial", "crudely", "cruelly", "cruelty", "crumb",
  "crummy", "crumpet", "crunchy", "crushed", "crusher", "crust", "crux", "crying", "cryptic", "crystal", "cube", "cubical",
  "cubicle", "cuddle", "cuddly", "culprit", "culture", "cupcake", "cupid", "cupped", "cupping", "curable", "curator", "curdle",
  "cure", "curfew", "curing", "curled", "curler", "curling", "curly", "curry", "curse", "cursive", "cursor", "curtain",
  "curtly", "curtsy", "curve", "curvy", "cushy", "cusp", "cussed", "custard", "custody", "customs", "cut", "cycle",
  "cyclic", "cycling", "cyclist", "cymbal", "dab", "dad", "dagger", "daily", "dainty", "dairy", "daisy", "dance",
  "dancing", "dander", "dandy", "danger", "dangle", "dares", "darkish", "darling", "darn", "dart", "dash", "data",
  "dating", "dawdler", "dawn", "daybed", "daycare", "daylong", "dayroom", "daytime", "dazzler", "deacon", "dealer", "dealing",
  "dealt", "dean", "debate", "debit", "debrief", "debtor", "debug", "debunk", "decade", "decaf", "decal", "decay",
  "deceit", "decency", "decent", "decibel", "decimal", "deck", "decline", "decode", "decoy", "decree", "deduce", "deduct",
  "deed", "deem", "deepen", "deeply", "deface", "defame", "default", "defeat", "defense", "defiant", "defile", "define",
  "deflate", "defog", "defraud", "defrost", "deftly", "defuse", "defy", "degree", "deity", "delay", "delete", "delouse",
  "delta", "deluge", "deluxe", "demise", "demote", "denial", "denim", "denote", "dense", "density", "dental", "dentist",
  "denture", "deny", "depict", "deplete", "deploy", "deport", "depose", "depress", "deprive", "depth", "deputy", "derail",
  "derby", "derived", "deserve", "desktop", "despair", "despise", "despite", "destiny", "detail", "detest", "detract", "deuce",
  "devalue", "deviant", "deviate", "device", "devious", "devotee", "diagram", "dial", "diaper", "diary", "dice", "dicing",
  "dictate", "dig", "dill", "dilute", "dime", "dimly", "dimmed", "dimmer", "dimness", "dimple", "diner", "dingbat",
  "dinghy", "dingo", "dingy", "dining", "dinner", "diocese", "dioxide", "diploma", "dipped", "dipper", "dipping", "disarm",
  "disband", "discard", "discern", "discuss", "disdain", "dish", "disjoin", "disk", "dislike", "dismay", "dismiss", "disobey",
  "disown", "display", "dispose", "dispute", "disrupt", "distant", "distill", "distort", "ditch", "ditto", "ditzy", "divided",
  "diving", "dizzy", "doable", "docile", "dock", "dodge", "dodgy", "doily", "doing", "dole", "dollar", "dollop",
  "dolly", "dolphin", "domain", "donated", "donator", "donor", "donut", "doodle", "doorman", "doormat", "doorway", "doozy",
  "dork", "dorsal", "dosage", "dose", "dotted", "douche", "dove", "down", "dowry", "doze", "drab", "drained",
  "drainer", "drank", "drapery", "drastic", "draw", "dreaded", "dreamt", "dreamy", "dreary", "drench", "dress", "drew",
  "dribble", "dried", "drier", "drift", "driller", "drippy", "driven", "driver", "driving", "drizzle", "drizzly", "drone",
  "drool", "droop", "dropbox", "droplet", "dropout", "dropper", "drove", "drown", "drudge", "drum", "dry", "dubbed",
  "duchess", "ducking", "ducky", "duct", "dude", "duffel", "dugout", "duh", "duke", "duller", "duly", "dumping",
  "duo", "dupe", "duplex", "durable", "durably", "duress", "during", "dusk", "dust", "dutiful", "duty", "duvet",
  "dwarf", "dweeb", "dwelled", "dweller", "dwindle", "dynamic", "dynasty", "each", "eagle", "earache", "eardrum", "earflap",
  "earful", "earlobe", "early", "earmark", "earmuff", "earring", "earshot", "earthen", "earthly", "earthy", "earwig", "easeful",
  "easel", "easiest", "easily", "easing", "easter", "eatable", "eaten", "eatery", "eating", "eats", "ebay", "ebony",
  "ebook", "ecard", "echo", "eclair", "eclipse", "ecology", "economy", "edge", "edging", "edgy", "edition", "editor",
  "eel", "effects", "effort", "egging", "eggnog", "egotism", "either", "eject", "elastic", "elated", "elbow", "elderly",
  "eldest", "elevate", "eleven", "elf", "elite", "elitism", "elixir", "elk", "ellipse", "elm", "elope", "elude",
  "elusive", "elves", "email", "embargo", "embark", "embassy", "ember", "emblaze", "emblem", "embody", "emboss", "emcee",
  "emerald", "emit", "emote", "emotion", "empathy", "emperor", "empower", "emptier", "empty", "emu", "enable", "enamel",
  "enclose", "encode", "encore", "encrust", "encrypt", "ended", "ending", "endless", "endnote", "endorse", "energy", "engaged",
  "engine", "engorge", "engross", "engulf", "enhance", "enjoyer", "enrage", "enrich", "enroll", "enslave", "ensnare", "ensure",
  "entail", "entire", "entitle", "entity", "entomb", "entrap", "entree", "entrust", "entwine", "envious", "envoy", "envy",
  "enzyme", "epic", "episode", "equal", "equate", "equator", "equinox", "equity", "erased", "eraser", "erasure", "errand",
  "errant", "erratic", "error", "erupt", "eskimo", "esquire", "essay", "essence", "estate", "etching", "eternal", "ethanol",
  "ether", "ethics", "evacuee", "evade", "evasion", "evasive", "even", "evict", "evident", "evil", "evoke", "evolve",
  "exact", "exalted", "example", "excess", "exclaim", "exclude", "excuse", "exert", "exes", "exhale", "exhaust", "exhume",
  "exile", "exit", "exodus", "expand", "expanse", "expel", "expend", "expert", "expire", "explain", "explode", "exploit",
  "explore", "expose", "express", "extent", "extinct", "extras", "extrude", "fable", "fabric", "faceted", "facial", "facing",
  "faction", "factoid", "factor", "factual", "faculty", "fade", "fading", "failing", "falcon", "fall", "false", "falsify",
  "fame", "family", "famine", "fanatic", "fancied", "fancy", "fanfare", "fang", "fanning", "fantasy", "fascism", "faster",
  "fasting", "faucet", "favored", "fax", "feast", "federal", "fedora", "feeble", "feed", "feel", "feisty", "feline",
  "femur", "fence", "fencing", "fender", "ferment", "ferret", "ferris", "ferry", "fervor", "fester", "festive", "fetal",
  "fetch", "fever", "fiber", "fiction", "fiddle", "fidgety", "fifteen", "fifth", "fifty", "figment", "figure", "filing",
  "filled", "filler", "filling", "film", "filter", "filth", "finale", "finally", "finance", "finch", "finer", "finicky",
  "finite", "finless", "finlike", "fit", "five", "flaccid", "flagman", "flail", "flakily", "flaky", "flame", "flanked",
  "flap", "flaring", "flashy", "flask", "flatbed", "flatly", "flatten", "flattop", "fled", "fleshed", "fleshy", "flick",
  "flier", "flight", "flinch", "fling", "flint", "flip", "flirt", "float", "flock", "flop", "floral", "florist",
  "floss", "flyable", "flyaway", "flyer", "flying", "flyover", "foam", "foe", "fog", "foil", "folic", "folk",
  "follow", "fondly", "fondue", "font", "food", "fool", "footage", "footer", "footing", "footman", "footpad", "footsie",
  "fossil", "foster", "founder", "fox", "foyer", "fragile", "frail", "frame", "framing", "frantic", "frayed", "fraying",
  "frays", "freebee", "freebie", "freedom", "freeing", "freely", "freeway", "freight", "french", "frenzy", "fresh", "fretful",
  "fretted", "friday", "fridge", "fried", "friend", "frill", "fringe", "frisbee", "frisk", "fritter", "frolic", "from",
  "front", "frosted", "frosty", "froth", "frown", "frozen", "fruit", "frying", "gab", "gaffe", "gag", "gaining",
  "gains", "gala", "gallery", "galley", "gallon", "gallows", "galore", "game", "gaming", "gamma", "gander", "gangly",
  "gangway", "gap", "garage", "garbage", "garden", "gargle", "garland", "garlic", "garment", "garnet", "garnish", "garter",
  "gas", "gating", "gauging", "gauze", "gave", "gawk", "gazing", "gear", "gecko", "geek", "geiger", "gem",
  "gender", "generic", "genre", "gentile", "gently", "gents", "geology", "gerbil", "gestate", "gesture", "getaway", "getting",
  "getup", "giant", "giblet", "giddily", "giddy", "gift", "giggle", "giggly", "gigolo", "gilled", "gills", "gimmick",
  "girdle", "given", "giver", "giving", "gizmo", "gizzard", "glacial", "glacier", "glade", "gladly", "glamour", "glance",
  "glare", "glaring", "glass", "glazing", "gleeful", "glider", "gliding", "glimmer", "glimpse", "glisten", "glitch", "glitter",
  "glitzy", "gloater", "gloomy", "glorify", "glory", "gloss", "glove", "glowing", "glucose", "glue", "gluten", "glutton",
  "gnarly", "gnat", "goal", "goes", "goggles", "going", "golf", "goliath", "gonad", "gondola", "gone", "gong",
  "good", "gooey", "goofy", "google", "goon", "gopher", "gore", "gorged", "gory", "gosling", "gossip", "gothic",
  "gotten", "gout", "gown", "grab", "graded", "grader", "grading", "grafted", "grain", "grandly", "grandma", "grandpa",
  "granite", "granny", "granola", "grant", "grape", "graph", "grapple", "grasp", "grass", "gratify", "grating", "gravel",
  "graves", "gravity", "gravy", "gray", "grazing", "greedy", "green", "greeter", "grew", "grid", "grief", "grill",
  "grimace", "grime", "grimy", "grinch", "grip", "gristle", "grit", "groggy", "groin", "groom", "groove", "groovy",
  "grope", "ground", "grouped", "grout", "grove", "grower", "growing", "growl", "grub", "grudge", "gruffly", "grumble",
  "grumbly", "grunge", "grunt", "guide", "guiding", "guise", "gulf", "gully", "gulp", "gumball", "gumdrop", "gumming",
  "gummy", "gurgle", "guru", "gush", "gusto", "gusty", "gutless", "guts", "gutter", "guy", "guzzler", "habitat",
  "hacked", "hacker", "hacking", "hacksaw", "had", "haggler", "haiku", "half", "halogen", "halt", "halved", "halves",
  "hamlet", "hammock", "hamper", "hamster", "handbag", "handed", "handful", "handgun", "handled", "handler", "handoff", "handsaw",
  "handset", "hangout", "hangup", "hankie", "hanky", "happier", "happily", "happy", "harbor", "hardhat", "hardly", "hardy",
  "harmful", "harmony", "harness", "harpist", "harsh", "harvest", "hash", "hassle", "haste", "hastily", "hasty", "hatbox",
  "hatchet", "hate", "hatless", "hatred", "haunt", "haven", "hazard", "hazily", "hazing", "hazy", "headed", "header",
  "heading", "headset", "headway", "heap", "heat", "heave", "heavily", "heaving", "hedge", "hedging", "hefty", "helium",
  "helmet", "helper", "helpful", "helping", "hemlock", "hence", "henna", "herald", "herbal", "herbs", "hermit", "heroics",
  "heroism", "herring", "herself", "hertz", "hexagon", "hubcap", "huddle", "huff", "hug", "hula", "hulk", "hull",
  "human", "humble", "humbly", "humid", "humming", "hummus", "humped", "humvee", "hunger", "hungry", "hunk", "hunter",
  "hunting", "hurdle", "hurled", "hurler", "hurling", "hurray", "hurried", "hurry", "hurt", "husband", "hush", "husked",
  "hut", "hybrid", "hydrant", "hyphen", "ice", "iciness", "icing", "icky", "icon", "icy", "ideally", "idiocy",
  "idiom", "idly", "igloo", "ignore", "iguana", "image", "imaging", "imitate", "immerse", "impale", "impart", "impeach",
  "impish", "implant", "implode", "imply", "impose", "impound", "imprint", "improve", "impulse", "impure", "iodine", "iodize",
  "ion", "ipad", "iphone", "ipod", "irate", "irk", "iron", "islamic", "isotope", "issue", "issuing", "italics",
  "item", "itunes", "ivory", "ivy", "jab", "jackal", "jacket", "jackpot", "jailer", "jam", "janitor", "january",
  "jargon", "jarring", "jasmine", "jaunt", "java", "jawed", "jawless", "jawline", "jaws", "jaybird", "jazz", "jeep",
  "jellied", "jelly", "jersey", "jester", "jet", "jiffy", "jigsaw", "jimmy", "jingle", "jinx", "jitters", "jittery",
  "job", "jockey", "jogger", "jogging", "john", "joining", "jolly", "jolt", "jot", "jovial", "joyous", "joyride",
  "judge", "judo", "juggle", "jugular", "juice", "juicy", "jujitsu", "jukebox", "july", "jumble", "jumbo", "jump",
  "june", "junior", "juniper", "junkie", "junkman", "jurist", "juror", "jury", "justice", "justify", "justly", "kabob",
  "karaoke", "karate", "karma", "kebab", "keenly", "keep", "keg", "kelp", "kennel", "kept", "kettle", "kick",
  "kiln", "kilt", "kimono", "kindle", "kindly", "kindred", "kinetic", "kinfolk", "king", "kinship", "kinsman", "kisser",
  "kissing", "kitchen", "kite", "kitten", "kitty", "kiwi", "kleenex", "knee",
] as const

export const WORDLIST_SIZE = DICEWARE_WORDS.length

// Injectable randomness: fills the provided Uint32Array with random values.
// Defaults to crypto.getRandomValues; tests inject deterministic sequences.
export type RandomBytes = (array: Uint32Array) => Uint32Array

const defaultRandomBytes: RandomBytes = (array) => {
  crypto.getRandomValues(array)
  return array
}

/**
 * Pick `count` words from `list` using cryptographically-strong randomness.
 * One 32-bit draw per word; index = draw mod list.length. Immutable: returns a
 * new array and never mutates `list`.
 */
export function pickWords(
  list: readonly string[],
  count: number,
  randomBytes: RandomBytes = defaultRandomBytes,
): string[] {
  if (list.length === 0 || count <= 0) return []
  const n = Math.floor(count)
  const draws = randomBytes(new Uint32Array(n))
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    out.push(list[draws[i] % list.length])
  }
  return out
}

/** Entropy in bits for picking `count` words from a list of `listSize`. */
export function entropyBits(listSize: number, count: number): number {
  if (listSize <= 1 || count <= 0) return 0
  return Math.round(count * Math.log2(listSize) * 10) / 10
}

/** Pick a random integer in [0, max) using one crypto draw. */
export function randomInt(
  max: number,
  randomBytes: RandomBytes = defaultRandomBytes,
): number {
  if (max <= 0) return 0
  const draw = randomBytes(new Uint32Array(1))
  return draw[0] % max
}

export interface PassphraseOptions {
  wordCount: number
  separator: string
  capitalize: boolean
  includeNumber: boolean
}

const NUMBER_RANGE = 100 // appended number in [0, 99]

function capitalizeWord(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * Build a full passphrase. All randomness (word picks and the appended number)
 * comes from the injected `randomBytes`. Immutable throughout.
 */
export function buildPassphrase(
  opts: PassphraseOptions,
  randomBytes: RandomBytes = defaultRandomBytes,
): string {
  const words = pickWords(DICEWARE_WORDS, opts.wordCount, randomBytes).map(
    (w) => (opts.capitalize ? capitalizeWord(w) : w),
  )
  let result = words.join(opts.separator)
  if (opts.includeNumber) {
    result += String(randomInt(NUMBER_RANGE, randomBytes))
  }
  return result
}

/** Total entropy of a passphrase config (words + optional appended number). */
export function passphraseEntropy(opts: PassphraseOptions): number {
  const base = entropyBits(DICEWARE_WORDS.length, opts.wordCount)
  const numberBits = opts.includeNumber ? Math.log2(NUMBER_RANGE) : 0
  return Math.round((base + numberBits) * 10) / 10
}
