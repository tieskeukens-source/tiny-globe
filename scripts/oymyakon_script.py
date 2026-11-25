import json
O, B, G, R = '#E8622C', '#2F6FB5', '#4E9A6B', '#C0392B'
MOS, OYM, YAK = [37.62, 55.75], [142.79, 63.46], [129.73, 62.03]
shots = []
def S(t, text, props=None, cam=None, offset=None, pops=()):
    d = {'type': t, 'text': text, 'props': props or {}, 'pops': list(pops)}
    if cam: d['cam'] = dict(zip('xyz', cam))
    if offset: d['offset'] = offset
    shots.append(d)
def P(w, t, x=None, y=None, k=O, groot=False):
    d = {'woord': w, 'tekst': t, 'kleur': k}
    if x is not None: d['x'] = x
    if y is not None: d['y'] = y
    if groot: d['stijl'] = 'groot'
    return d
reis = lambda fase, van=MOS, naam='Moscow': {'van': van, 'naar': OYM, 'vanNaam': naam, 'naarNaam': 'Oymyakon', 'fase': fase}

# ---- HOOK ----
S('closeup', "Imagine stepping outside, and within seconds, your eyelashes start to freeze.", {'pose': 'cold', 'item': 'frost'}, pops=[P('eyelashes', '❄ frozen eyelashes', 1350, 300, B)])
S('closeup', "Your breath hangs in the air like thick smoke.", {'pose': 'cold'}, pops=[P('smoke', 'breath = smoke', 1350, 300, B)])
S('closeup', "One photographer who visited said his own spit froze into tiny needles that pricked his lips.", {'pose': 'shrug', 'item': 'frost'}, pops=[P('needles', 'spit → ice needles', 1350, 280, B)])
S('dorp', "And the cars on the street? Their engines are running. But nobody is inside.", {'len': 9, 'stilstaan': True}, cam=(1100, 720, 1.5), pops=[P('nobody', 'nobody inside?!', y=150)])
S('thermo', "This is just a normal winter day in Oymyakon. Minus fifty degrees.", {'stappen': [{'woord': 'minus', 'waarde': -50, 'label': 'normal winter day'}]}, pops=[P('minus', '-50°C', 1500, 220, B, True)])
S('closeup', "So how do people live here? What do they eat? How do kids get to school? And why would anyone stay?", {'pose': 'think'},
  pops=[P('eat', 'what do they eat?', 1350, 200, G), P('school', 'school?', 1350, 400, B), P('stay', 'why stay?', 1350, 600, O)])
S('reis', "Let's find out. This is Russia, the biggest country in the world.", reis('start'), pops=[P('biggest', '#1 biggest country', y=960)])

S('reis', "In this video, we'll follow a full day in the coldest village on Earth. From the first step outside, to the last hot meal at night.", reis('start'), cam=(960, 540, 1.1),
  pops=[P('full day', '24 hours in Oymyakon', y=960, k=B)])
# ---- WAAR ----
S('reis', "We start in Moscow, and travel east. Far, far east. More than five thousand kilometres.", reis('reis'),
  pops=[P('far, far', '→ EAST', 1500, 960, B), P('five thousand', '5,300 km', y=960)])
S('reis', "That's almost as far as flying from London to New York. And we're still in the same country.", reis('aankomst'), pops=[P('london', '≈ London → New York', y=960, k=B), P('same country', 'same country!', y=150)])
S('reis', "Until we reach a tiny village in eastern Siberia. Oymyakon.", reis('aankomst'), cam=(1560, 330, 1.8), pops=[P('tiny', 'tiny village', y=930, k=G)])
S('reis', "The nearest big city is Yakutsk. From there, the drive can take one or two days.", reis('reis', YAK, 'Yakutsk'), cam=(1500, 360, 1.8),
  pops=[P('drive', '🚗 1–2 days', y=930)])
S('reis', "Yakutsk is home to around two hundred and seventy thousand people. It's often called the coldest city on Earth.", reis('start', YAK, 'Yakutsk'), cam=(1450, 380, 1.6),
  pops=[P('seventy', '~270,000 people', y=930, k=B), P('coldest city', 'coldest city', y=150)])
S('weg', "And in winter, planes can't land in Oymyakon. So the road is the main way in.", offset=3, pops=[P('planes', "✈ no winter flights", y=150, k=R)])
S('weg', "Part of the trip follows a famous road, the Kolyma Highway.", pops=[P('kolyma', 'Kolyma Highway', y=150, k=G)])
S('weg', "Many people call it the Road of Bones. Prisoners from Soviet labour camps started building it in nineteen thirty-two.", offset=6,
  pops=[P('bones', 'Road of Bones', y=150, k=R), P('thirty-two', '1932', 1500, 330, B)])
S('weg', "The work went on until nineteen fifty-three. Many of the workers died there.", offset=12, pops=[P('fifty-three', '1932 – 1953', y=150, k=B)])
S('reis', "Oymyakon itself lies about a hundred kilometres off that road.", reis('aankomst'), cam=(1560, 360, 1.6), pops=[P('hundred', '~100 km off the road', y=930)])
S('dorp', "And about five hundred people call it home.", {'len': 9}, pops=[P('five hundred', '~500 people', y=150)])

# ---- HOE KOUD ----
S('thermo', "Let's put that cold into numbers. Water freezes at zero degrees.", {'stappen': [{'woord': 'zero', 'waarde': 0, 'label': 'water freezes'}]})
S('thermo', "Water freezes at zero. Your freezer at home is about minus eighteen.",
  {'stappen': [{'woord': 'water', 'waarde': 0, 'label': 'water freezes'}, {'woord': 'freezer', 'waarde': -18, 'label': 'your freezer'}]})
S('thermo', "But in January, an average day in Oymyakon is around minus forty-six.",
  {'stappen': [{'woord': 'but', 'waarde': -18, 'label': 'your freezer'}, {'woord': 'minus forty', 'waarde': -46, 'label': 'January average'}]})
S('thermo', "And on the sixth of February, nineteen thirty-three, the thermometer showed minus sixty-seven point seven.",
  {'stappen': [{'woord': 'and', 'waarde': -46, 'label': 'January average'}, {'woord': 'sixty-seven', 'waarde': -67.7, 'label': 'record: -67.7°'}]},
  pops=[P('february', '6 Feb 1933', 1500, 200, B)])
S('closeup', "That's the coldest temperature ever officially measured in a place where people live all year.", {'pose': 'shrug'}, pops=[P('coldest', 'coldest inhabited place', 1300, 220, B)])
S('closeup', "Only one other town comes this close. Verkhoyansk, also in Siberia, shares the record.", {'pose': 'point'}, pops=[P('verkhoyansk', 'Verkhoyansk', 1350, 260, O)])
S('thermo', "In twenty eighteen, the village put up a brand new digital thermometer. It broke after showing minus sixty-two.",
  {'stappen': [{'woord': 'thermometer', 'waarde': -40, 'label': 'new thermometer'}, {'woord': 'minus', 'waarde': -62, 'label': '-62°... 💥'}]},
  pops=[P('twenty eighteen', '2018', 1500, 200, B), P('broke', 'BROKE!', 1500, 380, R)])
S('closeup', "Some locals said their own thermometers showed even lower.", {'pose': 'shrug'}, pops=[P('lower', 'even lower?', 1350, 260, B)])
S('dorp', "And here's the crazy part. From late October until the middle of March, it has never been above zero here. Not even once.", {'len': 9, 'stilstaan': True},
  pops=[P('october', 'Oct → Mar', y=150, k=B), P('never', 'never above 0°', y=300, k=R)])

# ---- WAAROM ----
S('vallei', "But why is it so cold here? There are a few reasons.", pops=[P('why', 'WHY?', y=200, k=O, groot=True)])
S('reis', "First, it's far to the north, and very far from the sea. Oceans help keep places milder in winter. But Oymyakon is deep inside the biggest landmass on Earth.",
  reis('aankomst'), pops=[P('far from the sea', 'far from the sea 🌊', y=150, k=B), P('deep inside', 'deep inland', y=960, k=O)])
S('zon', "Second, the winter days are very short. The sun is only up for about three hours. So the ground hardly gets any heat.", {'uren': 3},
  pops=[P('three hours', '~3 hours of daylight', 1500, 200, O)])
S('vallei', "Third, look at the shape of the land. Oymyakon sits in a valley, with mountains all around it.", pops=[P('valley', 'valley', y=930, k=G)])
S('vallei', "Cold air is heavy. It slides down the mountains, and gets trapped at the bottom. Right where the village is.", {'lucht': True},
  pops=[P('heavy', 'cold air sinks ↓', y=150, k=B)])
S('vallei', "And there's usually very little wind. So the cold air just sits there, getting colder and colder.", {'stil': True}, pops=[P('wind', 'no wind', y=150, k=O)])

S('closeup', "A local guide once said that this dry, still cold is easier to handle. With wind, even minus thirty-five would be a disaster.", {'pose': 'point'},
  pops=[P('still', 'still air = OK', 1350, 220, G), P('wind', 'wind = disaster', 1350, 420, R)])
# ---- OCHTEND ----
S('binnen', "So what is a normal day like here? Let's start in the morning. Inside the houses, it's actually warm.", {'pose': 'wave'}, pops=[P('warm', 'inside: warm 🔥', 1450, 200)])
S('centrale', "Most of that heat comes from a coal-burning heating plant. It runs day and night, pumping hot water through pipes to the homes.",
  pops=[P('coal', 'coal heating plant', y=150), P('day and night', '24/7', 1600, 330, B)])
S('centrale', "Every morning, a digger brings fresh coal to the plant, and carries away the ash. Without it, the whole village would freeze.",
  pops=[P('coal', 'fresh coal', y=150), P('freeze', 'no heat = frozen village', y=300, k=R)])
S('binnen', "But going outside takes some work. First, a thick fur hat. Then a scarf over your face. A heavy coat. And warm boots, often made from reindeer fur.",
  {'items': [{'woord': 'hat', 'ding': 'muts'}, {'woord': 'scarf', 'ding': 'sjaal'}, {'woord': 'coat', 'ding': 'jas'}, {'woord': 'boots', 'ding': 'laarzen'}]},
  pops=[P('hat', 'fur hat', 1450, 200), P('scarf', 'scarf', 1450, 330, B), P('coat', 'heavy coat', 1450, 460, G), P('boots', 'reindeer boots', 1450, 590)])
S('closeup', "Locals have a rule for the cold. Cover your face, and warm your nose with your hands. But never rub it.", {'pose': 'cold', 'item': 'neus'},
  pops=[P('never', "✗ don't rub!", 1350, 280, R)])
S('dorp', "Then there's the car. Some people keep their cars in heated garages.", {'len': 9, 'stilstaan': True}, cam=(1100, 720, 1.5), pops=[P('garages', 'heated garage', y=150)])
S('dorp', "Others simply leave the engine running all day. Because in this cold, a car that stops might not start again.", {'len': 9, 'stilstaan': True}, cam=(1150, 740, 1.7),
  pops=[P('running', 'engine ON all day', y=150), P('might not', "✗ won't start", y=300, k=R)])
S('vuur', "And some people even light a small fire under the car, just to warm it up before driving.", {'auto': True}, pops=[P('fire', '🔥 under the car?!', y=150)])

# ---- WATER & WC ----
S('wc', "Now, here's something most of us never think about. Where do you go to the toilet?", pops=[P('toilet', '🚽?', 960, 200, B)])
S('stelten', "The ground here is frozen all year round. It's called permafrost. Water pipes in the ground would freeze and break.", {'fase': 'buis'},
  pops=[P('permafrost', 'PERMAFROST', y=150, k=B), P('break', 'pipes break', 1500, 330, R)])
S('stelten', "In this region, the frozen ground can go down hundreds of metres. It never thaws.", {'fase': 'grond'}, pops=[P('hundreds', '100s of metres deep', y=150, k=B)])
S('wc', "So most toilets are outside. A small wooden hut, with a hole in the ground. Even at minus fifty.", pops=[P('outside', 'outside toilet', y=150), P('minus', '-50°C', 1500, 330, B)])
S('ijs', "And water? In winter, people cut big blocks of ice from the frozen river.", pops=[P('ice', 'ice blocks', y=150, k=B)])
S('ijs', "The blocks are taken back to the village and melted. That's drinking water.", offset=8, pops=[P('melted', 'melt → drink 💧', y=150, k=B)])

# ---- ETEN ----
S('markt', "What about food? Almost nothing grows in this frozen ground. So people mostly eat meat and fish.", pops=[P('nothing', 'no crops', y=150, k=R), P('meat', 'meat + fish', y=300, k=O)])
S('markt', "At the outdoor market, fish are sold standing straight up in buckets. Frozen solid. No fridge needed.", cam=(960, 620, 1.3),
  pops=[P('frozen', 'frozen solid', y=150, k=B), P('fridge', 'no fridge needed', y=300, k=G)])
S('eten', "One local favourite is stroganina. Thin, curly slices of raw frozen fish.", {'items': [{'woord': 'stroganina', 'ding': 'stroganina'}]},
  pops=[P('stroganina', 'stroganina', 1300, 200)])
S('eten', "People also eat a lot of reindeer meat, horse meat, and warm meat soup.",
  {'items': [{'woord': 'stroganina', 'ding': 'stroganina'}, {'woord': 'reindeer', 'ding': 'vlees'}, {'woord': 'horse', 'ding': 'paard'}, {'woord': 'soup', 'ding': 'soep'}]},
  pops=[P('reindeer', 'reindeer', 820, 200, O), P('horse', 'horse', 1200, 330, B), P('soup', 'soup', 1560, 200, G)])
S('closeup', "As one local put it: the meat is a must.", {'pose': 'point'}, pops=[P('must', '"meat is a must"', 1350, 260)])

# ---- DIEREN ----
S('dieren', "The animals here are tough too. Yakutian horses are short and stocky, with very thick, shaggy fur.", {'dier': 'paard'},
  pops=[P('yakutian', 'Yakutian horse', y=150), P('thick', 'thick fur', y=300, k=B)])
S('dieren', "They also have a thick layer of fat. And their hooves help protect their feet from the icy ground.", {'dier': 'paard'}, cam=(900, 700, 1.4),
  pops=[P('fat', '+ fat layer', y=150, k=O)])
S('dieren', "And the cows? Farmers put special covers on their udders, so they don't freeze.", {'dier': 'koe'}, pops=[P('covers', 'udder cover 🧦', y=150, k=B)])
S('dieren', "And their milk is extra rich. It can have seven or eight percent fat. That's a lot of energy for the long winter.", {'dier': 'koe'}, cam=(900, 700, 1.3),
  pops=[P('seven', '7–8% fat 🥛', y=150)])
S('dieren', "Even the dogs are made for this. The local laika dogs have thick, fluffy coats.", {'dier': 'hond'}, pops=[P('laika', 'laika dog', y=150, k=G)])
S('bron', "In winter, farmers bring their cows to drink at a warm spring that doesn't freeze. Then it's straight back to a warm, insulated barn.",
  pops=[P('warm spring', 'warm spring', y=150, k=G), P('barn', 'warm barn', y=300)])

S('bron', "The water is only a few degrees above freezing. But here, that's warm enough to stay liquid all winter.", cam=(980, 820, 1.3), pops=[P('few degrees', 'just above 0°C', y=150, k=B)])
# ---- SCHOOL ----
S('school', "And the kids? They still go to school. Even when it's minus forty or colder.", {'len': 8}, cam=(960, 300, 1.3), pops=[P('minus', '-40°C', 700, 200, B, True)])
S('school', "In winter, it's often still dark when they walk there.", {'len': 7}, offset=2, pops=[P('dark', '🌙 still dark', 560, 150, B)])
S('school', "They walk there with their parents. And often, a dog comes along too.", {'len': 7}, offset=1, pops=[P('dog', '🐕 + parents', 560, 150, G)])
S('school', "The school only closes when it gets colder than about minus fifty-two.", {'len': 7, 'aangekomen': True}, cam=(1300, 560, 1.4),
  pops=[P('minus', '-52°C', 700, 200, B, True)])

S('school', "For older kids, the limit is even lower. They only stay home at around minus fifty-six.", {'len': 7, 'aangekomen': True}, cam=(1300, 560, 1.4),
  pops=[P('minus', '-56°C', 700, 200, B, True)])
# ---- KAPOT ----
S('kapot', "The cold also breaks everyday things. Pen ink freezes, so writing outside is almost impossible.", {'ding': 'pen'}, pops=[P('freezes', 'ink freezes', y=150, k=B)])
S('closeup', "Glasses can freeze to your face.", {'pose': 'cold', 'item': 'bril'}, pops=[P('glasses', 'frozen glasses', 1350, 260, B)])
S('kapot', "And phone batteries drain very fast. One moment it's full. The next, it's dead.", {'ding': 'telefoon'}, pops=[P('dead', 'dead 💀', 1500, 200, R)])
S('closeup', "So people don't stay outside longer than they have to.", {'pose': 'shrug'}, pops=[P('longer', 'stay inside', 1350, 260)])

S('ijs', "So what do adults do for work? Jobs are hard to find. Many people breed reindeer, hunt, or go ice fishing.", offset=4,
  pops=[P('jobs', 'few jobs', y=150, k=R), P('ice fishing', 'reindeer · hunting · ice fishing', y=300, k=B)])
S('markt', "Trading fur is also an important part of life here. And in this cold, fur isn't about fashion. It's about staying alive.",
  pops=[P('fur', 'fur trade', y=150), P('alive', 'not fashion → survival', y=300, k=B)])
# ---- GROND ----
S('stelten', "Even building a house is tricky. In summer, the top layer of ground thaws and turns soft.", {'fase': 'dooi'}, pops=[P('soft', 'top layer thaws', y=150, k=O)])
S('stelten', "So many buildings stand on stilts, drilled deep into the frozen ground. That way, they don't sink or tilt.", {'fase': 'palen'},
  pops=[P('stilts', 'on stilts', y=150, k=G), P('sink', "won't sink", 1500, 330, B)])
S('vuur', "Digging is hard too. To dig a grave, people light a fire to thaw the ground. They dig a little, then light another fire. It can take days.",
  pops=[P('fire', 'fire → thaw → dig', y=150), P('days', 'can take days', y=300, k=R)])

# ---- GESCHIEDENIS ----
S('bron', "So why did anyone settle here in the first place? The answer is in the name.", {'vroeger': True}, pops=[P('name', 'Oymyakon = ?', y=150)])
S('bron', "Oymyakon is often said to mean unfrozen water. Because nearby, there's a spring that doesn't freeze, even in winter.", {'vroeger': True}, cam=(980, 800, 1.4),
  pops=[P('unfrozen', '"unfrozen water"', y=150, k=B)])
S('bron', "In the nineteen twenties and thirties, reindeer herders stopped here, so their animals could drink.", {'vroeger': True},
  pops=[P('twenties', '1920s–30s', y=150), P('reindeer', 'reindeer herders', y=300, k=G)])
S('dorp', "Then the Soviet government wanted these herders to stop moving around. And Oymyakon became a permanent village.", {'len': 9},
  pops=[P('soviet', 'Soviet plan', y=150, k=R), P('permanent', 'permanent village', y=300, k=G)])

S('reis', "During World War Two, an airfield was built in the area. It was part of a route used to fly American planes to the Soviet Union.", reis('aankomst'), cam=(1500, 360, 1.5),
  pops=[P('world war', 'WWII', y=150, k=R), P('american', '✈ USA → USSR', y=930, k=B)])
# ---- ZOMER ----
S('zomer', "But here's the surprise. Oymyakon has summer too. And it can actually get hot.", pops=[P('summer', 'SUMMER!', y=150, k=O)])
S('thermo', "In July, twenty ten, it reached thirty-four point six degrees.",
  {'stappen': [{'woord': 'thirty-four', 'waarde': 34.6, 'label': 'record: +34.6°'}]}, pops=[P('july', 'July 2010', 1500, 200)])
S('thermo', "From the coldest day to the hottest, that's a difference of more than one hundred degrees.",
  {'stappen': [{'woord': 'coldest', 'waarde': -67.7, 'label': '-67.7° (1933)'}, {'woord': 'hottest', 'waarde': 34.6, 'label': '+34.6° (2010)'}]},
  pops=[P('hundred', '100°+ difference', 1450, 300, O)])
S('zon', "And the days get long. Up to around twenty-one hours of daylight.", {'uren': 21, 'zomer': True}, pops=[P('twenty-one', '~21 hours of light', 1500, 200)])
S('zomer', "In June and July, the sun barely sets at all. It is the total opposite of winter.", pops=[P('barely', '☀ barely sets', y=150)])
S('zomer', "Summer is the time to fish, hunt, and get ready for the next winter. Meat is stored in cellars that work like natural freezers.",
  pops=[P('hunt', 'fish + hunt', y=150, k=G), P('natural', 'natural freezer', y=300, k=B)])

S('zomer', "But summer doesn't last long. By late October, it's below zero again, and it stays that way for months.", pops=[P('october', 'late Oct: back below 0°', y=150, k=B)])
# ---- EINDE ----
S('dorp', "So, why do people stay? For many, the answer is simple. This is home. Their family, their animals, their whole life is here.", {'len': 9, 'stilstaan': True},
  pops=[P('home', 'home ❤', y=150)])
S('closeup', "And some visitors travel all the way here on purpose, just to feel the cold for themselves.", {'pose': 'wave'}, pops=[P('visitors', 'tourists!', 1350, 260, G)])
S('bron', "They can ride Yakutian horses, try ice fishing, or even take a dip in the warm spring.", pops=[P('horses', 'ride horses', y=150), P('dip', 'dip in the spring?!', y=300, k=B)])
S('dorp', "There's even a sign in the village that proudly calls it the Pole of Cold.", {'len': 9}, pops=[P('pole', 'POLE OF COLD', y=200, k=B, groot=True)])
S('dorp', "So, what do people in Oymyakon actually do all day? They keep warm. They keep their cars running. They look after their animals.", {'len': 9, 'stilstaan': True}, cam=(1100, 720, 1.4),
  pops=[P('warm', 'keep warm', y=150), P('running', 'cars running', y=290, k=B), P('animals', 'animals', y=430, k=G)])
S('ijs', "They cut ice for water. They fish, they hunt, and they stock up for winter.", pops=[P('ice', 'ice → water', y=150, k=B), P('stock', 'stock up', y=300)])
S('school', "Kids go to school, and adults go to work. Just like anywhere else. Only much, much colder.", {'len': 7, 'aangekomen': True},
  pops=[P('anywhere', 'just like anywhere', y=900, k=G), P('colder', '...but colder', y=150, k=B)])
S('binnen', "And when the day is done, it's back inside. A hot meal, a warm house, and another long night at minus fifty outside.", {'pose': 'stand'},
  pops=[P('hot meal', 'hot meal 🍲', 1450, 200), P('minus', 'outside: -50°C', 1450, 360, B)])
S('dorp', "Life in Oymyakon is hard. But it goes on, one frozen day at a time.", {'len': 9}, pops=[P('frozen', 'one frozen day at a time', y=150, k=B)])
S('reis', "Where should we go next? Tell us in the comments. And see you on the next stop of Tiny Globe.", reis('aankomst'),
  pops=[P('comments', 'next stop? 💬', y=930), P('tiny', 'TINY GLOBE', y=150, k=O, groot=True)])

json.dump({'title': "What Do People in the Coldest Village on Earth Actually Do All Day?", 'voice': 'en-US-AndrewNeural', 'rate': '-5%', 'scenes': shots},
          open('videos/oymyakon.json', 'w'), indent=1, ensure_ascii=False)
words = sum(len(s['text'].split()) for s in shots)
print(len(shots), 'shots', words, 'woorden', round(words / 160, 1), 'min (schatting)')
